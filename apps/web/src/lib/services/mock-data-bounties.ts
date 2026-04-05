/**
 * Mock bounty data for development.
 *
 * This module provides accessor functions for seeded data.
 * Data is populated by running `pnpm seed:dev`.
 * Use the service abstractions to access this data in components.
 */

import type { Bounty, BountyPreview, ChainId } from '@cocuyo/types';
import {
  getBounties as getSeededBounties,
  getAllBountyIds as getSeededBountyIds,
  getAllBountyIdsAsync as getSeededBountyIdsAsync,
  type Locale,
} from './seed-store';

export type { Locale } from './seed-store';

/**
 * Get all bounties for a locale.
 */
export function getBounties(locale: Locale = 'en'): Bounty[] {
  return getSeededBounties(locale);
}

/**
 * Get bounty previews for listing.
 */
export function getBountyPreviews(locale: Locale = 'en'): BountyPreview[] {
  return getBounties(locale).map((bounty) => ({
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
export function getOpenBounties(locale: Locale = 'en'): BountyPreview[] {
  return getBountyPreviews(locale).filter((b) => b.status === 'open');
}

/**
 * Get a bounty by ID.
 */
export function getBountyById(id: string, locale: Locale = 'en'): Bounty | undefined {
  return getBounties(locale).find((b) => b.id === id);
}

/**
 * Get bounties that a signal contributes to.
 * Returns BountyPreview[] for any bounty where the signal ID appears in contributingSignals.
 */
export function getBountiesForSignal(signalId: string, locale: Locale = 'en'): BountyPreview[] {
  return getBounties(locale)
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
    getBounties('en').map((bounty) => [bounty.id, bounty.contributingSignals])
  );
}

/**
 * Get the bounty linked to a story chain (if any).
 * Returns the full Bounty object for chains that have associated funding.
 */
export function getBountyForChain(chainId: ChainId, locale: Locale = 'en'): Bounty | undefined {
  return getBounties(locale).find(
    (b) => b.relatedChainId === chainId && b.status === 'open'
  );
}

/**
 * Get all open bounties linked to a story chain.
 * Returns BountyPreview[] for chains that have associated funding.
 */
export function getBountiesForChain(chainId: ChainId, locale: Locale = 'en'): BountyPreview[] {
  return getBounties(locale)
    .filter((b) => b.relatedChainId === chainId && b.status === 'open')
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
 * Get orphan bounties - open bounties that don't have a story chain yet.
 * These are "open questions" waiting for their first signals to form a story.
 */
export function getOrphanBounties(locale: Locale = 'en'): Bounty[] {
  return getBounties(locale).filter(
    (b) => b.status === 'open' && b.relatedChainId === undefined
  );
}

/**
 * Get a mapping of chain IDs to their associated bounty (if any).
 */
export function getChainBountyMap(locale: Locale = 'en'): Record<string, Bounty> {
  const map: Record<string, Bounty> = {};
  for (const bounty of getBounties(locale)) {
    if (bounty.relatedChainId !== undefined && bounty.status === 'open') {
      map[bounty.relatedChainId] = bounty;
    }
  }
  return map;
}

/**
 * Get all bounty IDs for static generation.
 * @deprecated Use getAllBountyIdsAsync() for deterministic seeding.
 */
export function getAllBountyIds(): string[] {
  return getSeededBountyIds();
}

/**
 * Get all bounty IDs after ensuring seeding is complete.
 * Use this in generateStaticParams().
 */
export async function getAllBountyIdsAsync(): Promise<string[]> {
  return getSeededBountyIdsAsync();
}
