/**
 * Mock bounty data for development.
 */

import type { Bounty, BountyPreview, ChainId } from '@cocuyo/types';
import {
  createBountyId,
  createChainId,
  createDIMCredential,
  createSignalId,
  createEscrowId,
  createTransactionHash,
  createPUSDAmount,
} from '@cocuyo/types';
import { hoursAgo, daysAgo, daysFromNow } from '@/lib/utils/time';

/**
 * Mock bounties demonstrating community-funded information requests.
 *
 * Some bounties are linked to story chains (relatedChainId), representing
 * funded investigations. Others are "orphan" bounties - open questions
 * waiting for their first signals.
 */
export const mockBounties: Bounty[] = [
  // === Venezuelan bounties linked to story chains ===
  {
    id: createBountyId('bounty-ve-001'),
    title: 'Document current food basket prices across Caracas',
    description:
      'We need weekly documentation of basic food basket prices (canasta básica) from supermarkets and markets across different neighborhoods in Caracas. Include: store name/location, date, itemized prices for staples (rice, beans, flour, cooking oil, eggs), photos of price tags, and any observations about availability or shortages.',
    topics: ['economy', 'food-security', 'inflation', 'documentation'],
    location: 'Caracas, Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(450_000_000n), // $450 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-001'),
    escrowId: createEscrowId('escrow-ve-001'),
    fundingTxHash: createTransactionHash('0xve001...abc'),
    payoutMode: 'private',
    contributingSignals: [createSignalId('sig-001'), createSignalId('sig-002')],
    relatedChainId: createChainId('chain-001'),
    createdAt: daysAgo(5),
    expiresAt: daysFromNow(25),
  },
  {
    id: createBountyId('bounty-ve-002'),
    title: 'Verify recent ministry appointments and dismissals',
    description:
      'Track and verify official appointments and dismissals in Venezuelan government ministries. Looking for: official gazette publications, press conference recordings, social media announcements from official accounts, and any documentation showing appointment dates, credentials, and previous positions of new officials.',
    topics: ['politics', 'transparency', 'governance', 'public-records'],
    location: 'Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(600_000_000n), // $600 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-002'),
    escrowId: createEscrowId('escrow-ve-002'),
    fundingTxHash: createTransactionHash('0xve002...def'),
    payoutMode: 'private',
    contributingSignals: [createSignalId('sig-004'), createSignalId('sig-005')],
    relatedChainId: createChainId('chain-002'),
    createdAt: daysAgo(4),
    expiresAt: daysFromNow(26),
  },
  // === Venezuelan orphan bounties (open questions without stories yet) ===
  {
    id: createBountyId('bounty-ve-003'),
    title: 'Document hospital conditions and medication availability in Maracaibo',
    description:
      'We need firsthand documentation of conditions at public hospitals in Maracaibo. Looking for: photos of waiting areas, pharmacy stock levels, staff testimonies about equipment/supply shortages, and patient wait times for emergency care.',
    topics: ['health', 'infrastructure', 'crisis', 'documentation'],
    location: 'Maracaibo, Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(350_000_000n), // $350 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-003'),
    escrowId: createEscrowId('escrow-ve-003'),
    fundingTxHash: createTransactionHash('0xve003...ghi'),
    payoutMode: 'private',
    contributingSignals: [],
    // No chain yet - orphan bounty
    createdAt: daysAgo(3),
    expiresAt: daysFromNow(27),
  },
  {
    id: createBountyId('bounty-ve-004'),
    title: 'Track electricity outages and water service interruptions',
    description:
      'Document the frequency and duration of power outages and water service cuts across Venezuelan states. Include: date/time of outage, duration, affected neighborhood, any official explanations given, and photos if safe to capture.',
    topics: ['infrastructure', 'public-services', 'crisis'],
    location: 'Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(275_000_000n), // $275 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-004'),
    escrowId: createEscrowId('escrow-ve-004'),
    fundingTxHash: createTransactionHash('0xve004...jkl'),
    payoutMode: 'private',
    contributingSignals: [],
    // No chain yet - orphan bounty
    createdAt: daysAgo(2),
    expiresAt: daysFromNow(28),
  },
  {
    id: createBountyId('bounty-ve-005'),
    title: 'Verify reports of detained journalists and activists',
    description:
      'Help verify and document cases of detained journalists, activists, and political figures. Looking for: detention location confirmations, family statements, lawyer access status, and any official charges filed.',
    topics: ['human-rights', 'politics', 'press-freedom', 'detention'],
    location: 'Venezuela',
    status: 'open',
    fundingAmount: createPUSDAmount(500_000_000n), // $500 pUSD
    funderCredential: createDIMCredential('dim-funder-ve-005'),
    escrowId: createEscrowId('escrow-ve-005'),
    fundingTxHash: createTransactionHash('0xve005...mno'),
    payoutMode: 'private',
    contributingSignals: [],
    // No chain yet - orphan bounty
    createdAt: hoursAgo(18),
    expiresAt: daysFromNow(30),
  },
];

/**
 * Get bounty previews for listing.
 */
export function getBountyPreviews(): BountyPreview[] {
  return mockBounties.map((bounty) => ({
    id: bounty.id,
    title: bounty.title,
    topics: bounty.topics,
    ...(bounty.location != null && { location: bounty.location }),
    status: bounty.status,
    fundingAmount: bounty.fundingAmount,
    contributionCount: bounty.contributingSignals.length,
    payoutMode: bounty.payoutMode,
    expiresAt: bounty.expiresAt,
  }));
}

/**
 * Get open bounties only.
 */
export function getOpenBounties(): BountyPreview[] {
  return getBountyPreviews().filter((b) => b.status === 'open');
}

/**
 * Get a bounty by ID.
 */
export function getBountyById(id: string): Bounty | undefined {
  return mockBounties.find((b) => b.id === id);
}

/**
 * Get bounties that a signal contributes to.
 * Returns BountyPreview[] for any bounty where the signal ID appears in contributingSignals.
 */
export function getBountiesForSignal(signalId: string): BountyPreview[] {
  return mockBounties
    .filter((b) => b.contributingSignals.some((s) => s === signalId))
    .map((bounty) => ({
      id: bounty.id,
      title: bounty.title,
      topics: bounty.topics,
      ...(bounty.location != null && { location: bounty.location }),
      status: bounty.status,
      fundingAmount: bounty.fundingAmount,
      contributionCount: bounty.contributingSignals.length,
      payoutMode: bounty.payoutMode,
      expiresAt: bounty.expiresAt,
    }));
}

/**
 * Get a mapping of bounty IDs to their contributing signal IDs.
 * This allows filtering signals by bounty on the client side.
 */
export function getBountySignalsMap(): Record<string, readonly string[]> {
  return Object.fromEntries(
    mockBounties.map((bounty) => [bounty.id, bounty.contributingSignals])
  );
}

/**
 * Get the bounty linked to a story chain (if any).
 * Returns the full Bounty object for chains that have associated funding.
 */
export function getBountyForChain(chainId: ChainId): Bounty | undefined {
  return mockBounties.find(
    (b) => b.relatedChainId === chainId && b.status === 'open'
  );
}

/**
 * Get orphan bounties - open bounties that don't have a story chain yet.
 * These are "open questions" waiting for their first signals to form a story.
 */
export function getOrphanBounties(): Bounty[] {
  return mockBounties.filter(
    (b) => b.status === 'open' && b.relatedChainId === undefined
  );
}

/**
 * Get a mapping of chain IDs to their associated bounty (if any).
 */
export function getChainBountyMap(): Record<string, Bounty> {
  const map: Record<string, Bounty> = {};
  for (const bounty of mockBounties) {
    if (bounty.relatedChainId !== undefined && bounty.status === 'open') {
      map[bounty.relatedChainId] = bounty;
    }
  }
  return map;
}
