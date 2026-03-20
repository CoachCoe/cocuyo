import { describe, it, expect, beforeEach } from 'vitest';
import { MockChainService } from './mock-chain-service';
import { createChainId } from '@cocuyo/types';

describe('MockChainService', () => {
  let service: MockChainService;

  beforeEach(() => {
    service = new MockChainService();
  });

  describe('getChain', () => {
    it('returns a chain when given a valid ID', async () => {
      const chain = await service.getChain(createChainId('chain-001'));
      expect(chain).not.toBeNull();
      expect(chain?.id).toBe('chain-001');
    });

    it('returns null for non-existent chain ID', async () => {
      const chain = await service.getChain(createChainId('chain-nonexistent'));
      expect(chain).toBeNull();
    });

    it('returns chain with correct structure', async () => {
      const chain = await service.getChain(createChainId('chain-001'));
      expect(chain).toHaveProperty('id');
      expect(chain).toHaveProperty('title');
      expect(chain).toHaveProperty('description');
      expect(chain).toHaveProperty('topics');
      expect(chain).toHaveProperty('status');
      expect(chain).toHaveProperty('signalIds');
      expect(chain).toHaveProperty('stats');
      expect(chain).toHaveProperty('createdAt');
      expect(chain).toHaveProperty('updatedAt');
    });

    it('returns chain with valid status', async () => {
      const chain = await service.getChain(createChainId('chain-001'));
      expect(['emerging', 'active', 'established', 'archived']).toContain(
        chain?.status
      );
    });
  });

  describe('getChains', () => {
    it('returns paginated results', async () => {
      const result = await service.getChains({
        pagination: { limit: 2, offset: 0 },
      });
      expect(result.items.length).toBeLessThanOrEqual(2);
      expect(result.total).toBeGreaterThan(0);
      expect(typeof result.hasMore).toBe('boolean');
    });

    it('filters by topic', async () => {
      const result = await service.getChains({
        topic: 'environmental',
        pagination: { limit: 10, offset: 0 },
      });
      expect(result.items.every((c) =>
        c.topics.some((t) => t.toLowerCase().includes('environmental'))
      )).toBe(true);
    });

    it('filters by location', async () => {
      const result = await service.getChains({
        location: 'manchester',
        pagination: { limit: 10, offset: 0 },
      });
      expect(result.items.every((c) =>
        c.location?.toLowerCase().includes('manchester') === true
      )).toBe(true);
    });

    it('filters by status', async () => {
      const result = await service.getChains({
        status: 'active',
        pagination: { limit: 10, offset: 0 },
      });
      expect(result.items.every((c) => c.status === 'active')).toBe(true);
    });

    it('returns sorted by updatedAt (newest first)', async () => {
      const result = await service.getChains({
        pagination: { limit: 10, offset: 0 },
      });
      for (let i = 1; i < result.items.length; i++) {
        const prev = result.items[i - 1];
        const curr = result.items[i];
        if (prev && curr) {
          expect(prev.updatedAt).toBeGreaterThanOrEqual(curr.updatedAt);
        }
      }
    });

    it('respects pagination offset', async () => {
      const firstPage = await service.getChains({
        pagination: { limit: 1, offset: 0 },
      });
      const secondPage = await service.getChains({
        pagination: { limit: 1, offset: 1 },
      });
      const firstItem = firstPage.items[0];
      const secondItem = secondPage.items[0];

      expect(firstItem?.id).not.toBe(secondItem?.id);
    });

    it('returns chain previews with expected fields', async () => {
      const result = await service.getChains({
        pagination: { limit: 1, offset: 0 },
      });
      const preview = result.items[0];

      expect(preview).toHaveProperty('id');
      expect(preview).toHaveProperty('title');
      expect(preview).toHaveProperty('topics');
      expect(preview).toHaveProperty('status');
      expect(preview).toHaveProperty('signalCount');
      expect(preview).toHaveProperty('totalCorroborations');
      expect(preview).toHaveProperty('updatedAt');
    });
  });

  describe('getFeaturedChains', () => {
    it('returns an array of chain previews', async () => {
      const featured = await service.getFeaturedChains();
      expect(Array.isArray(featured)).toBe(true);
      expect(featured.length).toBeGreaterThan(0);
    });

    it('returns at most 5 chains', async () => {
      const featured = await service.getFeaturedChains();
      expect(featured.length).toBeLessThanOrEqual(5);
    });

    it('returns chains sorted by total corroborations', async () => {
      const featured = await service.getFeaturedChains();
      for (let i = 1; i < featured.length; i++) {
        const prev = featured[i - 1];
        const curr = featured[i];
        if (prev && curr) {
          expect(prev.totalCorroborations).toBeGreaterThanOrEqual(curr.totalCorroborations);
        }
      }
    });

    it('returns chain previews with expected structure', async () => {
      const featured = await service.getFeaturedChains();
      const preview = featured[0];

      expect(preview).toHaveProperty('id');
      expect(preview).toHaveProperty('title');
      expect(preview).toHaveProperty('topics');
      expect(preview).toHaveProperty('status');
      expect(preview).toHaveProperty('signalCount');
      expect(preview).toHaveProperty('totalCorroborations');
    });
  });
});
