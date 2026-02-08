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
  DIMCredential,
  ContentHash,
} from './brands';

export {
  createSignalId,
  createChainId,
  createCorroborationId,
  createBountyId,
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
  Signal,
  NewSignal,
} from './signal';

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
