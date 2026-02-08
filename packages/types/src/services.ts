/**
 * Service interfaces for data access.
 *
 * All data access must go through these service abstractions.
 * This enables swapping mock implementations for chain implementations
 * without changing component code.
 */

import type { BountyId, ChainId, CorroborationId, SignalId } from './brands';
import type { Bounty, BountyPreview, NewBounty } from './bounty';
import type { ChainPreview, StoryChain } from './chain';
import type { Corroboration, NewCorroboration } from './corroboration';
import type { Signal, NewSignal } from './signal';

/**
 * Result type for operations that can fail.
 * Prefer this over throwing exceptions for expected failure cases.
 */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Helper to create success result.
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/**
 * Helper to create error result.
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Pagination parameters.
 */
export interface PaginationParams {
  readonly limit: number;
  readonly offset: number;
}

/**
 * Paginated result.
 */
export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly hasMore: boolean;
}

/**
 * Signal service interface.
 */
export interface SignalService {
  /** Get a single signal by ID */
  getSignal(id: SignalId): Promise<Signal | null>;

  /** Get all signals in a chain */
  getChainSignals(chainId: ChainId): Promise<readonly Signal[]>;

  /** Get recent signals, optionally filtered by topic or location */
  getRecentSignals(params: {
    topic?: string;
    location?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<Signal>>;

  /** Illuminate a new signal */
  illuminate(signal: NewSignal): Promise<Result<SignalId, string>>;
}

/**
 * Chain service interface.
 */
export interface ChainService {
  /** Get a single chain by ID */
  getChain(id: ChainId): Promise<StoryChain | null>;

  /** Get chain previews, optionally filtered */
  getChains(params: {
    topic?: string;
    location?: string;
    status?: StoryChain['status'];
    pagination: PaginationParams;
  }): Promise<PaginatedResult<ChainPreview>>;

  /** Get featured/active chains for the explore page */
  getFeaturedChains(): Promise<readonly ChainPreview[]>;
}

/**
 * Corroboration service interface.
 */
export interface CorroborationService {
  /** Get all corroborations for a signal */
  getSignalCorroborations(signalId: SignalId): Promise<readonly Corroboration[]>;

  /** Submit a corroboration */
  corroborate(
    corroboration: NewCorroboration
  ): Promise<Result<CorroborationId, string>>;
}

/**
 * Bounty service interface.
 */
export interface BountyService {
  /** Get a single bounty by ID */
  getBounty(id: BountyId): Promise<Bounty | null>;

  /** Get open bounties, optionally filtered */
  getOpenBounties(params: {
    topic?: string;
    location?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<BountyPreview>>;

  /** Create a new bounty */
  createBounty(bounty: NewBounty): Promise<Result<BountyId, string>>;

  /** Contribute a signal to a bounty */
  contributeToToBounty(
    bountyId: BountyId,
    signalId: SignalId
  ): Promise<Result<void, string>>;
}
