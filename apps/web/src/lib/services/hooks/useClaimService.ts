'use client';

/**
 * Claim service hook.
 *
 * Provides claim operations with integrated wallet state from useSigner().
 * Handles both mock and chain implementations based on NEXT_PUBLIC_USE_CHAIN.
 */

import { useCallback, useRef } from 'react';
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
import { useSigner } from '@/lib/context/SignerContext';
import { getBulletinClient } from '@/lib/chain/client';
import {
  getClaimPreviews,
  getClaimById,
  getClaimsByPostId,
  getPendingClaims as getMockPendingClaims,
} from '../mock-data-posts';
import type { Locale } from '../mock-data-posts';
import {
  paginate,
  filterByTopic,
  uploadToBulletin,
  fetchFromBulletin,
} from '../mock-service-utils';

const USE_CHAIN = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

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

/**
 * Hook providing claim service operations.
 *
 * Write operations use wallet state from useSigner().
 * Read operations work without wallet connection.
 */
export function useClaimService(): ClaimService {
  const { selectedAccount, isConnected } = useSigner();

  const accountRef = useRef(selectedAccount);
  accountRef.current = selectedAccount;

  const connectedRef = useRef(isConnected);
  connectedRef.current = isConnected;

  const getClaim = useCallback(
    async (id: ClaimId, locale = 'en'): Promise<Claim | null> => {
      // Check user claims first
      const userClaim = userClaims.find((c) => c.id === id);
      if (userClaim) return userClaim;

      if (USE_CHAIN) {
        try {
          const bulletin = await getBulletinClient();
          return await bulletin.fetchJson<Claim>(id);
        } catch {
          return null;
        }
      }

      // Mock implementation
      const mockClaim = getClaimById(id, locale as Locale);
      if (mockClaim) return mockClaim;

      // Try Bulletin Chain as fallback
      return fetchFromBulletin<Claim>(id);
    },
    []
  );

  const getClaimsByPost = useCallback(
    async (postId: PostId, locale = 'en'): Promise<readonly Claim[]> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return [];
      }

      // Mock implementation
      const mockClaims = getClaimsByPostId(postId, locale as Locale);
      const userPostClaims = userClaims.filter((c) => c.sourcePostId === postId);
      return [...userPostClaims, ...mockClaims];
    },
    []
  );

  const getClaimsByStatus = useCallback(
    async (params: {
      status?: ClaimStatus;
      topic?: string;
      pagination: PaginationParams;
      locale?: string;
    }): Promise<PaginatedResult<ClaimPreview>> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return { items: [], total: 0, hasMore: false };
      }

      // Mock implementation
      const userPreviews = userClaims.map(claimToPreview);
      const mockPreviews = getClaimPreviews((params.locale ?? 'en') as Locale);
      let filtered = [...userPreviews, ...mockPreviews];

      // Filter by status
      if (params.status) {
        filtered = filtered.filter((c) => c.status === params.status);
      }

      // Filter by topic
      filtered = filterByTopic(filtered, (c) => c.topics, params.topic);

      // Sort by creation time (newest first)
      filtered.sort((a, b) => b.createdAt - a.createdAt);

      return paginate(filtered, params.pagination);
    },
    []
  );

  const getPendingClaims = useCallback(
    async (params: {
      topic?: string;
      pagination: PaginationParams;
      locale?: string;
    }): Promise<PaginatedResult<ClaimPreview>> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return { items: [], total: 0, hasMore: false };
      }

      // Mock implementation
      const mockPending = getMockPendingClaims((params.locale ?? 'en') as Locale).map(claimToPreview);
      const userPending = userClaims
        .filter((c) => c.status === 'pending' || c.status === 'under_review')
        .map(claimToPreview);

      let filtered = [...userPending, ...mockPending];

      // Filter by topic
      filtered = filterByTopic(filtered, (c) => c.topics, params.topic);

      // Sort oldest first for workbench
      filtered.sort((a, b) => a.createdAt - b.createdAt);

      return paginate(filtered, params.pagination);
    },
    []
  );

  const extractClaim = useCallback(
    async (newClaim: NewClaim): Promise<Result<ClaimId, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return err('Wallet not connected. Please connect to extract a claim.');
      }

      if (USE_CHAIN) {
        return err(
          'On-chain claim extraction requires DIM signing infrastructure. ' +
          'Use mock mode (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
        );
      }

      // Mock implementation
      const connectedAddress = account.address;
      const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
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
    },
    []
  );

  const submitEvidence = useCallback(
    async (claimId: ClaimId, evidence: NewClaimEvidence): Promise<Result<void, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return err('Wallet not connected. Please connect to submit evidence.');
      }

      if (USE_CHAIN) {
        return err(
          'On-chain evidence submission requires DIM signing infrastructure. ' +
          'Use mock mode (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
        );
      }

      // Mock implementation
      const connectedAddress = account.address;
      const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);

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
          return ok(undefined);
        }
      }

      // For mock claims, just return success (can't modify mock data)
      return ok(undefined);
    },
    []
  );

  return {
    getClaim,
    getClaimsByPost,
    getClaimsByStatus,
    getPendingClaims,
    extractClaim,
    submitEvidence,
  };
}
