/**
 * Mock bounty service for development.
 *
 * Uses mock data from mock-data-bounties.ts until blockchain
 * integration is complete.
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
import { err } from '@cocuyo/types';
import {
  getBountyById,
  getBountyPreviews,
  getOpenBounties,
} from './mock-data-bounties';

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
  async getBounty(id: BountyId): Promise<Bounty | null> {
    // Simulate network delay
    await this.delay(50);
    return getBountyById(id) ?? null;
  }

  /**
   * Get open bounties with optional filtering and pagination.
   */
  async getOpenBounties(params: {
    topic?: string;
    location?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<BountyPreview>> {
    // Simulate network delay
    await this.delay(100);

    let bounties = getOpenBounties();

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
    pagination: PaginationParams;
  }): Promise<PaginatedResult<BountyPreview>> {
    // Simulate network delay
    await this.delay(100);

    let bounties = getBountyPreviews();

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
   * Not implemented in mock - returns error.
   */
  createBounty(_bounty: NewBounty): Promise<Result<BountyId, string>> {
    return Promise.resolve(
      err('Bounty creation not available in mock mode. Connect wallet to create bounties.')
    );
  }

  /**
   * Contribute a signal to a bounty.
   * Not implemented in mock - returns error.
   */
  contributeToToBounty(
    _bountyId: BountyId,
    _signalId: SignalId
  ): Promise<Result<void, string>> {
    return Promise.resolve(
      err('Signal contribution not available in mock mode. Connect wallet to contribute.')
    );
  }

  /**
   * Simulate network delay for realistic UX.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
