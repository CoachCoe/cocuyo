/**
 * Mock implementation of the ClaimService with real Bulletin storage.
 *
 * This service provides:
 * - Mock data for demo content (reads)
 * - Real Bulletin Chain storage for new claims (writes)
 * - Session cache for immediate feedback
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
import { ok, err, createClaimId, createDIMCredential } from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import {
  getClaimPreviews,
  getClaimById,
  getClaimsByPostId,
  getPendingClaims as getMockPendingClaims,
} from './mock-data-posts';
import type { Locale } from './mock-data-posts';
import { getBulletinClient } from '../chain/client';

// Session cache for user-created claims
const userClaims: Claim[] = [];

// Connected wallet
let connectedAddress: string | null = null;

export function setClaimWallet(address: string | null): void {
  connectedAddress = address;
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

export class MockClaimService implements ClaimService {
  async getClaim(id: ClaimId, locale: Locale = 'en'): Promise<Claim | null> {
    // Check user claims first
    const userClaim = userClaims.find((c) => c.id === id);
    if (userClaim) return userClaim;

    // Check mock data
    const mockClaim = getClaimById(id, locale);
    if (mockClaim) return mockClaim;

    // Try Bulletin Chain
    try {
      const bulletin = await getBulletinClient();
      return await bulletin.fetchJson<Claim>(id);
    } catch {
      return null;
    }
  }

  getClaimsByPost(postId: PostId, locale: Locale = 'en'): Promise<readonly Claim[]> {
    const mockClaims = getClaimsByPostId(postId, locale);
    const userPostClaims = userClaims.filter((c) => c.sourcePostId === postId);
    return Promise.resolve([...userPostClaims, ...mockClaims]);
  }

  getClaimsByStatus(params: {
    status?: ClaimStatus;
    topic?: string;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<ClaimPreview>> {
    // Combine user and mock claims
    const userPreviews = userClaims.map(claimToPreview);
    const mockPreviews = getClaimPreviews(params.locale ?? 'en');
    let filtered = [...userPreviews, ...mockPreviews];

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    // Filter by topic
    if (params.topic !== undefined) {
      const topicLower = params.topic.toLowerCase();
      filtered = filtered.filter((c) =>
        c.topics.some((t) => t.toLowerCase().includes(topicLower))
      );
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const total = filtered.length;
    const start = params.pagination.offset;
    const end = start + params.pagination.limit;
    const items = filtered.slice(start, end);

    return Promise.resolve({ items, total, hasMore: end < total });
  }

  getPendingClaims(params: {
    topic?: string;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<ClaimPreview>> {
    // Get pending from mock + user claims
    const mockPending = getMockPendingClaims(params.locale ?? 'en').map(claimToPreview);
    const userPending = userClaims
      .filter((c) => c.status === 'pending' || c.status === 'under_review')
      .map(claimToPreview);

    let filtered = [...userPending, ...mockPending];

    // Filter by topic
    if (params.topic !== undefined) {
      const topicLower = params.topic.toLowerCase();
      filtered = filtered.filter((c) =>
        c.topics.some((t) => t.toLowerCase().includes(topicLower))
      );
    }

    // Sort oldest first for workbench
    filtered.sort((a, b) => a.createdAt - b.createdAt);

    // Paginate
    const total = filtered.length;
    const start = params.pagination.offset;
    const end = start + params.pagination.limit;
    const items = filtered.slice(start, end);

    return Promise.resolve({ items, total, hasMore: end < total });
  }

  async extractClaim(newClaim: NewClaim): Promise<Result<ClaimId, string>> {
    if (connectedAddress === null) {
      return err('Wallet not connected. Please connect to extract a claim.');
    }

    const now = Date.now();
    const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
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

    try {
      const bulletin = await getBulletinClient();
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(claim));
      const result = await bulletin.upload(data);

      const claimWithId: Claim = { ...claim, id: createClaimId(result.cid) };
      userClaims.unshift(claimWithId);
      return ok(claimWithId.id);
    } catch {
      // Fallback to local CID
      const cid = calculateCIDFromJSON(claim);
      const claimWithId: Claim = { ...claim, id: createClaimId(cid) };
      userClaims.unshift(claimWithId);
      return ok(claimWithId.id);
    }
  }

  submitEvidence(
    claimId: ClaimId,
    evidence: NewClaimEvidence
  ): Promise<Result<void, string>> {
    if (connectedAddress === null) {
      return Promise.resolve(err('Wallet not connected. Please connect to submit evidence.'));
    }

    // Find the claim (user or mock)
    const claimIndex = userClaims.findIndex((c) => c.id === claimId);
    if (claimIndex !== -1) {
      const oldClaim = userClaims[claimIndex];
      if (oldClaim) {
        const newEvidence: ClaimEvidence = {
          signalId: evidence.signalId,
          supports: evidence.supports,
          submittedBy: createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`),
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

    // For mock claims, just return success (can't modify mock data)
    return Promise.resolve(ok(undefined));
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
export const claimService = new MockClaimService();
