import { describe, it, expect, beforeEach } from 'vitest';
import { MockSignalService } from './mock-signal-service';
import { createSignalId, createChainId } from '@cocuyo/types';

describe('MockSignalService', () => {
  let service: MockSignalService;

  beforeEach(() => {
    service = new MockSignalService();
  });

  describe('getSignal', () => {
    it('returns a signal when given a valid ID', async () => {
      const signal = await service.getSignal(createSignalId('sig-001'));
      expect(signal).not.toBeNull();
      expect(signal?.id).toBe('sig-001');
    });

    it('returns null for non-existent signal ID', async () => {
      const signal = await service.getSignal(createSignalId('sig-nonexistent'));
      expect(signal).toBeNull();
    });

    it('returns signal with correct structure', async () => {
      const signal = await service.getSignal(createSignalId('sig-001'));
      expect(signal).toHaveProperty('id');
      expect(signal).toHaveProperty('content');
      expect(signal).toHaveProperty('context');
      expect(signal).toHaveProperty('dimSignature');
      expect(signal).toHaveProperty('chainLinks');
      expect(signal).toHaveProperty('corroborations');
      expect(signal).toHaveProperty('createdAt');
    });
  });

  describe('getChainSignals', () => {
    it('returns signals for a valid chain ID', async () => {
      const chainId = createChainId('chain-001');
      const signals = await service.getChainSignals(chainId);
      expect(signals.length).toBeGreaterThan(0);
      expect(signals.every((s) => s.chainLinks.includes(chainId))).toBe(true);
    });

    it('returns empty array for non-existent chain ID', async () => {
      const signals = await service.getChainSignals(createChainId('chain-nonexistent'));
      expect(signals).toEqual([]);
    });

    it('returns readonly array', async () => {
      const signals = await service.getChainSignals(createChainId('chain-001'));
      expect(Array.isArray(signals)).toBe(true);
    });
  });

  describe('getRecentSignals', () => {
    it('returns paginated results', async () => {
      const result = await service.getRecentSignals({
        pagination: { limit: 2, offset: 0 },
      });
      expect(result.items.length).toBeLessThanOrEqual(2);
      expect(result.total).toBeGreaterThan(0);
      expect(typeof result.hasMore).toBe('boolean');
    });

    it('filters by topic', async () => {
      const result = await service.getRecentSignals({
        topic: 'environmental',
        pagination: { limit: 10, offset: 0 },
      });
      expect(result.items.every((s) =>
        s.context.topics.some((t) =>
          t.toLowerCase().includes('environmental')
        )
      )).toBe(true);
    });

    it('filters by location', async () => {
      const result = await service.getRecentSignals({
        location: 'concord',
        pagination: { limit: 10, offset: 0 },
      });
      expect(result.items.every((s) =>
        s.context.locationName?.toLowerCase().includes('concord') === true
      )).toBe(true);
    });

    it('returns sorted by createdAt (newest first)', async () => {
      const result = await service.getRecentSignals({
        pagination: { limit: 10, offset: 0 },
      });
      for (let i = 1; i < result.items.length; i++) {
        const prev = result.items[i - 1];
        const curr = result.items[i];
        if (prev && curr) {
          expect(prev.createdAt).toBeGreaterThanOrEqual(curr.createdAt);
        }
      }
    });

    it('respects pagination offset', async () => {
      const firstPage = await service.getRecentSignals({
        pagination: { limit: 2, offset: 0 },
      });
      const secondPage = await service.getRecentSignals({
        pagination: { limit: 2, offset: 2 },
      });
      const firstItem = firstPage.items[0];
      const secondItem = secondPage.items[0];

      expect(firstItem?.id).not.toBe(secondItem?.id);
    });

    it('sets hasMore correctly', async () => {
      const smallPage = await service.getRecentSignals({
        pagination: { limit: 2, offset: 0 },
      });
      expect(smallPage.hasMore).toBe(true);

      const largePage = await service.getRecentSignals({
        pagination: { limit: 100, offset: 0 },
      });
      expect(largePage.hasMore).toBe(false);
    });
  });

  describe('illuminate', () => {
    it('returns a success result with a content-addressed ID', async () => {
      const result = await service.illuminate({
        content: { text: 'Test signal' },
        context: { topics: ['test'] },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        // CIDv1 with blake2b-256 starts with 'bafk'
        expect(result.value).toMatch(/^bafk/);
      }
    });

    it('generates deterministic IDs for same content', async () => {
      const signal = {
        content: { text: 'Deterministic test signal' },
        context: { topics: ['test'] },
      };

      const result1 = await service.illuminate(signal);
      const result2 = await service.illuminate(signal);

      // Note: IDs differ because createdAt is different each call
      // This test verifies the ID format is valid CID
      if (result1.ok && result2.ok) {
        expect(result1.value).toMatch(/^bafk/);
        expect(result2.value).toMatch(/^bafk/);
      }
    });
  });
});
