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
