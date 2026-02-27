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
      const signals = await service.getChainSignals(createChainId('chain-001'));
      expect(signals.length).toBeGreaterThan(0);
      expect(signals.every((s) => s.chainLinks.includes('chain-001'))).toBe(true);
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
        expect(result.items[i - 1].createdAt).toBeGreaterThanOrEqual(
          result.items[i].createdAt
        );
      }
    });

    it('respects pagination offset', async () => {
      const firstPage = await service.getRecentSignals({
        pagination: { limit: 2, offset: 0 },
      });
      const secondPage = await service.getRecentSignals({
        pagination: { limit: 2, offset: 2 },
      });

      expect(firstPage.items[0].id).not.toBe(secondPage.items[0]?.id);
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
    it('returns a success result with a new signal ID', async () => {
      const result = await service.illuminate({
        content: { text: 'Test signal' },
        context: { topics: ['test'] },
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toMatch(/^sig-\d+$/);
      }
    });

    it('generates IDs with expected format', async () => {
      const result = await service.illuminate({
        content: { text: 'Test signal' },
        context: { topics: ['test'] },
      });

      if (result.ok) {
        // IDs should follow the sig-timestamp pattern
        expect(result.value).toMatch(/^sig-\d+$/);
        // Timestamp should be recent (within last minute)
        const timestamp = parseInt(result.value.replace('sig-', ''), 10);
        expect(Date.now() - timestamp).toBeLessThan(60000);
      }
    });
  });
});
