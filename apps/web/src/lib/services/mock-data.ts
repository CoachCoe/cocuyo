/**
 * Mock data for development.
 *
 * This data mirrors the eventual on-chain data structures.
 * It should NOT be imported directly into components — use the
 * service abstractions instead.
 */

import type {
  Signal, StoryChain, ChainPreview, FireflyAuthor, SignalVerification,
  Collective, CollectivePreview, VerificationRequest,
} from '@cocuyo/types';
import {
  createSignalId,
  createChainId,
  createCollectiveId,
  createDIMCredential,
  createVerificationRequestId,
} from '@cocuyo/types';

/**
 * Helper to create anonymous author info.
 */
function createMockAuthor(id: string, pseudonym: string, extra?: { location?: string; reputation?: number }): FireflyAuthor {
  return {
    id,
    credentialHash: createDIMCredential(`dim-anon-${id}`),
    pseudonym,
    disclosureLevel: 'anonymous',
    ...(extra?.location !== undefined && { location: extra.location }),
    ...(extra?.reputation !== undefined && { reputation: extra.reputation }),
  };
}

/**
 * Default unverified status.
 */
const unverified: SignalVerification = {
  status: 'unverified',
};

// Helper to create timestamps relative to now
const hoursAgo = (hours: number): number =>
  Math.floor((Date.now() - hours * 60 * 60 * 1000) / 1000);

const daysAgo = (days: number): number =>
  Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);

/**
 * Mock signals demonstrating the water quality story chain example
 * from the product concept document.
 */
export const mockSignals: Signal[] = [
  {
    id: createSignalId('sig-001'),
    author: createMockAuthor('001', 'RiverWatcher', { location: 'Concord, NH', reputation: 42 }),
    content: {
      text: 'Chemical smell near the river, started three days ago. Strongest in the morning hours near the old mill site. First noticed it on my morning walk with my dog.',
    },
    context: {
      topics: ['environmental', 'water-quality'],
      locationName: 'Concord, NH',
      location: { latitude: 43.2081, longitude: -71.5376 },
    },
    dimSignature: createDIMCredential('dim-anon-001'),
    chainLinks: [createChainId('chain-001')],
    corroborations: {
      witnessCount: 5,
      evidenceCount: 2,
      expertiseCount: 1,
      challengeCount: 0,
      totalWeight: 8.5,
    },
    verification: unverified,
    createdAt: hoursAgo(48),
  },
  {
    id: createSignalId('sig-002'),
    author: createMockAuthor('002', 'DownstreamDweller', { location: 'Concord, NH', reputation: 28 }),
    content: {
      text: 'I live two miles downstream. Same smell here too. My dog won\'t drink from the creek anymore — she always loved it before. Started noticing it about four days ago.',
    },
    context: {
      topics: ['environmental', 'water-quality'],
      locationName: 'Concord, NH',
      location: { latitude: 43.1890, longitude: -71.5501 },
    },
    dimSignature: createDIMCredential('dim-anon-002'),
    chainLinks: [createChainId('chain-001')],
    corroborations: {
      witnessCount: 3,
      evidenceCount: 0,
      expertiseCount: 0,
      challengeCount: 0,
      totalWeight: 3.2,
    },
    verification: unverified,
    createdAt: hoursAgo(36),
  },
  {
    id: createSignalId('sig-003'),
    author: createMockAuthor('003', 'PhotoWitness', { location: 'Merrimack River', reputation: 56 }),
    content: {
      text: 'Photographed discolored water at the confluence point this morning. Distinct greenish tint that wasn\'t there last week. GPS coordinates included.',
      links: ['https://example.com/photo-evidence'],
    },
    context: {
      topics: ['environmental', 'water-quality'],
      locationName: 'Merrimack River, NH',
      location: { latitude: 43.2156, longitude: -71.5234 },
    },
    dimSignature: createDIMCredential('dim-anon-003'),
    chainLinks: [createChainId('chain-001')],
    corroborations: {
      witnessCount: 2,
      evidenceCount: 4,
      expertiseCount: 1,
      challengeCount: 0,
      totalWeight: 7.8,
    },
    verification: { status: 'verified', verifiedBy: createCollectiveId('enviro-collective') },
    createdAt: hoursAgo(24),
  },
  {
    id: createSignalId('sig-004'),
    author: createMockAuthor('004', 'RecordDigger', { reputation: 71 }),
    content: {
      text: 'Checked the public permit database. The facility upstream had their discharge permit expire 6 months ago. No renewal on file. Screenshot of the database record attached.',
    },
    context: {
      topics: ['environmental', 'public-records', 'water-quality'],
      locationName: 'NH DES Database',
    },
    dimSignature: createDIMCredential('dim-anon-004'),
    chainLinks: [createChainId('chain-001')],
    corroborations: {
      witnessCount: 0,
      evidenceCount: 6,
      expertiseCount: 2,
      challengeCount: 0,
      totalWeight: 12.4,
    },
    verification: { status: 'verified', verifiedBy: createCollectiveId('enviro-collective') },
    createdAt: hoursAgo(18),
  },
  {
    id: createSignalId('sig-005'),
    author: createMockAuthor('005', 'EnviroExpert', { location: 'UNH', reputation: 89 }),
    content: {
      text: 'Environmental scientist here. Based on the described smell (sulfurous, "rotten eggs") and the greenish discoloration, this is consistent with hydrogen sulfide from anaerobic decomposition. Often indicates organic waste discharge. The permit lapse is concerning.',
    },
    context: {
      topics: ['environmental', 'water-quality', 'expertise'],
      locationName: 'UNH Environmental Lab',
      location: { latitude: 43.1339, longitude: -70.9264 },
    },
    dimSignature: createDIMCredential('dim-anon-005'),
    chainLinks: [createChainId('chain-001')],
    corroborations: {
      witnessCount: 0,
      evidenceCount: 0,
      expertiseCount: 8,
      challengeCount: 0,
      totalWeight: 15.2,
    },
    verification: unverified,
    createdAt: hoursAgo(12),
  },
  {
    id: createSignalId('sig-006'),
    author: createMockAuthor('006', 'CivicObserver', { location: 'Manchester, NH', reputation: 34 }),
    content: {
      text: 'City council meeting tonight discussed the new downtown development project. No mention of the traffic study that was supposedly completed. Third meeting in a row where it\'s been "tabled."',
    },
    context: {
      topics: ['local-government', 'development'],
      locationName: 'Manchester, NH',
      location: { latitude: 42.9956, longitude: -71.4548 },
    },
    dimSignature: createDIMCredential('dim-anon-006'),
    chainLinks: [createChainId('chain-002')],
    corroborations: {
      witnessCount: 4,
      evidenceCount: 1,
      expertiseCount: 0,
      challengeCount: 1,
      totalWeight: 4.1,
    },
    verification: { status: 'disputed' },
    createdAt: hoursAgo(6),
  },
  {
    id: createSignalId('sig-007'),
    author: createMockAuthor('007', 'FOIAFiler', { location: 'Manchester, NH', reputation: 45 }),
    content: {
      text: 'FOIA request for the traffic study came back with heavily redacted documents. 47 pages, 38 of them mostly blacked out. Filed an appeal.',
    },
    context: {
      topics: ['local-government', 'public-records', 'development'],
      locationName: 'Manchester City Hall, NH',
      location: { latitude: 42.9914, longitude: -71.4628 },
    },
    dimSignature: createDIMCredential('dim-anon-007'),
    chainLinks: [createChainId('chain-002')],
    corroborations: {
      witnessCount: 0,
      evidenceCount: 3,
      expertiseCount: 0,
      challengeCount: 0,
      totalWeight: 5.6,
    },
    verification: unverified,
    createdAt: hoursAgo(2),
  },
];

/**
 * Mock story chains.
 */
export const mockChains: StoryChain[] = [
  {
    id: createChainId('chain-001'),
    title: 'Water Quality — Concord River Basin',
    description:
      'Community observations of water quality issues in the Concord River area, including chemical smells, discoloration, and permit compliance concerns.',
    topics: ['environmental', 'water-quality', 'public-records'],
    location: 'Concord, NH',
    status: 'active',
    signalIds: [
      createSignalId('sig-001'),
      createSignalId('sig-002'),
      createSignalId('sig-003'),
      createSignalId('sig-004'),
      createSignalId('sig-005'),
    ],
    stats: {
      signalCount: 5,
      totalCorroborations: 21,
      totalChallenges: 0,
      contributorCount: 5,
      totalWeight: 47.1,
    },
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(12),
  },
  {
    id: createChainId('chain-002'),
    title: 'Downtown Development Transparency',
    description:
      'Tracking city council proceedings and public records related to the proposed downtown development project.',
    topics: ['local-government', 'development', 'public-records'],
    location: 'Manchester, NH',
    status: 'emerging',
    signalIds: [createSignalId('sig-006'), createSignalId('sig-007')],
    stats: {
      signalCount: 2,
      totalCorroborations: 5,
      totalChallenges: 1,
      contributorCount: 2,
      totalWeight: 9.7,
    },
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(2),
  },
  {
    id: createChainId('chain-003'),
    title: 'School Board Budget Decisions',
    description:
      'Documentation of school board meetings and budget allocation decisions affecting local schools.',
    topics: ['education', 'local-government', 'budget'],
    location: 'Nashua, NH',
    status: 'established',
    signalIds: [],
    stats: {
      signalCount: 12,
      totalCorroborations: 45,
      totalChallenges: 2,
      contributorCount: 8,
      totalWeight: 78.3,
    },
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
  },
];

/**
 * Get chain previews for listing.
 */
export function getChainPreviews(): ChainPreview[] {
  return mockChains.map((chain) => ({
    id: chain.id,
    title: chain.title,
    topics: chain.topics,
    ...(chain.location != null && { location: chain.location }),
    status: chain.status,
    signalCount: chain.stats.signalCount,
    totalCorroborations: chain.stats.totalCorroborations,
    updatedAt: chain.updatedAt,
  }));
}

/**
 * Get signals by chain ID.
 */
export function getSignalsByChainId(chainId: string): Signal[] {
  return mockSignals.filter((signal) =>
    signal.chainLinks.some((link) => link === chainId)
  );
}

/**
 * Get chain title by ID.
 */
export function getChainTitle(chainId: string): string | undefined {
  const chain = mockChains.find((c) => c.id === chainId);
  return chain?.title;
}

/**
 * Get a signal by ID.
 */
export function getSignalById(signalId: string): Signal | undefined {
  return mockSignals.find((s) => s.id === signalId);
}

/**
 * Get all signal IDs for static generation.
 */
export function getAllSignalIds(): string[] {
  return mockSignals.map((s) => s.id);
}

/**
 * Mock collectives for fact-checking.
 */
export const mockCollectives: Collective[] = [
  {
    id: createCollectiveId('enviro-collective'),
    name: 'NH Environmental Watch',
    description: 'Verifying environmental and water quality reports across New Hampshire.',
    mission: 'Protect our communities through verified environmental monitoring and transparent reporting.',
    topics: ['environmental', 'water-quality', 'public-health'],
    members: [
      { credentialHash: createDIMCredential('dim-enviro-001'), pseudonym: 'EcoVerifier', role: 'founder', joinedAt: daysAgo(90), verificationsCompleted: 45 },
      { credentialHash: createDIMCredential('dim-enviro-002'), pseudonym: 'WaterWatcher', role: 'moderator', joinedAt: daysAgo(60), verificationsCompleted: 32 },
      { credentialHash: createDIMCredential('dim-enviro-003'), pseudonym: 'GreenChecker', role: 'member', joinedAt: daysAgo(30), verificationsCompleted: 18 },
    ],
    governance: { minVotesForVerdict: 2, verdictThreshold: 66, membershipApproval: 'vote' },
    reputation: { score: 92, verificationsCompleted: 67, accuracyRate: 0.95, avgResponseTime: 18 },
    createdAt: daysAgo(90),
    updatedAt: daysAgo(1),
  },
  {
    id: createCollectiveId('civic-collective'),
    name: 'Civic Transparency Network',
    description: 'Fact-checking local government proceedings and public records.',
    mission: 'Hold local government accountable through verified documentation and collaborative fact-checking.',
    topics: ['local-government', 'public-records', 'development'],
    members: [
      { credentialHash: createDIMCredential('dim-civic-001'), pseudonym: 'RecordsKeeper', role: 'founder', joinedAt: daysAgo(120), verificationsCompleted: 78 },
      { credentialHash: createDIMCredential('dim-civic-002'), pseudonym: 'CouncilWatcher', role: 'member', joinedAt: daysAgo(45), verificationsCompleted: 23 },
    ],
    governance: { minVotesForVerdict: 2, verdictThreshold: 75, membershipApproval: 'vote' },
    reputation: { score: 88, verificationsCompleted: 89, accuracyRate: 0.91, avgResponseTime: 24 },
    createdAt: daysAgo(120),
    updatedAt: daysAgo(2),
  },
  {
    id: createCollectiveId('health-collective'),
    name: 'Community Health Verifiers',
    description: 'Verifying health-related information and public health advisories.',
    mission: 'Combat health misinformation with evidence-based verification.',
    topics: ['health', 'public-health', 'medical'],
    members: [
      { credentialHash: createDIMCredential('dim-health-001'), pseudonym: 'HealthCheck', role: 'founder', joinedAt: daysAgo(60), verificationsCompleted: 34 },
    ],
    governance: { minVotesForVerdict: 3, verdictThreshold: 80, membershipApproval: 'invite' },
    reputation: { score: 95, verificationsCompleted: 34, accuracyRate: 0.97, avgResponseTime: 12 },
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5),
  },
];

/**
 * Get collective previews for listing.
 */
export function getCollectivePreviews(): CollectivePreview[] {
  return mockCollectives.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    topics: c.topics,
    memberCount: c.members.length,
    reputation: c.reputation.score,
    verificationsCompleted: c.reputation.verificationsCompleted,
  }));
}

/**
 * Get collective by ID.
 */
export function getCollectiveById(id: string): Collective | undefined {
  return mockCollectives.find((c) => c.id === id);
}

/**
 * Get all collective IDs for static generation.
 */
export function getAllCollectiveIds(): string[] {
  return mockCollectives.map((c) => c.id);
}

/**
 * Mock verification requests.
 */
export const mockVerificationRequests: VerificationRequest[] = [
  {
    id: createVerificationRequestId('vr-001'),
    signalId: createSignalId('sig-003'),
    signalCid: 'bafybeig...',
    collectiveId: createCollectiveId('enviro-collective'),
    status: 'voting',
    evidence: [
      { submittedBy: createDIMCredential('dim-enviro-001'), submitterPseudonym: 'EcoVerifier', content: 'Confirmed discoloration matches industrial runoff patterns. Similar cases documented in EPA database.', sources: ['https://epa.gov/runoff-cases'], supports: true, submittedAt: hoursAgo(20) },
      { submittedBy: createDIMCredential('dim-enviro-002'), submitterPseudonym: 'WaterWatcher', content: 'Water sample analysis shows elevated phosphate levels consistent with description.', sources: ['https://lab-results.example'], supports: true, submittedAt: hoursAgo(18) },
    ],
    votes: [
      { voter: createDIMCredential('dim-enviro-001'), voterPseudonym: 'EcoVerifier', verdict: 'verified', reasoning: 'Evidence strongly supports the claim.', votedAt: hoursAgo(12) },
    ],
    createdAt: hoursAgo(24),
    updatedAt: hoursAgo(12),
  },
  {
    id: createVerificationRequestId('vr-002'),
    signalId: createSignalId('sig-006'),
    signalCid: 'bafybeih...',
    collectiveId: createCollectiveId('civic-collective'),
    status: 'in_review',
    evidence: [
      { submittedBy: createDIMCredential('dim-civic-001'), submitterPseudonym: 'RecordsKeeper', content: 'Meeting minutes confirm traffic study was tabled. However, city claims study is still in progress.', sources: ['https://city-minutes.example'], supports: true, submittedAt: hoursAgo(4) },
    ],
    votes: [],
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(4),
  },
  {
    id: createVerificationRequestId('vr-003'),
    signalId: createSignalId('sig-001'),
    signalCid: 'bafybeij...',
    collectiveId: createCollectiveId('enviro-collective'),
    status: 'pending',
    evidence: [],
    votes: [],
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
];

/**
 * Get verification requests for a collective.
 */
export function getVerificationsByCollective(collectiveId: string): VerificationRequest[] {
  return mockVerificationRequests.filter((v) => v.collectiveId === collectiveId);
}

/**
 * Get verification request by signal ID.
 */
export function getVerificationBySignalId(signalId: string): VerificationRequest | undefined {
  return mockVerificationRequests.find((v) => v.signalId === signalId);
}

/**
 * Get all pending/in-review verification requests.
 */
export function getPendingVerifications(): VerificationRequest[] {
  return mockVerificationRequests.filter((v) => v.status !== 'completed');
}

/**
 * Get author by ID (extracted from signals).
 */
export function getAuthorById(authorId: string): FireflyAuthor | undefined {
  const signal = mockSignals.find((s) => s.author.id === authorId);
  return signal?.author;
}

/**
 * Get signals by author ID.
 */
export function getSignalsByAuthor(authorId: string): Signal[] {
  return mockSignals.filter((s) => s.author.id === authorId);
}
