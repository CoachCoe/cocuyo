'use client';

/**
 * Corroboration service hook.
 *
 * Provides corroboration operations with integrated wallet state from useSigner().
 * Handles both mock and chain implementations based on NEXT_PUBLIC_USE_CHAIN.
 */

import { useCallback, useRef } from 'react';
import type {
  CorroborationService,
  Corroboration,
  CorroborationId,
  SignalId,
  NewCorroboration,
  Result,
} from '@cocuyo/types';
import { ok, err, createCorroborationId, createDIMCredential } from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import { useSigner } from '@/lib/context/SignerContext';

const USE_CHAIN = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

// Session cache for corroborations
const userCorroborations: Corroboration[] = [];

/**
 * Hook providing corroboration service operations.
 *
 * Write operations use wallet state from useSigner().
 * Read operations work without wallet connection.
 */
export function useCorroborationService(): CorroborationService {
  const { selectedAccount, isConnected } = useSigner();

  const accountRef = useRef(selectedAccount);
  accountRef.current = selectedAccount;

  const connectedRef = useRef(isConnected);
  connectedRef.current = isConnected;

  const getSignalCorroborations = useCallback(
    async (signalId: SignalId): Promise<readonly Corroboration[]> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return [];
      }

      // Mock implementation - return corroborations for this signal
      return userCorroborations.filter((c) => c.signalId === signalId);
    },
    []
  );

  const corroborate = useCallback(
    async (newCorroboration: NewCorroboration): Promise<Result<CorroborationId, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return err('Wallet not connected. Please connect to corroborate.');
      }

      if (USE_CHAIN) {
        return err(
          'On-chain corroboration requires DIM signing infrastructure. ' +
          'Use mock mode (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
        );
      }

      // Mock implementation
      const connectedAddress = account.address;
      const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
      const now = Date.now();

      const corroboration: Corroboration = {
        id: '' as CorroborationId,
        signalId: newCorroboration.signalId,
        type: newCorroboration.type,
        dimSignature: dimCredential,
        weight: 1.0, // Default weight, would be calculated from reputation
        createdAt: now,
        ...(newCorroboration.note !== undefined && { note: newCorroboration.note }),
        ...(newCorroboration.evidenceSignalId !== undefined && {
          evidenceSignalId: newCorroboration.evidenceSignalId,
        }),
      };

      // Generate CID-based ID
      const cid = calculateCIDFromJSON(corroboration);
      const corroborationWithId: Corroboration = {
        ...corroboration,
        id: createCorroborationId(cid),
      };

      // Add to session cache
      userCorroborations.unshift(corroborationWithId);

      return ok(corroborationWithId.id);
    },
    []
  );

  return {
    getSignalCorroborations,
    corroborate,
  };
}
