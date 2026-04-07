/**
 * Service interfaces for data access.
 *
 * All data access must go through these service abstractions.
 * This enables swapping mock implementations for chain implementations
 * without changing component code.
 */

import type {
  BountyId,
  ChainId,
  ClaimId,
  CorroborationId,
  DIMCredential,
  EscrowId,
  PolkadotAddress,
  PostId,
  TransactionHash,
  VerdictId,
} from './brands';
import type { Bounty, BountyPayout, BountyPreview, NewBounty } from './bounty';
import type { ChainPreview, StoryChain } from './chain';
import type { Claim, ClaimPreview, ClaimStatus, NewClaim, NewClaimEvidence, NewVerdict, Verdict } from './claim';
import type { NewPost, Post, PostPreview, PostStatus } from './post';
import type {
  Coin,
  CoinExponent,
  CoinWallet,
  ClaimTokenAllocation,
  RecyclerClaimToken,
  RecyclerVoucher,
  TransferPackage,
} from './coinage';
import type { Corroboration, NewCorroboration } from './corroboration';
import type { PUSDAmount, PUSDBalance } from './currency';
import type { PaymentMode } from './payment-mode';
import type { PersonhoodLevel, PersonhoodCapabilities } from './personhood';
import type { ReputationTopic } from './reputation-topics';

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

// ============================================================================
// Post Service (replaces SignalService)
// ============================================================================

/**
 * Post service interface.
 */
export interface PostService {
  /** Get a single post by ID */
  getPost(id: PostId, locale?: string): Promise<Post | null>;

  /** Get all posts in a chain */
  getChainPosts(chainId: ChainId, locale?: string): Promise<readonly Post[]>;

  /** Get recent posts, optionally filtered by topic or location */
  getRecentPosts(params: {
    topic?: string;
    location?: string;
    status?: PostStatus;
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<PostPreview>>;

  /**
   * Get recent posts with full data for display components.
   * Returns full Post objects instead of PostPreview.
   */
  getRecentPostsForDisplay(params: {
    topic?: string;
    location?: string;
    status?: PostStatus;
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<Post>>;

  /** Illuminate a new post */
  illuminate(post: NewPost): Promise<Result<PostId, string>>;
}

/**
 * Chain service interface.
 */
export interface ChainService {
  /** Get a single chain by ID */
  getChain(id: ChainId, locale?: string): Promise<StoryChain | null>;

  /** Get chain previews, optionally filtered */
  getChains(params: {
    topic?: string;
    location?: string;
    status?: StoryChain['status'];
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<ChainPreview>>;

  /** Get featured/active chains for the explore page */
  getFeaturedChains(locale?: string): Promise<readonly ChainPreview[]>;
}

/**
 * Corroboration service interface.
 */
export interface CorroborationService {
  /** Get all corroborations for a post */
  getPostCorroborations(postId: PostId): Promise<readonly Corroboration[]>;

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
  getBounty(id: BountyId, locale?: string): Promise<Bounty | null>;

  /** Get open bounties, optionally filtered */
  getOpenBounties(params: {
    topic?: string;
    location?: string;
    locale?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<BountyPreview>>;

  /** Create a new bounty */
  createBounty(bounty: NewBounty): Promise<Result<BountyId, string>>;

  /** Contribute a post to a bounty */
  contributeToBounty(
    bountyId: BountyId,
    postId: PostId
  ): Promise<Result<void, string>>;
}

// ============================================================================
// Claim Service
// ============================================================================

/**
 * Claim service interface.
 */
export interface ClaimService {
  /** Get a single claim by ID */
  getClaim(id: ClaimId, locale?: string): Promise<Claim | null>;

  /** Get claims by post ID */
  getClaimsByPost(postId: PostId, locale?: string): Promise<readonly Claim[]>;

  /** Get claims by status (for workbench) */
  getClaimsByStatus(params: {
    status?: ClaimStatus;
    topic?: string;
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<ClaimPreview>>;

  /** Get pending claims for workbench */
  getPendingClaims(params: {
    topic?: string;
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<ClaimPreview>>;

  /** Extract a claim from a post */
  extractClaim(claim: NewClaim): Promise<Result<ClaimId, string>>;

  /** Submit evidence to a claim */
  submitEvidence(
    claimId: ClaimId,
    evidence: NewClaimEvidence
  ): Promise<Result<void, string>>;
}

// ============================================================================
// Verdict Service
// ============================================================================

/**
 * Verdict service interface.
 */
export interface VerdictService {
  /** Get a verdict by ID */
  getVerdict(id: VerdictId): Promise<Verdict | null>;

  /** Get verdict for a claim */
  getVerdictForClaim(claimId: ClaimId): Promise<Verdict | null>;

  /** Issue a verdict on a claim */
  issueVerdict(verdict: NewVerdict): Promise<Result<VerdictId, string>>;
}

// ============================================================================
// Reputation Service
// ============================================================================

/**
 * Error types for reputation operations.
 */
export type ReputationError =
  | { readonly type: 'CREDENTIAL_NOT_FOUND'; readonly credential: DIMCredential }
  | { readonly type: 'INVALID_TOPIC'; readonly topic: string }
  | { readonly type: 'UPDATE_FAILED'; readonly reason: string };

/**
 * Topic-specific reputation score (0-1000 scale).
 */
export interface TopicReputationScore {
  /** The topic domain */
  readonly topic: ReputationTopic;
  /** Score from 0 to 1000 (500 = neutral starting point) */
  readonly score: number;
  /** Number of corroborations given in this topic */
  readonly corroborationsGiven: number;
  /** Number of corroborations received in this topic */
  readonly corroborationsReceived: number;
  /** Number of successful challenges in this topic */
  readonly challengesWon: number;
  /** Number of times challenged and lost */
  readonly challengesLost: number;
}

/**
 * Complete reputation profile for a firefly.
 */
export interface ReputationProfile {
  /** DIM credential */
  readonly credential: DIMCredential;
  /** Reputation scores by topic */
  readonly scores: Readonly<Record<ReputationTopic, TopicReputationScore>>;
  /** Overall reputation (weighted average across topics) */
  readonly overallScore: number;
  /** Total corroborations across all topics */
  readonly totalCorroborations: number;
  /** When reputation was last updated */
  readonly lastUpdated: number;
}

/**
 * Reputation service interface.
 *
 * Manages topic-weighted reputation for fireflies. Reputation is earned
 * through corroborated contributions and lost through failed challenges.
 */
export interface ReputationService {
  /** Get full reputation profile for a credential */
  getReputation(credential: DIMCredential): Promise<ReputationProfile | null>;

  /** Get reputation score for a specific topic */
  getTopicScore(
    credential: DIMCredential,
    topic: ReputationTopic
  ): Promise<number>;

  /** Get average reputation across specified topics */
  getAverageScore(
    credential: DIMCredential,
    topics: readonly ReputationTopic[]
  ): Promise<number>;

  /**
   * Record a corroboration event.
   * Increases reputation for both the corroborator and post author.
   */
  recordCorroboration(params: {
    corroboratorCredential: DIMCredential;
    postAuthorCredential: DIMCredential;
    postId: PostId;
    topics: readonly ReputationTopic[];
  }): Promise<Result<void, ReputationError>>;

  /**
   * Record a successful challenge.
   * Decreases reputation for the post author.
   */
  recordChallenge(params: {
    challengedCredential: DIMCredential;
    postId: PostId;
    topics: readonly ReputationTopic[];
  }): Promise<Result<void, ReputationError>>;
}

// ============================================================================
// Personhood Service
// ============================================================================

/**
 * Error types for personhood operations.
 */
export type PersonhoodError =
  | { readonly type: 'CREDENTIAL_NOT_FOUND'; readonly credential: DIMCredential }
  | { readonly type: 'VERIFICATION_FAILED'; readonly reason: string }
  | { readonly type: 'ALREADY_VERIFIED'; readonly level: PersonhoodLevel };

/**
 * Personhood verification state.
 */
export interface PersonhoodState {
  /** DIM credential */
  readonly credential: DIMCredential;
  /** Current verification level */
  readonly level: PersonhoodLevel;
  /** When verification was completed */
  readonly verifiedAt: number | null;
  /** Verification method used (for audit) */
  readonly verificationMethod?: string;
}

/**
 * Personhood service interface.
 *
 * Manages DIM verification levels and capability checks.
 */
export interface PersonhoodService {
  /** Get personhood state for a credential */
  getPersonhood(credential: DIMCredential): Promise<PersonhoodState | null>;

  /** Get personhood level (convenience method) */
  getLevel(credential: DIMCredential): Promise<PersonhoodLevel>;

  /** Get capabilities for a credential */
  getCapabilities(credential: DIMCredential): Promise<PersonhoodCapabilities>;

  /** Check if a specific action is allowed */
  canPerform(
    credential: DIMCredential,
    action: keyof Omit<PersonhoodCapabilities, 'maxBountyFunding' | 'maxBountyClaim'>
  ): Promise<boolean>;

  /** Check if a funding amount is within limits */
  canFundAmount(credential: DIMCredential, amount: PUSDAmount): Promise<boolean>;

  /** Check if a claim amount is within limits */
  canClaimAmount(credential: DIMCredential, amount: PUSDAmount): Promise<boolean>;

  /**
   * Initiate verification process.
   * Returns a verification URL or session ID.
   */
  startVerification(params: {
    credential: DIMCredential;
    targetLevel: PersonhoodLevel;
  }): Promise<Result<{ verificationUrl: string }, PersonhoodError>>;

  /**
   * Complete verification (called after external verification succeeds).
   */
  completeVerification(params: {
    credential: DIMCredential;
    verificationToken: string;
  }): Promise<Result<PersonhoodState, PersonhoodError>>;
}

// ============================================================================
// Payment Services
// ============================================================================

/**
 * Error types for payment operations.
 */
export type PaymentError =
  | { readonly type: 'INSUFFICIENT_BALANCE'; readonly available: PUSDAmount; readonly required: PUSDAmount }
  | { readonly type: 'INVALID_ADDRESS'; readonly address: string }
  | { readonly type: 'BELOW_MINIMUM'; readonly amount: PUSDAmount; readonly minimum: PUSDAmount }
  | { readonly type: 'TRANSACTION_FAILED'; readonly reason: string }
  | { readonly type: 'NETWORK_ERROR'; readonly reason: string };

/**
 * Payment service for public pUSD transfers.
 */
export interface PaymentService {
  /** Get pUSD balance for an address */
  getBalance(address: PolkadotAddress): Promise<PUSDBalance>;

  /** Transfer pUSD between addresses */
  transfer(params: {
    from: PolkadotAddress;
    to: PolkadotAddress;
    amount: PUSDAmount;
    memo?: string;
  }): Promise<Result<TransactionHash, PaymentError>>;

  /** Watch for incoming transfers to an address */
  watchTransfers(
    address: PolkadotAddress,
    callback: (transfer: {
      from: PolkadotAddress;
      amount: PUSDAmount;
      txHash: TransactionHash;
      timestamp: number;
    }) => void
  ): () => void; // Returns unsubscribe function
}

/**
 * Error types for escrow operations.
 */
export type EscrowError =
  | { readonly type: 'INSUFFICIENT_BALANCE'; readonly available: PUSDAmount; readonly required: PUSDAmount }
  | { readonly type: 'ESCROW_NOT_FOUND'; readonly escrowId: EscrowId }
  | { readonly type: 'ESCROW_ALREADY_SETTLED'; readonly escrowId: EscrowId }
  | { readonly type: 'INVALID_DISTRIBUTION'; readonly reason: string }
  | { readonly type: 'UNAUTHORIZED'; readonly reason: string }
  | { readonly type: 'TRANSACTION_FAILED'; readonly reason: string };

/**
 * Escrow state for a bounty.
 */
export interface EscrowState {
  /** Escrow identifier */
  readonly id: EscrowId;
  /** Associated bounty */
  readonly bountyId: BountyId;
  /** Funder's address */
  readonly funderAddress: PolkadotAddress;
  /** Funder's DIM credential */
  readonly funderCredential: DIMCredential;
  /** Total escrowed amount */
  readonly amount: PUSDAmount;
  /** Current status */
  readonly status: 'active' | 'released' | 'refunded';
  /** Payout mode */
  readonly payoutMode: PaymentMode;
  /** Deposit transaction hash */
  readonly depositTxHash: TransactionHash;
  /** Release/refund transaction hash (if completed) */
  readonly settlementTxHash?: TransactionHash;
  /** When escrow was created */
  readonly createdAt: number;
}

/**
 * Escrow service for bounty fund management.
 */
export interface EscrowService {
  /** Create a new escrow for a bounty */
  createEscrow(params: {
    bountyId: BountyId;
    funderAddress: PolkadotAddress;
    funderCredential: DIMCredential;
    amount: PUSDAmount;
    payoutMode: PaymentMode;
  }): Promise<Result<EscrowState, EscrowError>>;

  /** Get escrow state */
  getEscrow(escrowId: EscrowId): Promise<EscrowState | null>;

  /** Get escrow by bounty ID */
  getEscrowByBounty(bountyId: BountyId): Promise<EscrowState | null>;

  /** Release funds to bounty contributors */
  releaseFunds(params: {
    escrowId: EscrowId;
    distributions: readonly {
      recipientAddress: PolkadotAddress;
      recipientCredential: DIMCredential;
      postId: PostId;
      amount: PUSDAmount;
    }[];
  }): Promise<Result<BountyPayout, EscrowError>>;

  /** Refund funds to funder */
  refundFunds(escrowId: EscrowId): Promise<Result<TransactionHash, EscrowError>>;
}

/**
 * Error types for coinage operations.
 */
export type CoinageError =
  | { readonly type: 'INSUFFICIENT_COINS'; readonly available: number; readonly required: number }
  | { readonly type: 'COIN_NOT_FOUND'; readonly derivationIndex: number }
  | { readonly type: 'COIN_AT_MAX_AGE'; readonly coin: Coin }
  | { readonly type: 'INVALID_SPLIT'; readonly reason: string }
  | { readonly type: 'TRANSFER_EXPIRED'; readonly transferId: string }
  | { readonly type: 'NO_CLAIM_TOKENS'; readonly reason: string }
  | { readonly type: 'RECYCLER_FAILED'; readonly reason: string };

/**
 * Coinage service for private payments.
 */
export interface CoinageService {
  /** Scan chain for user's coins */
  scanForCoins(): Promise<CoinWallet>;

  /** Get current coin wallet state (cached, faster than scan) */
  getWallet(): CoinWallet;

  /** Onboard: convert pUSD to private coins */
  onboard(params: {
    amount: PUSDAmount;
    sourceAddress: PolkadotAddress;
  }): Promise<Result<RecyclerVoucher[], CoinageError>>;

  /** Claim coins from recycler vouchers */
  claimCoins(params: {
    vouchers: readonly RecyclerVoucher[];
    claimToken: RecyclerClaimToken;
  }): Promise<Result<Coin[], CoinageError>>;

  /** Split a coin into smaller denominations */
  splitCoin(params: {
    coin: Coin;
    into: readonly CoinExponent[];
  }): Promise<Result<Coin[], CoinageError>>;

  /** Prepare transfer (returns keys to share off-chain) */
  prepareTransfer(params: {
    coins: readonly Coin[];
    expiresInSeconds?: number;
  }): TransferPackage;

  /** Claim incoming transfer */
  claimTransfer(params: {
    keys: readonly string[];
  }): Promise<Result<Coin[], CoinageError>>;

  /** Cancel pending transfer (reclaim coins to self) */
  cancelTransfer(params: {
    coins: readonly Coin[];
  }): Promise<Result<Coin[], CoinageError>>;

  /** Recycle coins to reset age */
  recycleCoin(params: {
    coins: readonly Coin[];
    claimToken: RecyclerClaimToken;
  }): Promise<Result<Coin[], CoinageError>>;

  /** Offboard: convert private coins to pUSD */
  offboard(params: {
    coins: readonly Coin[];
    destinationAddress: PolkadotAddress;
    claimToken: RecyclerClaimToken;
  }): Promise<Result<TransactionHash, CoinageError>>;

  /** Get free claim token allocation for DIM-verified user */
  getClaimTokenAllocation(credential: DIMCredential): Promise<ClaimTokenAllocation>;
}

/**
 * Payment router for selecting between public and private payments.
 */
export interface PaymentRouter {
  /** Get recommended payment mode for a use case */
  getRecommendedMode(params: {
    useCase: string;
    senderPreference?: PaymentMode;
    receiverPreference?: PaymentMode;
    complianceRequired?: boolean;
    receiverHasCoinage?: boolean;
  }): { mode: PaymentMode; reason: string; warning?: string };

  /** Execute a public payment */
  sendPublicPayment(params: {
    from: PolkadotAddress;
    to: PolkadotAddress;
    amount: PUSDAmount;
    memo?: string;
  }): Promise<Result<TransactionHash, PaymentError>>;

  /** Prepare a private payment (returns transfer package) */
  preparePrivatePayment(params: {
    amountCents: number;
  }): Promise<Result<TransferPackage, CoinageError>>;
}
