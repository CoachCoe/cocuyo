'use client';

/**
 * Signal service hook.
 *
 * Provides signal operations with integrated wallet state from useSigner().
 * Handles both mock and chain implementations based on NEXT_PUBLIC_USE_CHAIN.
 */

import { useCallback, useRef } from 'react';
import type {
  SignalService,
  Signal,
  SignalId,
  ChainId,
  PaginationParams,
  PaginatedResult,
  Result,
  NewSignal,
} from '@cocuyo/types';
import { ok, err, createSignalId, createDIMCredential, emptyCorroborationSummary } from '@cocuyo/types';
import { useSigner } from '@/lib/context/SignerContext';
import { getBulletinClient } from '@/lib/chain/client';
import {
  generatePseudonym,
  paginate,
  filterByTopic,
  filterByString,
  uploadToBulletin,
  fetchFromBulletin,
} from '../service-utils';

export type Locale = 'en' | 'es';

const USE_CHAIN = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

// Session cache for user-created signals (shared across hook instances)
const userSignals: Signal[] = [];

/**
 * Hook providing signal service operations.
 *
 * All write operations use wallet state from useSigner().
 * Read operations work without wallet connection.
 */
export function useSignalService(): SignalService {
  const { selectedAccount, isConnected } = useSigner();

  // Use ref to avoid stale closures in callbacks
  const accountRef = useRef(selectedAccount);
  accountRef.current = selectedAccount;

  const connectedRef = useRef(isConnected);
  connectedRef.current = isConnected;

  const getSignal = useCallback(
    async (id: SignalId, _locale = 'en'): Promise<Signal | null> => {
      // Check user signals first
      const userSignal = userSignals.find((s) => s.id === id);
      if (userSignal) return userSignal;

      if (USE_CHAIN) {
        try {
          const bulletin = await getBulletinClient();
          return await bulletin.fetchJson<Signal>(id);
        } catch {
          return null;
        }
      }

      // Try fetching from Bulletin Chain as fallback
      return fetchFromBulletin<Signal>(id);
    },
    []
  );

  const getChainSignals = useCallback(
    async (chainId: ChainId, _locale = 'en'): Promise<readonly Signal[]> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return [];
      }

      // Return user-created signals for this chain
      const userChainSignals = userSignals.filter((s) => s.chainLinks.includes(chainId));
      return userChainSignals;
    },
    []
  );

  const getRecentSignals = useCallback(
    async (params: {
      topic?: string;
      location?: string;
      pagination: PaginationParams;
      locale?: string;
    }): Promise<PaginatedResult<Signal>> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return { items: [], total: 0, hasMore: false };
      }

      // Return user-created signals only
      let filtered = [...userSignals];

      filtered = filterByTopic(filtered, (s) => s.context.topics, params.topic);
      filtered = filterByString(filtered, (s) => s.context.locationName, params.location);
      filtered.sort((a, b) => b.createdAt - a.createdAt);

      return paginate(filtered, params.pagination);
    },
    []
  );

  const illuminate = useCallback(
    async (signal: NewSignal): Promise<Result<SignalId, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return err('Wallet not connected. Please connect your wallet to illuminate.');
      }

      if (USE_CHAIN) {
        // Chain implementation requires DIM signing infrastructure
        return err(
          'On-chain illumination requires DIM signing infrastructure. ' +
          'Use mock mode (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
        );
      }

      // Session-cached implementation
      const connectedAddress = account.address;
      const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
      const now = Date.now();

      const fullSignal: Signal = {
        id: '' as SignalId,
        author: {
          id: connectedAddress,
          credentialHash: dimCredential,
          pseudonym: generatePseudonym(connectedAddress),
          disclosureLevel: 'anonymous',
        },
        content: {
          text: signal.content.text,
          ...(signal.content.links && { links: signal.content.links }),
          ...(signal.content.media && { media: signal.content.media }),
        },
        context: {
          topics: signal.context.topics,
          ...(signal.context.locationName !== undefined && { locationName: signal.context.locationName }),
          ...(signal.context.location !== undefined && { location: signal.context.location }),
          ...(signal.context.timeframe !== undefined && { timeframe: signal.context.timeframe }),
        },
        dimSignature: dimCredential,
        corroborations: emptyCorroborationSummary(),
        verification: {
          status: 'unverified',
        },
        chainLinks: signal.chainLinks ?? [],
        createdAt: now,
      };

      // Upload to Bulletin Chain (with local fallback)
      const uploadResult = await uploadToBulletin(fullSignal);
      if (!uploadResult.ok) {
        return err(uploadResult.error);
      }

      // Update with CID
      const signalWithId: Signal = {
        ...fullSignal,
        id: createSignalId(uploadResult.value.cid),
      };

      // Add to session cache
      userSignals.unshift(signalWithId);

      return ok(signalWithId.id);
    },
    []
  );

  return {
    getSignal,
    getChainSignals,
    getRecentSignals,
    illuminate,
  };
}
