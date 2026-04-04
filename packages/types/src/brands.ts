/**
 * Branded types for domain identifiers.
 * These provide compile-time type safety for IDs that will map to on-chain storage keys.
 */

/** Unique identifier for a signal */
export type SignalId = string & { readonly __brand: 'SignalId' };

/** Unique identifier for a story chain */
export type ChainId = string & { readonly __brand: 'ChainId' };

/** Unique identifier for a corroboration */
export type CorroborationId = string & { readonly __brand: 'CorroborationId' };

/** Unique identifier for a bounty */
export type BountyId = string & { readonly __brand: 'BountyId' };

/** Unique identifier for a firefly (verified human) */
export type FireflyId = string & { readonly __brand: 'FireflyId' };

/** Unique identifier for a fact-checking collective */
export type CollectiveId = string & { readonly __brand: 'CollectiveId' };

/** Unique identifier for a verification request */
export type VerificationRequestId = string & { readonly __brand: 'VerificationRequestId' };

/** DIM credential hash — proves a verified human without revealing identity */
export type DIMCredential = string & { readonly __brand: 'DIMCredential' };

/** Content hash — references content stored on Bulletin Chain */
export type ContentHash = string & { readonly __brand: 'ContentHash' };

/** SS58-encoded Polkadot address */
export type PolkadotAddress = string & { readonly __brand: 'PolkadotAddress' };

/** Transaction hash for on-chain transactions */
export type TransactionHash = string & { readonly __brand: 'TransactionHash' };

/** Unique identifier for a bounty escrow */
export type EscrowId = string & { readonly __brand: 'EscrowId' };

/** Public key for a Coinage coin (single-use, never reused) */
export type CoinPublicKey = string & { readonly __brand: 'CoinPublicKey' };

/** H160 (Ethereum-style) address */
export type H160Address = string & { readonly __brand: 'H160Address' };

/** Unique identifier for a post */
export type PostId = string & { readonly __brand: 'PostId' };

/** Unique identifier for a claim (truth target extracted from a post) */
export type ClaimId = string & { readonly __brand: 'ClaimId' };

/**
 * Type guard utilities for branded types.
 * These are used to create branded values from raw strings.
 */
export function createSignalId(id: string): SignalId {
  return id as SignalId;
}

export function createChainId(id: string): ChainId {
  return id as ChainId;
}

export function createCorroborationId(id: string): CorroborationId {
  return id as CorroborationId;
}

export function createBountyId(id: string): BountyId {
  return id as BountyId;
}

export function createFireflyId(id: string): FireflyId {
  return id as FireflyId;
}

export function createCollectiveId(id: string): CollectiveId {
  return id as CollectiveId;
}

export function createVerificationRequestId(id: string): VerificationRequestId {
  return id as VerificationRequestId;
}

export function createDIMCredential(credential: string): DIMCredential {
  return credential as DIMCredential;
}

export function createContentHash(hash: string): ContentHash {
  return hash as ContentHash;
}

export function createPolkadotAddress(address: string): PolkadotAddress {
  return address as PolkadotAddress;
}

export function createH160Address(address: string): H160Address {
  return address as H160Address;
}

export function createTransactionHash(hash: string): TransactionHash {
  return hash as TransactionHash;
}

export function createEscrowId(id: string): EscrowId {
  return id as EscrowId;
}

export function createCoinPublicKey(key: string): CoinPublicKey {
  return key as CoinPublicKey;
}

export function createPostId(id: string): PostId {
  return id as PostId;
}

export function createClaimId(id: string): ClaimId {
  return id as ClaimId;
}
