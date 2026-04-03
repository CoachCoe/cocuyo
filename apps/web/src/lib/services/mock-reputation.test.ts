/**
 * Tests for the mock reputation service.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createDIMCredential, createSignalId } from '@cocuyo/types';
import type { ReputationTopic } from '@cocuyo/types';
import {
  mockReputationService,
  seedReputationData,
  clearReputationData,
  REPUTATION_CONSTANTS,
} from './mock-reputation';

const {
  DEFAULT_SCORE,
  MIN_SCORE,
  MAX_SCORE,
  CORROBORATION_GIVEN_DELTA,
  CORROBORATION_RECEIVED_DELTA,
  CHALLENGE_LOST_DELTA,
} = REPUTATION_CONSTANTS;

describe('mockReputationService', () => {
  beforeEach(() => {
    clearReputationData();
  });

  describe('getReputation', () => {
    it('returns null for unknown credentials', async () => {
      const credential = createDIMCredential('dim-unknown');
      const result = await mockReputationService.getReputation(credential);
      expect(result).toBeNull();
    });

    it('returns seeded data for known credentials', async () => {
      seedReputationData();
      const credential = createDIMCredential('dim-anon-001');
      const result = await mockReputationService.getReputation(credential);

      expect(result).not.toBeNull();
      expect(result?.credential).toBe(credential);
      expect(result?.scores.economy.score).toBe(670);
    });

    it('includes all topic scores', async () => {
      seedReputationData();
      const credential = createDIMCredential('dim-anon-001');
      const result = await mockReputationService.getReputation(credential);

      expect(result?.scores.economy).toBeDefined();
      expect(result?.scores.health).toBeDefined();
      expect(result?.scores.politics).toBeDefined();
      expect(result?.scores.infrastructure).toBeDefined();
      expect(result?.scores['human-rights']).toBeDefined();
      expect(result?.scores.environment).toBeDefined();
      expect(result?.scores.security).toBeDefined();
      expect(result?.scores.education).toBeDefined();
    });

    it('calculates overall score correctly', async () => {
      seedReputationData();
      const credential = createDIMCredential('dim-anon-001');
      const result = await mockReputationService.getReputation(credential);

      // EconWatcher has 670 in economy (with high activity), DEFAULT_SCORE in others
      // Overall should be weighted toward economy due to higher activity
      expect(result?.overallScore).toBeGreaterThan(DEFAULT_SCORE);
      expect(result?.overallScore).toBeLessThanOrEqual(670);
    });
  });

  describe('getTopicScore', () => {
    it('returns default score for unknown credentials', async () => {
      const credential = createDIMCredential('dim-unknown');
      const score = await mockReputationService.getTopicScore(credential, 'economy');
      expect(score).toBe(DEFAULT_SCORE);
    });

    it('returns correct topic score for known credentials', async () => {
      seedReputationData();
      const credential = createDIMCredential('dim-anon-002');
      const score = await mockReputationService.getTopicScore(credential, 'economy');
      expect(score).toBe(780);
    });

    it('returns default for topics without activity', async () => {
      seedReputationData();
      const credential = createDIMCredential('dim-anon-001');
      // EconWatcher has no health activity
      const score = await mockReputationService.getTopicScore(credential, 'health');
      expect(score).toBe(DEFAULT_SCORE);
    });
  });

  describe('getAverageScore', () => {
    it('returns default for unknown credentials', async () => {
      const credential = createDIMCredential('dim-unknown');
      const score = await mockReputationService.getAverageScore(credential, ['economy', 'health']);
      expect(score).toBe(DEFAULT_SCORE);
    });

    it('returns default for empty topics array', async () => {
      seedReputationData();
      const credential = createDIMCredential('dim-anon-001');
      const score = await mockReputationService.getAverageScore(credential, []);
      expect(score).toBe(DEFAULT_SCORE);
    });

    it('calculates average correctly', async () => {
      seedReputationData();
      const credential = createDIMCredential('dim-anon-001');
      // EconWatcher: economy=670, health=500
      const score = await mockReputationService.getAverageScore(credential, ['economy', 'health']);
      expect(score).toBe(Math.round((670 + 500) / 2));
    });
  });

  describe('recordCorroboration', () => {
    it('increases corroborator score', async () => {
      const corroborator = createDIMCredential('dim-corroborator');
      const author = createDIMCredential('dim-author');
      const signalId = createSignalId('sig-test');
      const topics: ReputationTopic[] = ['economy'];

      await mockReputationService.recordCorroboration({
        corroboratorCredential: corroborator,
        signalAuthorCredential: author,
        signalId,
        topics,
      });

      const score = await mockReputationService.getTopicScore(corroborator, 'economy');
      expect(score).toBe(DEFAULT_SCORE + CORROBORATION_GIVEN_DELTA);
    });

    it('increases author score', async () => {
      const corroborator = createDIMCredential('dim-corroborator');
      const author = createDIMCredential('dim-author');
      const signalId = createSignalId('sig-test');
      const topics: ReputationTopic[] = ['economy'];

      await mockReputationService.recordCorroboration({
        corroboratorCredential: corroborator,
        signalAuthorCredential: author,
        signalId,
        topics,
      });

      const score = await mockReputationService.getTopicScore(author, 'economy');
      expect(score).toBe(DEFAULT_SCORE + CORROBORATION_RECEIVED_DELTA);
    });

    it('updates multiple topics', async () => {
      const corroborator = createDIMCredential('dim-corroborator');
      const author = createDIMCredential('dim-author');
      const signalId = createSignalId('sig-test');
      const topics: ReputationTopic[] = ['economy', 'health'];

      await mockReputationService.recordCorroboration({
        corroboratorCredential: corroborator,
        signalAuthorCredential: author,
        signalId,
        topics,
      });

      const economyScore = await mockReputationService.getTopicScore(corroborator, 'economy');
      const healthScore = await mockReputationService.getTopicScore(corroborator, 'health');

      expect(economyScore).toBe(DEFAULT_SCORE + CORROBORATION_GIVEN_DELTA);
      expect(healthScore).toBe(DEFAULT_SCORE + CORROBORATION_GIVEN_DELTA);
    });

    it('increments corroboration counts', async () => {
      const corroborator = createDIMCredential('dim-corroborator');
      const author = createDIMCredential('dim-author');
      const signalId = createSignalId('sig-test');
      const topics: ReputationTopic[] = ['economy'];

      await mockReputationService.recordCorroboration({
        corroboratorCredential: corroborator,
        signalAuthorCredential: author,
        signalId,
        topics,
      });

      const corroboratorProfile = await mockReputationService.getReputation(corroborator);
      const authorProfile = await mockReputationService.getReputation(author);

      expect(corroboratorProfile?.scores.economy.corroborationsGiven).toBe(1);
      expect(authorProfile?.scores.economy.corroborationsReceived).toBe(1);
    });

    it('accumulates over multiple corroborations', async () => {
      const corroborator = createDIMCredential('dim-corroborator');
      const author = createDIMCredential('dim-author');
      const topics: ReputationTopic[] = ['economy'];

      // Record 3 corroborations
      for (let i = 0; i < 3; i++) {
        await mockReputationService.recordCorroboration({
          corroboratorCredential: corroborator,
          signalAuthorCredential: author,
          signalId: createSignalId(`sig-test-${String(i)}`),
          topics,
        });
      }

      const score = await mockReputationService.getTopicScore(corroborator, 'economy');
      expect(score).toBe(DEFAULT_SCORE + CORROBORATION_GIVEN_DELTA * 3);
    });

    it('does not exceed max score', async () => {
      const corroborator = createDIMCredential('dim-corroborator');
      const author = createDIMCredential('dim-author');
      const topics: ReputationTopic[] = ['economy'];

      // Record many corroborations to try to exceed max
      for (let i = 0; i < 200; i++) {
        await mockReputationService.recordCorroboration({
          corroboratorCredential: corroborator,
          signalAuthorCredential: author,
          signalId: createSignalId(`sig-test-${String(i)}`),
          topics,
        });
      }

      const score = await mockReputationService.getTopicScore(author, 'economy');
      expect(score).toBeLessThanOrEqual(MAX_SCORE);
    });
  });

  describe('recordChallenge', () => {
    it('decreases challenged user score', async () => {
      const challenged = createDIMCredential('dim-challenged');
      const signalId = createSignalId('sig-test');
      const topics: ReputationTopic[] = ['economy'];

      // First create the user with some reputation
      await mockReputationService.getReputation(challenged);

      await mockReputationService.recordChallenge({
        challengedCredential: challenged,
        signalId,
        topics,
      });

      const score = await mockReputationService.getTopicScore(challenged, 'economy');
      expect(score).toBe(DEFAULT_SCORE - CHALLENGE_LOST_DELTA);
    });

    it('updates multiple topics', async () => {
      const challenged = createDIMCredential('dim-challenged');
      const signalId = createSignalId('sig-test');
      const topics: ReputationTopic[] = ['economy', 'politics'];

      await mockReputationService.recordChallenge({
        challengedCredential: challenged,
        signalId,
        topics,
      });

      const economyScore = await mockReputationService.getTopicScore(challenged, 'economy');
      const politicsScore = await mockReputationService.getTopicScore(challenged, 'politics');

      expect(economyScore).toBe(DEFAULT_SCORE - CHALLENGE_LOST_DELTA);
      expect(politicsScore).toBe(DEFAULT_SCORE - CHALLENGE_LOST_DELTA);
    });

    it('increments challenge count', async () => {
      const challenged = createDIMCredential('dim-challenged');
      const signalId = createSignalId('sig-test');
      const topics: ReputationTopic[] = ['economy'];

      await mockReputationService.recordChallenge({
        challengedCredential: challenged,
        signalId,
        topics,
      });

      const profile = await mockReputationService.getReputation(challenged);
      expect(profile?.scores.economy.challengesLost).toBe(1);
    });

    it('does not go below min score', async () => {
      const challenged = createDIMCredential('dim-challenged');
      const topics: ReputationTopic[] = ['economy'];

      // Record many challenges to try to go below min
      for (let i = 0; i < 50; i++) {
        await mockReputationService.recordChallenge({
          challengedCredential: challenged,
          signalId: createSignalId(`sig-test-${String(i)}`),
          topics,
        });
      }

      const score = await mockReputationService.getTopicScore(challenged, 'economy');
      expect(score).toBeGreaterThanOrEqual(MIN_SCORE);
    });
  });

  describe('seedReputationData', () => {
    it('seeds data for all mock authors', async () => {
      seedReputationData();

      // Check a few known authors
      const econ1 = await mockReputationService.getReputation(createDIMCredential('dim-anon-001'));
      const econ2 = await mockReputationService.getReputation(createDIMCredential('dim-anon-002'));
      const politics = await mockReputationService.getReputation(createDIMCredential('dim-anon-004'));

      expect(econ1).not.toBeNull();
      expect(econ2).not.toBeNull();
      expect(politics).not.toBeNull();

      expect(econ1?.scores.economy.score).toBe(670);
      expect(econ2?.scores.economy.score).toBe(780);
      expect(politics?.scores.politics.score).toBe(820);
    });
  });
});
