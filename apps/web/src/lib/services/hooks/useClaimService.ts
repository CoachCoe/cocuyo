'use client';

/**
 * Claim service hook.
 *
 * This hook wraps the singleton claimService to provide wallet state integration.
 * All data is stored in the singleton's cache to avoid cache divergence.
 */

import { useCallback, useRef } from 'react';
import type {
  ClaimService,
  Claim,
  ClaimPreview,
  ClaimId,
  ClaimStatus,
  PostId,
  PaginationParams,
  PaginatedResult,
  Result,
  NewClaim,
  NewClaimEvidence,
} from '@cocuyo/types';
import { useSigner } from '@/lib/context/SignerContext';
import { claimService, setConnectedWallet } from '../index';

export type Locale = 'en' | 'es';

/**
 * Hook providing claim service operations.
 *
 * All operations delegate to the singleton claimService to ensure
 * consistent caching. Write operations use wallet state from useSigner().
 */
export function useClaimService(): ClaimService {
  const { selectedAccount, isConnected } = useSigner();

  const accountRef = useRef(selectedAccount);
  accountRef.current = selectedAccount;

  const connectedRef = useRef(isConnected);
  connectedRef.current = isConnected;

  // Sync wallet state to singleton service when account changes
  if (selectedAccount) {
    setConnectedWallet(selectedAccount.address);
  }

  // Delegate read operations directly to singleton
  const getClaim = useCallback(async (id: ClaimId, locale = 'en'): Promise<Claim | null> => {
    return claimService.getClaim(id, locale);
  }, []);

  const getClaimsByPost = useCallback(
    async (postId: PostId, locale = 'en'): Promise<readonly Claim[]> => {
      return claimService.getClaimsByPost(postId, locale);
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
      return claimService.getClaimsByStatus(params);
    },
    []
  );

  const getPendingClaims = useCallback(
    async (params: {
      topic?: string;
      pagination: PaginationParams;
      locale?: string;
    }): Promise<PaginatedResult<ClaimPreview>> => {
      return claimService.getPendingClaims(params);
    },
    []
  );

  const extractClaim = useCallback(async (newClaim: NewClaim): Promise<Result<ClaimId, string>> => {
    const account = accountRef.current;
    const connected = connectedRef.current;

    if (!connected || !account) {
      return { ok: false, error: 'Wallet not connected. Please connect to extract a claim.' };
    }

    // Sync wallet state to singleton
    setConnectedWallet(account.address);

    // Delegate to singleton service which maintains the unified cache
    return claimService.extractClaim(newClaim);
  }, []);

  const submitEvidence = useCallback(
    async (claimId: ClaimId, evidence: NewClaimEvidence): Promise<Result<void, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return { ok: false, error: 'Wallet not connected. Please connect to submit evidence.' };
      }

      // Sync wallet state to singleton
      setConnectedWallet(account.address);

      // Delegate to singleton service which maintains the unified cache
      return claimService.submitEvidence(claimId, evidence);
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
