/**
 * Bounty types — community-funded requests for information.
 *
 * Bounties create a functioning market for investigative information,
 * funded by the people who need it. No intermediary takes a cut,
 * no payment processor can block the transaction.
 */

import type {
  BountyId,
  ChainId,
  DIMCredential,
  EscrowId,
  PolkadotAddress,
  PostId,
  TransactionHash,
} from './brands';
import type { PUSDAmount } from './currency';
import type { PaymentMode } from './payment-mode';
import type { ReputationTopic } from './reputation-topics';

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
  /** Total funding in pUSD */
  readonly fundingAmount: PUSDAmount;
  /** DIM credential of the funder (anonymous) */
  readonly funderCredential: DIMCredential;
  /** Escrow ID holding the funds */
  readonly escrowId: EscrowId;
  /** Transaction hash of the funding deposit */
  readonly fundingTxHash: TransactionHash;
  /** Payment mode for payout (public pUSD or private Coinage) */
  readonly payoutMode: PaymentMode;
  /** Posts that have contributed to this bounty */
  readonly contributingPostIds: readonly PostId[];
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
  readonly fundingAmount: PUSDAmount;
  readonly contributionCount: number;
  readonly payoutMode: PaymentMode;
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
  readonly fundingAmount: PUSDAmount;
  /** Duration in seconds */
  readonly duration: number;
  /** Preferred payout mode (default: private) */
  readonly payoutMode?: PaymentMode;
}

/**
 * Payout record for a fulfilled bounty.
 */
export interface BountyPayout {
  /** Bounty that was fulfilled */
  readonly bountyId: BountyId;
  /** Total payout amount */
  readonly totalAmount: PUSDAmount;
  /** Distribution to contributors */
  readonly distributions: readonly PayoutDistribution[];
  /** Payment mode used */
  readonly payoutMode: PaymentMode;
  /** Transaction hash (for public mode) */
  readonly txHash?: TransactionHash;
  /** When payout was executed */
  readonly executedAt: number;
}

/**
 * Individual payout to a bounty contributor.
 */
export interface PayoutDistribution {
  /** Post that contributed to fulfillment */
  readonly postId: PostId;
  /** Recipient's wallet address (for public mode) */
  readonly recipientAddress?: PolkadotAddress;
  /** Recipient's DIM credential (for attribution) */
  readonly recipientCredential: DIMCredential;
  /** Amount paid */
  readonly amount: PUSDAmount;
  /** Percentage of total bounty (0-100) */
  readonly percentage: number;
}

// ============================================================================
// Contribution Tracking (for allocation engine)
// ============================================================================

/**
 * A tracked contribution to a bounty.
 *
 * When a post is linked to a bounty, a BountyContribution record is created.
 * The corroborationWeight is updated as the post receives corroborations.
 */
export interface BountyContribution {
  /** The post that contributed */
  readonly postId: PostId;
  /** The bounty being contributed to */
  readonly bountyId: BountyId;
  /** DIM credential of the contributor */
  readonly contributorCredential: DIMCredential;
  /** Topics relevant to this contribution (for reputation weighting) */
  readonly topics: readonly ReputationTopic[];
  /**
   * Corroboration weight — sum of corroborator reputation scores.
   * Updated each time the post receives a corroboration.
   * Higher weight = more valuable contribution.
   */
  readonly corroborationWeight: number;
  /** Number of corroborations received */
  readonly corroborationCount: number;
  /** When this contribution was made */
  readonly createdAt: number;
}

/**
 * A computed allocation share for a bounty contributor.
 *
 * Produced by the allocation engine when a bounty closes.
 * Each contributor's share is proportional to their weighted contributions.
 */
export interface AllocationShare {
  /** DIM credential of the contributor */
  readonly contributorCredential: DIMCredential;
  /** Wallet address for payout (resolved from credential) */
  readonly recipientAddress: PolkadotAddress;
  /** Posts that contributed to this share */
  readonly postIds: readonly PostId[];
  /** Total corroboration weight across all contributed posts */
  readonly totalWeight: number;
  /** Percentage of bounty (0-100, two decimal precision) */
  readonly sharePercent: number;
  /** Computed payout amount */
  readonly amount: PUSDAmount;
}

/**
 * Input for computing bounty allocation.
 */
export interface AllocationInput {
  /** All contributions to the bounty */
  readonly contributions: readonly BountyContribution[];
  /** Topics for reputation lookup */
  readonly bountyTopics: readonly ReputationTopic[];
  /** Total bounty funding */
  readonly totalFunding: PUSDAmount;
}

/**
 * Result of allocation computation.
 */
export interface AllocationResult {
  /** Computed shares for each contributor */
  readonly shares: readonly AllocationShare[];
  /** Total weight used in computation */
  readonly totalWeight: number;
  /** Number of unique contributors */
  readonly contributorCount: number;
}
