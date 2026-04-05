/**
 * Claim Service implementation with Bulletin storage.
 *
 * This service provides:
 * - Bulletin Chain storage for claims (writes)
 * - Session cache for immediate feedback
 * - Empty results for queries until indexing is implemented
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

export type Locale = 'en' | 'es';

// Session cache for user-created claims
const userClaims: Claim[] = [];

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
  async getClaim(id: ClaimId, _locale: Locale = 'en'): Promise<Claim | null> {
    // Check user claims first
    const userClaim = userClaims.find((c) => c.id === id);
    if (userClaim) return userClaim;

    // Try Bulletin Chain
    return fetchFromBulletin<Claim>(id);
  }

  getClaimsByPost(postId: PostId, _locale: Locale = 'en'): Promise<readonly Claim[]> {
    // Return only user-created claims for this post
    const userPostClaims = userClaims.filter((c) => c.sourcePostId === postId);
    return Promise.resolve(userPostClaims);
  }

  getClaimsByStatus(params: {
    status?: ClaimStatus;
    topic?: string;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<ClaimPreview>> {
    // Return only user-created claims
    let filtered = userClaims.map(claimToPreview);

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    // Filter by topic using shared utility
    filtered = filterByTopic(filtered, (c) => c.topics, params.topic);

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate using shared utility
    return Promise.resolve(paginate(filtered, params.pagination));
  }

  getPendingClaims(params: {
    topic?: string;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<ClaimPreview>> {
    // Get pending from user claims only
    const userPending = userClaims
      .filter((c) => c.status === 'pending' || c.status === 'under_review')
      .map(claimToPreview);

    let filtered = [...userPending];

    // Filter by topic using shared utility
    filtered = filterByTopic(filtered, (c) => c.topics, params.topic);

    // Sort oldest first for workbench
    filtered.sort((a, b) => a.createdAt - b.createdAt);

    // Paginate using shared utility
    return Promise.resolve(paginate(filtered, params.pagination));
  }

  async extractClaim(newClaim: NewClaim): Promise<Result<ClaimId, string>> {
    const connectedAddress = getConnectedWallet();
    const dimCredential = getConnectedCredential();

    if (connectedAddress === null || dimCredential === null) {
      return err('Wallet not connected. Please connect to extract a claim.');
    }

    const now = Date.now();
    const claim: Claim = {
      id: '' as ClaimId,
      statement: newClaim.statement,
      sourcePostId: newClaim.sourcePostId,
      extractedBy: dimCredential,
      topics: newClaim.topics ?? [],
      evidence: [],
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Upload to Bulletin Chain (with local fallback)
    const uploadResult = await uploadToBulletin(claim);
    if (!uploadResult.ok) {
      return err(uploadResult.error);
    }

    const claimWithId: Claim = { ...claim, id: createClaimId(uploadResult.value.cid) };
    userClaims.unshift(claimWithId);
    return ok(claimWithId.id);
  }

  submitEvidence(
    claimId: ClaimId,
    evidence: NewClaimEvidence
  ): Promise<Result<void, string>> {
    const connectedAddress = getConnectedWallet();
    const dimCredential = getConnectedCredential();

    if (connectedAddress === null || dimCredential === null) {
      return Promise.resolve(err('Wallet not connected. Please connect to submit evidence.'));
    }

    // Find the claim in user cache
    const claimIndex = userClaims.findIndex((c) => c.id === claimId);
    if (claimIndex !== -1) {
      const oldClaim = userClaims[claimIndex];
      if (oldClaim) {
        const newEvidence: ClaimEvidence = {
          signalId: evidence.signalId,
          supports: evidence.supports,
          submittedBy: dimCredential,
          submittedAt: Date.now(),
          ...(evidence.note !== undefined && { note: evidence.note }),
        };
        // Replace with updated claim (immutable update)
        const updatedClaim: Claim = {
          id: oldClaim.id,
          statement: oldClaim.statement,
          sourcePostId: oldClaim.sourcePostId,
          extractedBy: oldClaim.extractedBy,
          status: oldClaim.status,
          evidence: [...oldClaim.evidence, newEvidence],
          topics: oldClaim.topics,
          createdAt: oldClaim.createdAt,
          updatedAt: Date.now(),
          ...(oldClaim.cid !== undefined && { cid: oldClaim.cid }),
          ...(oldClaim.verdict !== undefined && { verdict: oldClaim.verdict }),
        };
        userClaims[claimIndex] = updatedClaim;
        return Promise.resolve(ok(undefined));
      }
    }

    // Claim not found in user claims
    return Promise.resolve(err('Cannot submit evidence: claim is read-only or does not exist.'));
  }

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
