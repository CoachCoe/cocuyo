/**
 * Campaign types — sponsored fact-checking efforts.
 *
 * A campaign is a funded request for verification of specific claims or topics.
 * Sponsored by outlets, collectives, or community funding.
 */

import type {
  CampaignId,
  ChainId,
  ClaimId,
  CollectiveId,
  CommunityId,
  DIMCredential,
  EscrowId,
  OutletId,
  PolkadotAddress,
  PostId,
  TransactionHash,
} from './brands';
import type { PUSDAmount } from './currency';
import type { PaymentMode } from './payment-mode';

/** Status of a campaign */
export type CampaignStatus =
  | 'active' // Accepting contributions
  | 'completed' // Deliverables met
  | 'expired' // Time limit reached
  | 'cancelled'; // Cancelled by sponsor

/** Discriminated union for type-safe sponsors */
export type CampaignSponsor =
  | { readonly type: 'outlet'; readonly id: OutletId; readonly name: string }
  | { readonly type: 'collective'; readonly id: CollectiveId; readonly name: string }
  | { readonly type: 'community'; readonly id: CommunityId; readonly name: string }
  | { readonly type: 'firefly'; readonly credential: DIMCredential; readonly pseudonym: string };

/** Types of deliverables for campaign completion */
export type DeliverableType =
  | 'evidence_gathered'
  | 'sources_verified'
  | 'verdict_issued'
  | 'story_published';

/** A single deliverable with progress tracking */
export interface CampaignDeliverable {
  readonly type: DeliverableType;
  readonly target: number;
  readonly current: number;
}

/**
 * A campaign — a funded request for fact-checking.
 */
export interface Campaign {
  readonly id: CampaignId;
  readonly title: string;
  readonly description: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly sponsor: CampaignSponsor;
  readonly status: CampaignStatus;
  readonly fundingAmount: PUSDAmount;
  readonly escrowId: EscrowId;
  readonly fundingTxHash: TransactionHash;
  readonly payoutMode: PaymentMode;
  readonly deliverables: readonly CampaignDeliverable[];
  readonly assignedCollectiveId?: CollectiveId;
  readonly contributingPostIds: readonly PostId[];
  readonly targetClaimIds?: readonly ClaimId[];
  readonly relatedChainId?: ChainId;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly cid?: string;
}

/**
 * Lightweight preview of a campaign for list views.
 */
export interface CampaignPreview {
  readonly id: CampaignId;
  readonly title: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly sponsor: CampaignSponsor;
  readonly status: CampaignStatus;
  readonly fundingAmount: PUSDAmount;
  readonly payoutMode: PaymentMode;
  readonly contributionCount: number;
  readonly deliverableProgress: number;
  readonly expiresAt: number;
}

/**
 * Input type for creating a new campaign.
 */
export interface NewCampaign {
  readonly title: string;
  readonly description: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly sponsor: CampaignSponsor;
  readonly fundingAmount: PUSDAmount;
  readonly payoutMode?: PaymentMode;
  readonly deliverables: readonly Omit<CampaignDeliverable, 'current'>[];
  readonly targetClaimIds?: readonly ClaimId[];
  readonly duration: number;
}

/**
 * Payout record for a completed campaign.
 */
export interface CampaignPayout {
  readonly campaignId: CampaignId;
  readonly totalAmount: PUSDAmount;
  readonly distributions: readonly PayoutDistribution[];
  readonly txHash?: TransactionHash;
  readonly executedAt: number;
}

/**
 * Individual payout to a campaign contributor.
 */
export interface PayoutDistribution {
  readonly postId: PostId;
  readonly recipientAddress?: PolkadotAddress;
  readonly recipientCredential: DIMCredential;
  readonly amount: PUSDAmount;
  readonly percentage: number;
}

/**
 * A tracked contribution to a campaign.
 */
export interface CampaignContribution {
  readonly postId: PostId;
  readonly campaignId: CampaignId;
  readonly contributorCredential: DIMCredential;
  readonly topics: readonly string[];
  readonly corroborationCount: number;
  readonly createdAt: number;
}

/**
 * A computed allocation share for a campaign contributor.
 */
export interface AllocationShare {
  readonly contributorCredential: DIMCredential;
  readonly recipientAddress: PolkadotAddress;
  readonly postIds: readonly PostId[];
  readonly corroborationCount: number;
  readonly sharePercent: number;
  readonly amount: PUSDAmount;
}

/**
 * Input for computing campaign allocation.
 */
export interface AllocationInput {
  readonly contributions: readonly CampaignContribution[];
  readonly campaignTopics: readonly string[];
  readonly totalFunding: PUSDAmount;
}

/**
 * Result of allocation computation.
 */
export interface AllocationResult {
  readonly shares: readonly AllocationShare[];
  readonly totalCorroborations: number;
  readonly contributorCount: number;
}
