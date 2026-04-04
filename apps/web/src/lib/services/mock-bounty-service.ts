/**
 * Mock bounty service for development.
 *
 * Uses mock data from mock-data-bounties.ts with session cache
 * for user-created bounties.
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
  createDIMCredential,
  createEscrowId,
  createTransactionHash,
} from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import {
  getBountyById,
  getBountyPreviews,
  getOpenBounties,
  type Locale,
} from './mock-data-bounties';

// Session cache for user-created bounties
const userBounties: Bounty[] = [];

// Connected wallet
let connectedAddress: string | null = null;

export function setBountyWallet(address: string | null): void {
  connectedAddress = address;
}

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
 * Mock implementation of BountyService.
 *
 * This service uses static mock data for development.
 * Replace with ChainBountyService when blockchain integration is ready.
 */
export class MockBountyService implements BountyService {
  /**
   * Get a single bounty by ID.
   */
  async getBounty(id: BountyId, locale?: string): Promise<Bounty | null> {
    // Check user bounties first
    const userBounty = userBounties.find((b) => b.id === id);
    if (userBounty) return userBounty;

    // Simulate network delay
    await this.delay(50);
    return getBountyById(id, (locale ?? 'en') as Locale) ?? null;
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
    // Simulate network delay
    await this.delay(100);

    const locale = (params.locale ?? 'en') as Locale;

    // Combine user bounties with mock bounties
    const userOpenPreviews = userBounties
      .filter((b) => b.status === 'open')
      .map(bountyToPreview);
    let bounties = [...userOpenPreviews, ...getOpenBounties(locale)];

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
    // Simulate network delay
    await this.delay(100);

    const locale = (params.locale ?? 'en') as Locale;

    // Combine user bounties with mock bounties
    const userPreviews = userBounties.map(bountyToPreview);
    let bounties = [...userPreviews, ...getBountyPreviews(locale)];

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
    if (connectedAddress === null) {
      return Promise.resolve(
        err('Wallet not connected. Please connect to create a bounty.')
      );
    }

    const now = Date.now();
    const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);

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
    if (connectedAddress === null) {
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

    // For mock bounties, just return success
    return Promise.resolve(ok(undefined));
  }

  /**
   * Simulate network delay for realistic UX.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
