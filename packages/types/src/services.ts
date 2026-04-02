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
  CorroborationId,
  DIMCredential,
  EscrowId,
  PolkadotAddress,
  SignalId,
  TransactionHash,
} from './brands';
import type { Bounty, BountyPayout, BountyPreview, NewBounty } from './bounty';
import type { ChainPreview, StoryChain } from './chain';
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
  getSignal(id: SignalId, locale?: string): Promise<Signal | null>;

  /** Get all signals in a chain */
  getChainSignals(chainId: ChainId, locale?: string): Promise<readonly Signal[]>;

  /** Get recent signals, optionally filtered by topic or location */
  getRecentSignals(params: {
    topic?: string;
    location?: string;
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<Signal>>;

  /** Illuminate a new signal */
  illuminate(signal: NewSignal): Promise<Result<SignalId, string>>;
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
      signalId: SignalId;
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
