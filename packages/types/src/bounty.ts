/**
 * Bounty types — community-funded requests for information.
 *
 * Bounties create a functioning market for investigative information,
 * funded by the people who need it. No intermediary takes a cut,
 * no payment processor can block the transaction.
 */

import type { BountyId, ChainId, DIMCredential, SignalId } from './brands';

/** Status of a bounty */
export type BountyStatus =
  | 'open'       // Accepting contributions
  | 'fulfilled'  // Sufficient information received
  | 'expired'    // Time limit reached without fulfillment
  | 'cancelled'; // Cancelled by funder

/**
 * A bounty — a funded request for specific information.
 *
 * Examples:
 * - "What is happening with water quality downstream of [facility]?"
 * - "Can anyone document the condition of [public infrastructure]?"
 * - "What are the actual wait times at [government office]?"
 */
export interface Bounty {
  /** Unique identifier */
  readonly id: BountyId;
  /** What information is being requested */
  readonly title: string;
  /** Detailed description of what's needed */
  readonly description: string;
  /** Relevant topics */
  readonly topics: readonly string[];
  /** Geographic focus if applicable */
  readonly location?: string;
  /** Current status */
  readonly status: BountyStatus;
  /** Total funding in stablecoin (smallest unit) */
  readonly fundingAmount: bigint;
  /** DIM credential of the funder (anonymous) */
  readonly funderCredential: DIMCredential;
  /** Signals that have contributed to this bounty */
  readonly contributingSignals: readonly SignalId[];
  /** Story chain that may have formed around this bounty */
  readonly relatedChainId?: ChainId;
  /** When this bounty was posted (Unix timestamp) */
  readonly createdAt: number;
  /** When this bounty expires (Unix timestamp) */
  readonly expiresAt: number;
}

/**
 * A lightweight preview of a bounty for list views.
 */
export interface BountyPreview {
  readonly id: BountyId;
  readonly title: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly status: BountyStatus;
  readonly fundingAmount: bigint;
  readonly contributionCount: number;
  readonly expiresAt: number;
}

/**
 * Input type for creating a new bounty.
 */
export interface NewBounty {
  readonly title: string;
  readonly description: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly fundingAmount: bigint;
  /** Duration in seconds */
  readonly duration: number;
}
