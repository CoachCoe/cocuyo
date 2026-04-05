/**
 * Mock reputation service for development.
 *
 * In-memory implementation of ReputationService. In production, this will
 * be replaced with calls to the Polkadot reputation pallet.
 */

import type {
  DIMCredential,
  SignalId,
  ReputationService,
  ReputationProfile,
  TopicReputationScore,
  ReputationError,
  Result,
  ReputationTopic,
} from '@cocuyo/types';
import {
  ok,
  createDIMCredential,
  REPUTATION_TOPICS,
} from '@cocuyo/types';

// ============================================================================
// Constants
// ============================================================================

/** Starting reputation score (neutral) */
const DEFAULT_SCORE = 500;

/** Minimum reputation score */
const MIN_SCORE = 0;

/** Maximum reputation score */
const MAX_SCORE = 1000;

/** Score increase per corroboration given */
const CORROBORATION_GIVEN_DELTA = 5;

/** Score increase per corroboration received */
const CORROBORATION_RECEIVED_DELTA = 10;

/** Score decrease per successful challenge */
const CHALLENGE_LOST_DELTA = 50;

/** Score increase for winning a challenge */
const CHALLENGE_WON_DELTA = 25;

// ============================================================================
// In-memory storage
// ============================================================================

/**
 * Mutable topic score for internal storage.
 */
interface MutableTopicScore {
  topic: ReputationTopic;
  score: number;
  corroborationsGiven: number;
  corroborationsReceived: number;
  challengesWon: number;
  challengesLost: number;
}

/**
 * Mutable reputation profile for internal storage.
 */
interface MutableReputationProfile {
  credential: DIMCredential;
  scores: Record<ReputationTopic, MutableTopicScore>;
  lastUpdated: number;
}

/** In-memory reputation store */
const reputationStore = new Map<string, MutableReputationProfile>();

// ============================================================================
// Helpers
// ============================================================================

/**
 * Create a default topic score.
 */
function createDefaultTopicScore(topic: ReputationTopic): MutableTopicScore {
  return {
    topic,
    score: DEFAULT_SCORE,
    corroborationsGiven: 0,
    corroborationsReceived: 0,
    challengesWon: 0,
    challengesLost: 0,
  };
}

/**
 * Create a default reputation profile for a new credential.
 */
function createDefaultProfile(credential: DIMCredential): MutableReputationProfile {
  const scores: Record<string, MutableTopicScore> = {};
  for (const topic of REPUTATION_TOPICS) {
    scores[topic] = createDefaultTopicScore(topic);
  }
  return {
    credential,
    scores: scores as Record<ReputationTopic, MutableTopicScore>,
    lastUpdated: Date.now(),
  };
}

/**
 * Clamp a score within bounds.
 */
function clampScore(score: number): number {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

/**
 * Calculate overall score as weighted average of topic scores.
 * Topics with more activity get more weight.
 */
function calculateOverallScore(scores: Record<ReputationTopic, MutableTopicScore>): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const topic of REPUTATION_TOPICS) {
    const topicScore = scores[topic];
    const activity = topicScore.corroborationsGiven + topicScore.corroborationsReceived;
    // Minimum weight of 1 ensures all topics contribute
    const weight = Math.max(1, activity);
    totalWeight += weight;
    weightedSum += topicScore.score * weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : DEFAULT_SCORE;
}

/**
 * Calculate total corroborations across all topics.
 */
function calculateTotalCorroborations(scores: Record<ReputationTopic, MutableTopicScore>): number {
  let total = 0;
  for (const topic of REPUTATION_TOPICS) {
    total += scores[topic].corroborationsGiven + scores[topic].corroborationsReceived;
  }
  return total;
}

/**
 * Convert mutable profile to immutable ReputationProfile.
 */
function toReputationProfile(profile: MutableReputationProfile): ReputationProfile {
  const immutableScores: Record<string, TopicReputationScore> = {};
  for (const topic of REPUTATION_TOPICS) {
    const mutable = profile.scores[topic];
    immutableScores[topic] = {
      topic: mutable.topic,
      score: mutable.score,
      corroborationsGiven: mutable.corroborationsGiven,
      corroborationsReceived: mutable.corroborationsReceived,
      challengesWon: mutable.challengesWon,
      challengesLost: mutable.challengesLost,
    };
  }

  return {
    credential: profile.credential,
    scores: immutableScores as Readonly<Record<ReputationTopic, TopicReputationScore>>,
    overallScore: calculateOverallScore(profile.scores),
    totalCorroborations: calculateTotalCorroborations(profile.scores),
    lastUpdated: profile.lastUpdated,
  };
}

/**
 * Get or create a profile for a credential.
 */
function getOrCreateProfile(credential: DIMCredential): MutableReputationProfile {
  let profile = reputationStore.get(credential);
  if (profile === undefined) {
    profile = createDefaultProfile(credential);
    reputationStore.set(credential, profile);
  }
  return profile;
}

// ============================================================================
// Mock Service Implementation
// ============================================================================

/**
 * Mock reputation service implementation.
 */
export const mockReputationService: ReputationService = {
  getReputation(credential: DIMCredential): Promise<ReputationProfile | null> {
    const profile = reputationStore.get(credential);
    if (profile === undefined) {
      return Promise.resolve(null);
    }
    return Promise.resolve(toReputationProfile(profile));
  },

  getTopicScore(credential: DIMCredential, topic: ReputationTopic): Promise<number> {
    const profile = reputationStore.get(credential);
    if (profile === undefined) {
      return Promise.resolve(DEFAULT_SCORE);
    }
    return Promise.resolve(profile.scores[topic].score);
  },

  getAverageScore(
    credential: DIMCredential,
    topics: readonly ReputationTopic[]
  ): Promise<number> {
    const profile = reputationStore.get(credential);
    if (profile === undefined || topics.length === 0) {
      return Promise.resolve(DEFAULT_SCORE);
    }

    let sum = 0;
    for (const topic of topics) {
      sum += profile.scores[topic].score;
    }
    return Promise.resolve(Math.round(sum / topics.length));
  },

  recordCorroboration(params: {
    corroboratorCredential: DIMCredential;
    signalAuthorCredential: DIMCredential;
    signalId: SignalId;
    topics: readonly ReputationTopic[];
  }): Promise<Result<void, ReputationError>> {
    const { corroboratorCredential, signalAuthorCredential, topics } = params;

    // Update corroborator's reputation (giving corroboration)
    const corroboratorProfile = getOrCreateProfile(corroboratorCredential);
    for (const topic of topics) {
      const topicScore = corroboratorProfile.scores[topic];
      topicScore.corroborationsGiven += 1;
      topicScore.score = clampScore(topicScore.score + CORROBORATION_GIVEN_DELTA);
    }
    corroboratorProfile.lastUpdated = Date.now();

    // Update author's reputation (receiving corroboration)
    const authorProfile = getOrCreateProfile(signalAuthorCredential);
    for (const topic of topics) {
      const topicScore = authorProfile.scores[topic];
      topicScore.corroborationsReceived += 1;
      topicScore.score = clampScore(topicScore.score + CORROBORATION_RECEIVED_DELTA);
    }
    authorProfile.lastUpdated = Date.now();

    return Promise.resolve(ok(undefined));
  },

  recordChallenge(params: {
    challengedCredential: DIMCredential;
    signalId: SignalId;
    topics: readonly ReputationTopic[];
  }): Promise<Result<void, ReputationError>> {
    const { challengedCredential, topics } = params;

    // Update challenged user's reputation (lost challenge)
    const profile = getOrCreateProfile(challengedCredential);
    for (const topic of topics) {
      const topicScore = profile.scores[topic];
      topicScore.challengesLost += 1;
      topicScore.score = clampScore(topicScore.score - CHALLENGE_LOST_DELTA);
    }
    profile.lastUpdated = Date.now();

    return Promise.resolve(ok(undefined));
  },
};

// ============================================================================
// Seed Data
// ============================================================================

/**
 * Seed initial reputation data based on mock signal authors.
 * Call this once during app initialization.
 */
export function seedReputationData(): void {
  // Map mock author IDs to their topic affinities and activity levels
  const authorSeeds: Array<{
    id: string;
    topics: ReputationTopic[];
    score: number;
    corroborationsGiven: number;
    corroborationsReceived: number;
  }> = [
    // EconWatcher - economy expert
    {
      id: '001',
      topics: ['economy'],
      score: 670,
      corroborationsGiven: 45,
      corroborationsReceived: 23,
    },
    // MarketAnalyst - economy expert
    {
      id: '002',
      topics: ['economy'],
      score: 780,
      corroborationsGiven: 62,
      corroborationsReceived: 31,
    },
    // StreetReporter - economy, general
    {
      id: '003',
      topics: ['economy', 'infrastructure'],
      score: 450,
      corroborationsGiven: 18,
      corroborationsReceived: 18,
    },
    // TransparencyWatch - politics
    {
      id: '004',
      topics: ['politics'],
      score: 820,
      corroborationsGiven: 89,
      corroborationsReceived: 29,
    },
    // DocHunter - politics
    {
      id: '005',
      topics: ['politics'],
      score: 710,
      corroborationsGiven: 55,
      corroborationsReceived: 24,
    },
    // DiplomacyTracker - human-rights, politics
    {
      id: '006',
      topics: ['human-rights', 'politics'],
      score: 630,
      corroborationsGiven: 32,
      corroborationsReceived: 14,
    },
    // FamilyVoice - human-rights (new user, personal testimony)
    {
      id: '007',
      topics: ['human-rights'],
      score: 380,
      corroborationsGiven: 5,
      corroborationsReceived: 12,
    },
    // HospitalWorker - health
    {
      id: '008',
      topics: ['health', 'infrastructure'],
      score: 540,
      corroborationsGiven: 28,
      corroborationsReceived: 15,
    },
    // MedSupplyTracker - health
    {
      id: '009',
      topics: ['health'],
      score: 660,
      corroborationsGiven: 41,
      corroborationsReceived: 21,
    },
  ];

  for (const seed of authorSeeds) {
    const credential = createDIMCredential(`dim-anon-${seed.id}`);
    const profile = createDefaultProfile(credential);

    // Set topic-specific scores
    for (const topic of seed.topics) {
      profile.scores[topic].score = seed.score;
      profile.scores[topic].corroborationsGiven = seed.corroborationsGiven;
      profile.scores[topic].corroborationsReceived = seed.corroborationsReceived;
    }

    profile.lastUpdated = Date.now();
    reputationStore.set(credential, profile);
  }
}

/**
 * Clear all reputation data (for testing).
 */
export function clearReputationData(): void {
  reputationStore.clear();
}

/**
 * Get the raw reputation store (for testing).
 */
export function getReputationStore(): Map<string, MutableReputationProfile> {
  return reputationStore;
}

// ============================================================================
// Export constants for testing
// ============================================================================

export const REPUTATION_CONSTANTS = {
  DEFAULT_SCORE,
  MIN_SCORE,
  MAX_SCORE,
  CORROBORATION_GIVEN_DELTA,
  CORROBORATION_RECEIVED_DELTA,
  CHALLENGE_LOST_DELTA,
  CHALLENGE_WON_DELTA,
} as const;
