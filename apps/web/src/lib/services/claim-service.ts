/**
 * Claim Service implementation with Bulletin Chain storage.
 *
 * This service provides:
 * - Bulletin Chain storage for claims (writes)
 * - localStorage persistence for CID mappings (survives refresh)
 * - Direct chain queries for claim retrieval
 * - In-memory cache for performance
 */

import type {
  ClaimService,
  Claim,
  ClaimPreview,
  ClaimEvidence,
  ClaimId,
  ClaimStatus,
  PostId,
  PaginationParams,
  PaginatedResult,
  Result,
  NewClaim,
  NewClaimEvidence,
} from '@cocuyo/types';
import { ok, err, createClaimId } from '@cocuyo/types';
import {
  getConnectedWallet,
  getConnectedCredential,
  paginate,
  filterByTopic,
  uploadToBulletin,
  fetchFromBulletin,
} from './service-utils';
import { storage } from '../host/storage';

export type Locale = 'en' | 'es';

// ============================================================
// Persistent Index (localStorage-backed)
// ============================================================

const CLAIM_INDEX_KEY = 'claim-index';
const CLAIM_CID_MAP_KEY = 'claim-cid-map';

interface ClaimIndex {
  /** Map of postId -> array of claimIds */
  byPost: Record<string, string[]>;
  /** All known claim IDs for global queries */
  all: string[];
}

/**
 * Maps original claim CID to its latest CID.
 * When evidence is added, the claim gets a new CID but we want to track
 * it under the original ID for index consistency.
 */
type ClaimCidMap = Record<string, string>;

/** In-memory cache of fetched claims */
const claimCache = new Map<ClaimId, Claim>();

/** Load the claim index from storage */
export async function loadClaimIndex(): Promise<ClaimIndex> {
  const stored = await storage.read<ClaimIndex>(CLAIM_INDEX_KEY);
  return stored ?? { byPost: {}, all: [] };
}

/** Save the claim index to storage */
async function saveIndex(index: ClaimIndex): Promise<void> {
  await storage.write(CLAIM_INDEX_KEY, index);
}

/** Load the CID map from storage */
async function loadCidMap(): Promise<ClaimCidMap> {
  const stored = await storage.read<ClaimCidMap>(CLAIM_CID_MAP_KEY);
  return stored ?? {};
}

/** Save the CID map to storage */
async function saveCidMap(map: ClaimCidMap): Promise<void> {
  await storage.write(CLAIM_CID_MAP_KEY, map);
}

/** Get the latest CID for a claim (follows the CID chain if updated) */
async function getLatestCid(claimId: ClaimId): Promise<ClaimId> {
  const cidMap = await loadCidMap();
  return (cidMap[claimId] as ClaimId | undefined) ?? claimId;
}

/** Update the CID mapping when a claim is modified */
async function updateCidMapping(originalId: ClaimId, newCid: ClaimId): Promise<void> {
  const cidMap = await loadCidMap();
  cidMap[originalId] = newCid;
  await saveCidMap(cidMap);
}

/** Add a claim to the index (exported for use by AppStateProvider) */
export async function indexClaim(claimId: ClaimId, postId: PostId): Promise<void> {
  const index = await loadClaimIndex();

  // Add to post mapping
  const postClaims = index.byPost[postId] ?? [];
  if (!postClaims.includes(claimId)) {
    index.byPost[postId] = [...postClaims, claimId];
  }

  // Add to global list
  if (!index.all.includes(claimId)) {
    index.all = [claimId, ...index.all]; // Newest first
  }

  await saveIndex(index);
}

/** Cache a claim in memory */
export function cacheClaim(claim: Claim): void {
  claimCache.set(claim.id, claim);
}

/** Fetch a claim from cache or chain (exported for AppStateProvider) */
export async function fetchClaim(claimId: ClaimId): Promise<Claim | null> {
  // Check for updated CID (claim may have been modified with new evidence)
  const latestCid = await getLatestCid(claimId);

  // Check cache first (using latest CID)
  const cached = claimCache.get(latestCid);
  if (cached) {
    // Also cache under original ID for consistency
    if (latestCid !== claimId) {
      claimCache.set(claimId, cached);
    }
    return cached;
  }

  // Fetch from chain using latest CID
  const claim = await fetchFromBulletin<Claim>(latestCid);
  if (claim) {
    // Keep original ID for external references, but store under both
    const claimWithId = { ...claim, id: claimId };
    claimCache.set(claimId, claimWithId);
    claimCache.set(latestCid, claimWithId);
    return claimWithId;
  }

  return null;
}

/** Fetch multiple claims in parallel (exported for AppStateProvider) */
export async function fetchClaims(claimIds: readonly string[]): Promise<Claim[]> {
  const results = await Promise.all(claimIds.map((id) => fetchClaim(id as ClaimId)));
  return results.filter((c): c is Claim => c !== null);
}

function claimToPreview(claim: Claim): ClaimPreview {
  return {
    id: claim.id,
    statement: claim.statement,
    sourcePostId: claim.sourcePostId,
    status: claim.status,
    topics: claim.topics,
    evidenceCount: claim.evidence.length,
    supportingCount: claim.evidence.filter((e) => e.supports).length,
    contradictingCount: claim.evidence.filter((e) => !e.supports).length,
    createdAt: claim.createdAt,
  };
}

export class ClaimServiceImpl implements ClaimService {
  /**
   * Get a single claim by ID.
   * Checks cache first, then fetches from Bulletin Chain.
   */
  async getClaim(id: ClaimId, _locale: Locale = 'en'): Promise<Claim | null> {
    return fetchClaim(id);
  }

  /**
   * Get all claims extracted from a specific post.
   * Loads CIDs from localStorage index, fetches from chain.
   */
  async getClaimsByPost(postId: PostId, _locale: Locale = 'en'): Promise<readonly Claim[]> {
    const index = await loadClaimIndex();
    const claimIds = index.byPost[postId] ?? [];

    if (claimIds.length === 0) {
      return [];
    }

    return fetchClaims(claimIds);
  }

  /**
   * Get claims filtered by status and topic.
   * Fetches all indexed claims and filters in memory.
   */
  async getClaimsByStatus(params: {
    status?: ClaimStatus;
    topic?: string;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<ClaimPreview>> {
    const index = await loadClaimIndex();
    const claims = await fetchClaims(index.all);

    let filtered = claims.map(claimToPreview);

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    // Filter by topic using shared utility
    filtered = filterByTopic(filtered, (c) => c.topics, params.topic);

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate using shared utility
    return paginate(filtered, params.pagination);
  }

  /**
   * Get pending claims awaiting verification.
   */
  async getPendingClaims(params: {
    topic?: string;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<ClaimPreview>> {
    const index = await loadClaimIndex();
    const claims = await fetchClaims(index.all);

    let filtered = claims
      .filter((c) => c.status === 'pending' || c.status === 'under_review')
      .map(claimToPreview);

    // Filter by topic using shared utility
    filtered = filterByTopic(filtered, (c) => c.topics, params.topic);

    // Sort oldest first for workbench
    filtered.sort((a, b) => a.createdAt - b.createdAt);

    // Paginate using shared utility
    return paginate(filtered, params.pagination);
  }

  /**
   * Extract a claim from a post.
   * Uploads to Bulletin Chain and indexes the CID in localStorage.
   */
  async extractClaim(newClaim: NewClaim): Promise<Result<ClaimId, string>> {
    const connectedAddress = getConnectedWallet();
    const dimCredential = getConnectedCredential();

    if (connectedAddress === null || dimCredential === null) {
      return err('Wallet not connected. Please connect to extract a claim.');
    }

    const now = Date.now();
    const claim: Omit<Claim, 'id'> = {
      statement: newClaim.statement,
      sourcePostId: newClaim.sourcePostId,
      extractedBy: dimCredential,
      topics: newClaim.topics ?? [],
      evidence: [],
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Upload to Bulletin Chain
    const uploadResult = await uploadToBulletin(claim);
    if (!uploadResult.ok) {
      return err(uploadResult.error);
    }

    const claimId = createClaimId(uploadResult.value.cid);
    const claimWithId: Claim = { ...claim, id: claimId };

    // Cache the claim
    claimCache.set(claimId, claimWithId);

    // Index the claim for future queries
    await indexClaim(claimId, newClaim.sourcePostId);

    return ok(claimId);
  }

  /**
   * Submit evidence for a claim.
   * Updates the claim and re-uploads to chain.
   */
  async submitEvidence(
    claimId: ClaimId,
    evidence: NewClaimEvidence
  ): Promise<Result<void, string>> {
    const connectedAddress = getConnectedWallet();
    const dimCredential = getConnectedCredential();

    if (connectedAddress === null || dimCredential === null) {
      return err('Wallet not connected. Please connect to submit evidence.');
    }

    // Fetch the existing claim
    const existingClaim = await fetchClaim(claimId);
    if (!existingClaim) {
      return err('Claim not found.');
    }

    const newEvidence: ClaimEvidence = {
      postId: evidence.postId,
      supports: evidence.supports,
      submittedBy: dimCredential,
      submittedAt: Date.now(),
      ...(evidence.note !== undefined && { note: evidence.note }),
    };

    // Create updated claim
    const updatedClaim: Claim = {
      ...existingClaim,
      evidence: [...existingClaim.evidence, newEvidence],
      updatedAt: Date.now(),
    };

    // Upload updated claim to chain
    const uploadResult = await uploadToBulletin(updatedClaim);
    if (!uploadResult.ok) {
      return err(uploadResult.error);
    }

    const newCid = createClaimId(uploadResult.value.cid);

    // Track the CID update so future fetches get the latest version
    await updateCidMapping(claimId, newCid);

    // Update cache with new version under both IDs
    claimCache.set(claimId, updatedClaim);
    claimCache.set(newCid, updatedClaim);

    return ok(undefined);
  }

  /**
   * Get all claims with pagination.
   */
  getAllClaims(params: {
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<ClaimPreview>> {
    const locale = params.locale;
    return this.getClaimsByStatus({
      pagination: params.pagination,
      ...(locale !== undefined && { locale }),
    });
  }
}

// Export a singleton instance
export const claimService = new ClaimServiceImpl();

// Legacy alias for backward compatibility
export { ClaimServiceImpl as MockClaimService };
