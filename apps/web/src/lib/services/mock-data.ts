/**
 * Mock data for development.
 *
 * This data mirrors the eventual on-chain data structures.
 * It should NOT be imported directly into components — use the
 * service abstractions instead.
 */

import type { Signal, StoryChain, ChainPreview } from '@cocuyo/types';
import {
  createSignalId,
  createChainId,
  createDIMCredential,
} from '@cocuyo/types';

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
    createdAt: hoursAgo(48),
  },
  {
    id: createSignalId('sig-002'),
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
    createdAt: hoursAgo(36),
  },
  {
    id: createSignalId('sig-003'),
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
    createdAt: hoursAgo(24),
  },
  {
    id: createSignalId('sig-004'),
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
    createdAt: hoursAgo(18),
  },
  {
    id: createSignalId('sig-005'),
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
    createdAt: hoursAgo(12),
  },
  {
    id: createSignalId('sig-006'),
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
    createdAt: hoursAgo(6),
  },
  {
    id: createSignalId('sig-007'),
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
