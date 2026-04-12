'use client';

/**
 * Chain service hook.
 *
 * Provides story chain operations.
 * All operations are read-only (no wallet required).
 */

import { useCallback } from 'react';
import type {
  ChainService,
  StoryChain,
  ChainId,
  ChainPreview,
  PaginationParams,
  PaginatedResult,
} from '@cocuyo/types';
import { getBulletinClient } from '@/lib/chain/client';
import { fetchFromBulletin } from '../service-utils';

export type Locale = 'en' | 'es';

const USE_CHAIN = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

/**
 * Hook providing story chain service operations.
 *
 * All operations are read-only and work without wallet connection.
 */
export function useChainService(): ChainService {
  const getChain = useCallback(async (id: ChainId, _locale = 'en'): Promise<StoryChain | null> => {
    if (USE_CHAIN) {
      try {
        const bulletin = await getBulletinClient();
        return await bulletin.fetchJson<StoryChain>(id);
      } catch {
        return null;
      }
    }

    // Try fetching from Bulletin Chain
    return fetchFromBulletin<StoryChain>(id);
  }, []);

  const getChains = useCallback(
    async (_params: {
      topic?: string;
      location?: string;
      status?: StoryChain['status'];
      pagination: PaginationParams;
      locale?: string;
    }): Promise<PaginatedResult<ChainPreview>> => {
      // Returns empty until indexing is implemented
      return { items: [], total: 0, hasMore: false };
    },
    []
  );

  const getFeaturedChains = useCallback(
    async (_locale = 'en'): Promise<readonly ChainPreview[]> => {
      // Returns empty until indexing is implemented
      return [];
    },
    []
  );

  return {
    getChain,
    getChains,
    getFeaturedChains,
  };
}
