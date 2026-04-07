/**
 * @cocuyo/types
 *
 * Shared TypeScript types for the Firefly Network.
 * These types are designed to map 1:1 to future on-chain data structures.
 */

// Branded types for type-safe identifiers
export type {
  ChainId,
  CorroborationId,
  BountyId,
  FireflyId,
  CollectiveId,
  VerificationRequestId,
  DIMCredential,
  ContentHash,
  PolkadotAddress,
  H160Address,
  TransactionHash,
  EscrowId,
  CoinPublicKey,
  PostId,
  ClaimId,
  VerdictId,
} from './brands';

export {
  createChainId,
  createCorroborationId,
  createBountyId,
  createFireflyId,
  createCollectiveId,
  createVerificationRequestId,
  createDIMCredential,
  createContentHash,
  createPolkadotAddress,
  createH160Address,
  createTransactionHash,
  createEscrowId,
  createCoinPublicKey,
  createPostId,
  createClaimId,
  createVerdictId,
} from './brands';

// Post types (replaces Signal types)
export type {
  PostStatus,
  GeoCoordinate,
  TimeRange,
  MediaAttachment,
  PostContent,
  PostContext,
  PostVerification,
  Post,
  PostPreview,
  NewPost,
} from './post';

export { MAX_POST_PHOTOS } from './post';

// Claim types
export type {
  ClaimStatus,
  ClaimEvidence,
  ClaimVerdict,
  Claim,
  ClaimPreview,
  NewClaim,
  NewClaimEvidence,
  VerdictStatus,
  Verdict,
  NewVerdict,
} from './claim';

// Identity types
export type {
  DisclosureLevel,
  PublicProfileInfo,
  ReputationScore,
  FireflyStats,
  FireflyProfile,
  FireflyAuthor,
  NewFireflyProfile,
} from './identity';

// Collective types
export type {
  MemberRole,
  MembershipApproval,
  CollectiveMember,
  CollectiveGovernance,
  CollectiveReputation,
  Collective,
  CollectivePreview,
  NewCollective,
  JoinRequestStatus,
  JoinRequest,
} from './collective';

// Verification types
export type {
  VerificationStatus,
  VerificationRequestStatus,
  VerificationEvidence,
  VerificationVote,
  VoteSummary,
  VerificationVerdict,
  VerificationRequest,
  VerificationRequestPreview,
  NewEvidence,
  NewVote,
} from './verification';

// Chain types
export type {
  ChainStatus,
  ChainStats,
  StoryChain,
  ChainPreview,
} from './chain';

// Corroboration types
export type {
  CorroborationType,
  EvidenceType,
  Corroboration,
  CorroborationSummary,
  NewCorroboration,
} from './corroboration';

export { emptyCorroborationSummary } from './corroboration';

// Firefly types
export type {
  TopicReputation,
  FireflyState,
  WalletStatus,
  WalletState,
  WalletActions,
} from './firefly';

// Bounty types
export type {
  BountyStatus,
  Bounty,
  BountyPreview,
  NewBounty,
  BountyPayout,
  PayoutDistribution,
  BountyContribution,
  AllocationShare,
  AllocationInput,
  AllocationResult,
} from './bounty';

// Personhood types
export type {
  PersonhoodLevel,
  PersonhoodCapabilities,
} from './personhood';
export {
  PERSONHOOD_CAPABILITIES,
  getCapabilities,
  canPerform,
  canFundAmount,
  canClaimAmount,
} from './personhood';

// Reputation topic types
export type { ReputationTopic, TopicMetadata } from './reputation-topics';
export {
  REPUTATION_TOPICS,
  TOPIC_METADATA,
  isReputationTopic,
  getTopicMetadata,
  classifyTopics,
} from './reputation-topics';

// Service interfaces
export type {
  Result,
  PaginationParams,
  PaginatedResult,
  PostService,
  ChainService,
  CorroborationService,
  BountyService,
  ClaimService,
  VerdictService,
  // Reputation services
  ReputationError,
  TopicReputationScore,
  ReputationProfile,
  ReputationService,
  // Personhood services
  PersonhoodError,
  PersonhoodState,
  PersonhoodService,
  // Payment services
  PaymentError,
  PaymentService,
  EscrowError,
  EscrowState,
  EscrowService,
  CoinageError,
  CoinageService,
  PaymentRouter,
} from './services';

export { ok, err } from './services';

// Currency types (pUSD)
export type { PUSDAmount, PUSDBalance } from './currency';
export {
  PUSD,
  createPUSDAmount,
  parsePUSD,
  parsePUSDCents,
  toPUSDCents,
  formatPUSD,
  formatPUSDCompact,
  addPUSD,
  subtractPUSD,
  multiplyPUSD,
  comparePUSD,
  meetsMinimumTransfer,
  createPUSDBalance,
  ZERO_PUSD,
} from './currency';

// Coinage types (private payments)
export type {
  CoinExponent,
  Coin,
  CoinWallet,
  PendingTransfer,
  TransferPackage,
  RecyclerVoucher,
  RecyclerClaimToken,
  ClaimTokenAllocation,
  CoinHoldingsSummary,
} from './coinage';
export {
  COIN_VALUES_CENTS,
  COINAGE_CONFIG,
  getCoinValueCents,
  getCoinValueDollars,
  formatCoinValue,
  canTransfer,
  canRecycle,
  mustRecycle,
  decomposeAmountCents,
  totalCoinValueCents,
  validateSplit,
  createEmptyCoinWallet,
  calculateHoldingsSummary,
} from './coinage';

// Payment mode types
export type {
  PaymentMode,
  PaymentUseCase,
  PaymentModeContext,
} from './payment-mode';
export {
  DEFAULT_MODES,
  HIGH_SENSITIVITY_CASES,
  PUBLIC_REQUIRED_CASES,
  selectPaymentMode,
  supportsBothModes,
  describePaymentMode,
  getRecommendation,
} from './payment-mode';
