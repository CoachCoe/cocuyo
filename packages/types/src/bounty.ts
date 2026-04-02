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
  SignalId,
  TransactionHash,
} from './brands';
import type { PUSDAmount } from './currency';
import type { PaymentMode } from './payment-mode';

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
  /** Signal that contributed to fulfillment */
  readonly signalId: SignalId;
  /** Recipient's wallet address (for public mode) */
  readonly recipientAddress?: PolkadotAddress;
  /** Recipient's DIM credential (for attribution) */
  readonly recipientCredential: DIMCredential;
  /** Amount paid */
  readonly amount: PUSDAmount;
  /** Percentage of total bounty (0-100) */
  readonly percentage: number;
}
