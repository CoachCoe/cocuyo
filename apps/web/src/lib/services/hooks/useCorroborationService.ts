'use client';

/**
 * Corroboration service hook.
 *
 * This hook wraps the singleton corroborationService to provide wallet state integration.
 * All data is stored in the singleton's cache to avoid cache divergence.
 */

import { useCallback, useRef } from 'react';
import type {
  CorroborationService,
  Corroboration,
  CorroborationId,
  PostId,
  NewCorroboration,
  Result,
} from '@cocuyo/types';
import { useSigner } from '@/lib/context/SignerContext';
import { corroborationService, setConnectedWallet } from '../index';

/**
 * Hook providing corroboration service operations.
 *
 * All operations delegate to the singleton corroborationService to ensure
 * consistent caching. Write operations use wallet state from useSigner().
 */
export function useCorroborationService(): CorroborationService {
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
  const getPostCorroborations = useCallback(
    async (postId: PostId): Promise<readonly Corroboration[]> => {
      return corroborationService.getPostCorroborations(postId);
    },
    []
  );

  const corroborate = useCallback(
    async (newCorroboration: NewCorroboration): Promise<Result<CorroborationId, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return { ok: false, error: 'Wallet not connected. Please connect to corroborate.' };
      }

      // Sync wallet state to singleton
      setConnectedWallet(account.address);

      // Delegate to singleton service which maintains the unified cache
      return corroborationService.corroborate(newCorroboration);
    },
    []
  );

  return {
    getPostCorroborations,
    corroborate,
  };
}
