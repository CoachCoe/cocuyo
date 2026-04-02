import { describe, it, expect } from 'vitest';
import {
  getSignals,
  getChains,
  getChainPreviews,
  getSignalsByChainId,
  getChainTitle,
} from './mock-data';

describe('Mock Data', () => {
  describe('getSignals', () => {
    it('returns a non-empty array', () => {
      const signals = getSignals('en');
      expect(Array.isArray(signals)).toBe(true);
      expect(signals.length).toBeGreaterThan(0);
    });

    it('contains signals with required fields', () => {
      getSignals('en').forEach((signal) => {
        expect(signal).toHaveProperty('id');
        expect(signal).toHaveProperty('content');
        expect(signal).toHaveProperty('context');
        expect(signal).toHaveProperty('dimSignature');
        expect(signal).toHaveProperty('chainLinks');
        expect(signal).toHaveProperty('corroborations');
        expect(signal).toHaveProperty('createdAt');
      });
    });

    it('contains signals with valid content structure', () => {
      getSignals('en').forEach((signal) => {
        expect(signal.content).toHaveProperty('text');
        expect(typeof signal.content.text).toBe('string');
      });
    });

    it('contains signals with valid context structure', () => {
      getSignals('en').forEach((signal) => {
        expect(signal.context).toHaveProperty('topics');
        expect(Array.isArray(signal.context.topics)).toBe(true);
      });
    });

    it('contains signals with valid corroboration counts', () => {
      getSignals('en').forEach((signal) => {
        expect(signal.corroborations.witnessCount).toBeGreaterThanOrEqual(0);
        expect(signal.corroborations.evidenceCount).toBeGreaterThanOrEqual(0);
        expect(signal.corroborations.expertiseCount).toBeGreaterThanOrEqual(0);
        expect(signal.corroborations.totalWeight).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getChains', () => {
    it('returns a non-empty array', () => {
      const chains = getChains('en');
      expect(Array.isArray(chains)).toBe(true);
      expect(chains.length).toBeGreaterThan(0);
    });

    it('contains chains with required fields', () => {
      getChains('en').forEach((chain) => {
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
    });

    it('contains chains with valid status values', () => {
      const validStatuses = ['emerging', 'active', 'established', 'archived'];
      getChains('en').forEach((chain) => {
        expect(validStatuses).toContain(chain.status);
      });
    });

    it('contains chains with valid stats structure', () => {
      getChains('en').forEach((chain) => {
        expect(chain.stats).toHaveProperty('signalCount');
        expect(chain.stats).toHaveProperty('totalCorroborations');
        expect(chain.stats).toHaveProperty('totalChallenges');
        expect(chain.stats).toHaveProperty('contributorCount');
        expect(chain.stats).toHaveProperty('totalWeight');
      });
    });
  });

  describe('getChainPreviews', () => {
    it('returns an array of previews', () => {
      const chains = getChains('en');
      const previews = getChainPreviews();
      expect(Array.isArray(previews)).toBe(true);
      expect(previews.length).toBe(chains.length);
    });

    it('returns previews with expected fields', () => {
      const previews = getChainPreviews();
      previews.forEach((preview) => {
        expect(preview).toHaveProperty('id');
        expect(preview).toHaveProperty('title');
        expect(preview).toHaveProperty('topics');
        expect(preview).toHaveProperty('status');
        expect(preview).toHaveProperty('signalCount');
        expect(preview).toHaveProperty('totalCorroborations');
        expect(preview).toHaveProperty('updatedAt');
      });
    });

    it('maps chain data correctly to preview', () => {
      const previews = getChainPreviews();
      const chains = getChains('en');
      const preview = previews[0];
      const chain = chains[0];

      expect(preview).toBeDefined();
      expect(chain).toBeDefined();
      if (preview != null && chain != null) {
        expect(preview.id).toBe(chain.id);
        expect(preview.title).toBe(chain.title);
        expect(preview.topics).toEqual(chain.topics);
        expect(preview.status).toBe(chain.status);
        expect(preview.signalCount).toBe(chain.stats.signalCount);
        expect(preview.totalCorroborations).toBe(chain.stats.totalCorroborations);
      }
    });

    it('includes location only when present on chain', () => {
      const previews = getChainPreviews();
      const chains = getChains('en');
      previews.forEach((preview, index) => {
        const chain = chains[index];
        if (chain?.location != null) {
          expect(preview.location).toBe(chain.location);
        } else if (chain != null) {
          expect(preview).not.toHaveProperty('location');
        }
      });
    });
  });

  describe('getSignalsByChainId', () => {
    it('returns signals for a valid chain ID', () => {
      const signals = getSignalsByChainId('chain-001');
      expect(signals.length).toBeGreaterThan(0);
    });

    it('returns only signals linked to the specified chain', () => {
      const signals = getSignalsByChainId('chain-001');
      signals.forEach((signal) => {
        expect(signal.chainLinks).toContain('chain-001');
      });
    });

    it('returns empty array for non-existent chain ID', () => {
      const signals = getSignalsByChainId('chain-nonexistent');
      expect(signals).toEqual([]);
    });

    it('returns different signals for different chains', () => {
      const chain1Signals = getSignalsByChainId('chain-001');
      const chain2Signals = getSignalsByChainId('chain-002');

      const chain1Ids = chain1Signals.map((s) => s.id);
      const chain2Ids = chain2Signals.map((s) => s.id);

      // No overlap between chain signals
      chain1Ids.forEach((id) => {
        expect(chain2Ids).not.toContain(id);
      });
    });
  });

  describe('getChainTitle', () => {
    it('returns title for a valid chain ID', () => {
      const title = getChainTitle('chain-001');
      expect(title).toBe('Economic Crisis: Currency & Food Security');
    });

    it('returns undefined for non-existent chain ID', () => {
      const title = getChainTitle('chain-nonexistent');
      expect(title).toBeUndefined();
    });

    it('returns correct titles for all chains', () => {
      getChains('en').forEach((chain) => {
        const title = getChainTitle(chain.id);
        expect(title).toBe(chain.title);
      });
    });
  });
});
