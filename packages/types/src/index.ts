/**
 * @cocuyo/types
 *
 * Shared TypeScript types for the Firefly Network.
 * These types are designed to map 1:1 to future on-chain data structures.
 */

// Branded types for type-safe identifiers
export type {
  SignalId,
  ChainId,
  CorroborationId,
  BountyId,
  FireflyId,
  CollectiveId,
  VerificationRequestId,
  DIMCredential,
  ContentHash,
} from './brands';

export {
  createSignalId,
  createChainId,
  createCorroborationId,
  createBountyId,
  createFireflyId,
  createCollectiveId,
  createVerificationRequestId,
  createDIMCredential,
  createContentHash,
} from './brands';

// Signal types
export type {
  GeoCoordinate,
  TimeRange,
  MediaAttachment,
  SignalContent,
  SignalContext,
  SignalVerification,
  Signal,
  NewSignal,
} from './signal';

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
} from './bounty';

// Service interfaces
export type {
  Result,
  PaginationParams,
  PaginatedResult,
  SignalService,
  ChainService,
  CorroborationService,
  BountyService,
} from './services';

export { ok, err } from './services';
