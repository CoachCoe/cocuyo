/**
 * Tests for ExploreView utilities.
 */

import { describe, it, expect } from 'vitest';
import { getContentionScore } from './ExploreView';
import type { Post } from '@cocuyo/types';

// Helper to create a minimal post with specific corroboration counts
function createMockPost(corroborations: {
  witnessCount?: number;
  evidenceCount?: number;
  expertiseCount?: number;
  challengeCount?: number;
}): Post {
  return {
    corroborations: {
      witnessCount: corroborations.witnessCount ?? 0,
      evidenceCount: corroborations.evidenceCount ?? 0,
      expertiseCount: corroborations.expertiseCount ?? 0,
      challengeCount: corroborations.challengeCount ?? 0,
    },
  } as Post;
}

describe('getContentionScore', () => {
  describe('edge cases', () => {
    it('returns 0 for posts with no interactions', () => {
      const post = createMockPost({});
      expect(getContentionScore(post)).toBe(0);
    });

    it('returns 0 for posts with only supports (no challenges)', () => {
      const post = createMockPost({ witnessCount: 10, evidenceCount: 5 });
      expect(getContentionScore(post)).toBe(0);
    });

    it('returns 0 for posts with only challenges (no supports)', () => {
      // 100% challenges means ratio = 1, so 4 * 1 * (1-1) = 0
      const post = createMockPost({ challengeCount: 10 });
      expect(getContentionScore(post)).toBe(0);
    });
  });

  describe('contention scaling', () => {
    it('peaks at 50/50 split between supports and challenges', () => {
      const balanced = createMockPost({ witnessCount: 50, challengeCount: 50 });
      const skewedSupport = createMockPost({ witnessCount: 80, challengeCount: 20 });
      const skewedChallenge = createMockPost({ witnessCount: 20, challengeCount: 80 });

      const balancedScore = getContentionScore(balanced);
      const supportScore = getContentionScore(skewedSupport);
      const challengeScore = getContentionScore(skewedChallenge);

      // Balanced should score highest
      expect(balancedScore).toBeGreaterThan(supportScore);
      expect(balancedScore).toBeGreaterThan(challengeScore);
      // Skewed scores should be equal (symmetric around 0.5)
      expect(supportScore).toBeCloseTo(challengeScore, 5);
    });

    it('weights by engagement volume', () => {
      // Same 50/50 ratio but different volumes
      const lowVolume = createMockPost({ witnessCount: 5, challengeCount: 5 });
      const highVolume = createMockPost({ witnessCount: 50, challengeCount: 50 });

      expect(getContentionScore(highVolume)).toBeGreaterThan(getContentionScore(lowVolume));
    });

    it('high volume with moderate contention beats low volume with high contention', () => {
      // This tests that a genuinely contested topic (many people disagreeing)
      // ranks higher than a single challenge on an otherwise uncontested post
      const singleChallenge = createMockPost({ witnessCount: 1, challengeCount: 1 });
      const activeDebate = createMockPost({ witnessCount: 100, challengeCount: 50 });

      expect(getContentionScore(activeDebate)).toBeGreaterThan(getContentionScore(singleChallenge));
    });
  });

  describe('real-world scenarios', () => {
    it('ranks truly contested posts higher than lightly challenged ones', () => {
      // Post A: 100 supports, 50 challenges (genuine debate)
      const genuineDebate = createMockPost({
        witnessCount: 50,
        evidenceCount: 30,
        expertiseCount: 20,
        challengeCount: 50,
      });

      // Post B: 10 supports, 1 challenge (minor disagreement)
      const minorDisagreement = createMockPost({
        witnessCount: 8,
        evidenceCount: 2,
        challengeCount: 1,
      });

      expect(getContentionScore(genuineDebate)).toBeGreaterThan(
        getContentionScore(minorDisagreement)
      );
    });
  });
});
