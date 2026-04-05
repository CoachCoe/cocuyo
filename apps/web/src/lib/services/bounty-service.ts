/**
 * Bounty Service implementation with Bulletin storage.
 *
 * This service provides:
 * - Bulletin Chain storage for bounties (writes)
 * - Session cache for immediate feedback
 * - Empty results for queries until indexing is implemented
 */

import type {
  BountyId,
  BountyService,
  Bounty,
  BountyPreview,
  NewBounty,
  PaginatedResult,
  PaginationParams,
  Result,
  SignalId,
} from '@cocuyo/types';
import {
  ok,
  err,
  createBountyId,
  createEscrowId,
  createTransactionHash,
} from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import {
  getConnectedWallet,
  getConnectedCredential,
  fetchFromBulletin,
} from './service-utils';

export type Locale = 'en' | 'es';

// Session cache for user-created bounties
const userBounties: Bounty[] = [];

function bountyToPreview(bounty: Bounty): BountyPreview {
  return {
    id: bounty.id,
    title: bounty.title,
    topics: bounty.topics,
    ...(bounty.location !== undefined && { location: bounty.location }),
    status: bounty.status,
    fundingAmount: bounty.fundingAmount,
    contributionCount: bounty.contributingSignals.length,
    payoutMode: bounty.payoutMode,
    expiresAt: bounty.expiresAt,
  };
}

/**
 * Bounty Service implementation.
 */
export class BountyServiceImpl implements BountyService {
  /**
   * Get a single bounty by ID.
   */
  async getBounty(id: BountyId, _locale?: string): Promise<Bounty | null> {
    // Check user bounties first
    const userBounty = userBounties.find((b) => b.id === id);
    if (userBounty) return userBounty;

    // Try fetching from Bulletin Chain
    return fetchFromBulletin<Bounty>(id);
  }

  /**
   * Get open bounties with optional filtering and pagination.
   */
  async getOpenBounties(params: {
    topic?: string;
    location?: string;
    locale?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<BountyPreview>> {
    // Return only user-created open bounties
    let bounties = userBounties
      .filter((b) => b.status === 'open')
      .map(bountyToPreview);

    // Filter by topic if specified
    if (params.topic !== undefined) {
      const topicLower = params.topic.toLowerCase();
      bounties = bounties.filter((b) =>
        b.topics.some((t) => t.toLowerCase().includes(topicLower))
      );
    }

    // Filter by location if specified
    if (params.location !== undefined) {
      const locationLower = params.location.toLowerCase();
      bounties = bounties.filter(
        (b) => b.location?.toLowerCase().includes(locationLower) ?? false
      );
    }

    // Apply pagination
    const { limit, offset } = params.pagination;
    const paginatedItems = bounties.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total: bounties.length,
      hasMore: offset + limit < bounties.length,
    };
  }

  /**
   * Get all bounties (not just open) with optional filtering and pagination.
   */
  async getAllBounties(params: {
    topic?: string;
    location?: string;
    status?: string;
    locale?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<BountyPreview>> {
    // Return only user-created bounties
    let bounties = userBounties.map(bountyToPreview);

    // Filter by status if specified
    if (params.status !== undefined) {
      bounties = bounties.filter((b) => b.status === params.status);
    }

    // Filter by topic if specified
    if (params.topic !== undefined) {
      const topicLower = params.topic.toLowerCase();
      bounties = bounties.filter((b) =>
        b.topics.some((t) => t.toLowerCase().includes(topicLower))
      );
    }

    // Filter by location if specified
    if (params.location !== undefined) {
      const locationLower = params.location.toLowerCase();
      bounties = bounties.filter(
        (b) => b.location?.toLowerCase().includes(locationLower) ?? false
      );
    }

    // Apply pagination
    const { limit, offset } = params.pagination;
    const paginatedItems = bounties.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total: bounties.length,
      hasMore: offset + limit < bounties.length,
    };
  }

  /**
   * Create a new bounty.
   */
  createBounty(newBounty: NewBounty): Promise<Result<BountyId, string>> {
    const dimCredential = getConnectedCredential();
    if (dimCredential === null) {
      return Promise.resolve(
        err('Wallet not connected. Please connect to create a bounty.')
      );
    }

    const now = Date.now();

    const bounty: Bounty = {
      id: '' as BountyId,
      title: newBounty.title,
      description: newBounty.description,
      topics: newBounty.topics,
      ...(newBounty.location !== undefined && { location: newBounty.location }),
      status: 'open',
      fundingAmount: newBounty.fundingAmount,
      funderCredential: dimCredential,
      escrowId: createEscrowId(`escrow-${Date.now()}`),
      fundingTxHash: createTransactionHash(`0x${Date.now().toString(16)}`),
      payoutMode: newBounty.payoutMode ?? 'private',
      contributingSignals: [],
      createdAt: now,
      expiresAt: now + newBounty.duration * 1000,
    };

    // Generate CID-based ID
    const cid = calculateCIDFromJSON(bounty);
    const bountyWithId: Bounty = { ...bounty, id: createBountyId(cid) };

    // Add to session cache
    userBounties.unshift(bountyWithId);

    return Promise.resolve(ok(bountyWithId.id));
  }

  /**
   * Contribute a signal to a bounty.
   */
  contributeToToBounty(
    bountyId: BountyId,
    signalId: SignalId
  ): Promise<Result<void, string>> {
    if (getConnectedWallet() === null) {
      return Promise.resolve(
        err('Wallet not connected. Please connect to contribute.')
      );
    }

    // Find bounty in user cache
    const bountyIndex = userBounties.findIndex((b) => b.id === bountyId);
    if (bountyIndex !== -1) {
      const oldBounty = userBounties[bountyIndex];
      if (oldBounty) {
        userBounties[bountyIndex] = {
          ...oldBounty,
          contributingSignals: [...oldBounty.contributingSignals, signalId],
        };
        return Promise.resolve(ok(undefined));
      }
    }

    // Bounty not found in user cache
    return Promise.resolve(err('Bounty not found or is read-only.'));
  }
}

// Export a singleton instance
export const bountyService = new BountyServiceImpl();

// Legacy alias for backward compatibility
export { BountyServiceImpl as MockBountyService };
