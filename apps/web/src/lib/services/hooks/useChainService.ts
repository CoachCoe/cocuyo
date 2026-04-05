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
import { getChains as getMockChains, getChainPreviews, type Locale } from '../mock-data';

const USE_CHAIN = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

/**
 * Hook providing story chain service operations.
 *
 * All operations are read-only and work without wallet connection.
 */
export function useChainService(): ChainService {
  const getChain = useCallback(
    async (id: ChainId, locale = 'en'): Promise<StoryChain | null> => {
      if (USE_CHAIN) {
        try {
          const bulletin = await getBulletinClient();
          return await bulletin.fetchJson<StoryChain>(id);
        } catch {
          return null;
        }
      }

      // Mock implementation
      const chains = getMockChains(locale as Locale);
      return chains.find((c) => c.id === id) ?? null;
    },
    []
  );

  const getChains = useCallback(
    async (params: {
      topic?: string;
      location?: string;
      status?: StoryChain['status'];
      pagination: PaginationParams;
      locale?: string;
    }): Promise<PaginatedResult<ChainPreview>> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return { items: [], total: 0, hasMore: false };
      }

      // Mock implementation
      let previews = getChainPreviews((params.locale ?? 'en') as Locale);

      // Filter by topic
      if (params.topic !== undefined) {
        const topicLower = params.topic.toLowerCase();
        previews = previews.filter((p) =>
          p.topics.some((t) => t.toLowerCase().includes(topicLower))
        );
      }

      // Filter by location
      if (params.location !== undefined) {
        const locationLower = params.location.toLowerCase();
        previews = previews.filter(
          (p) => p.location?.toLowerCase().includes(locationLower) ?? false
        );
      }

      // Filter by status
      if (params.status !== undefined) {
        previews = previews.filter((p) => p.status === params.status);
      }

      // Sort by update time (newest first)
      previews.sort((a, b) => b.updatedAt - a.updatedAt);

      // Apply pagination
      const total = previews.length;
      const start = params.pagination.offset;
      const end = start + params.pagination.limit;
      const items = previews.slice(start, end);

      return { items, total, hasMore: end < total };
    },
    []
  );

  const getFeaturedChains = useCallback(
    async (locale = 'en'): Promise<readonly ChainPreview[]> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return [];
      }

      // Mock implementation
      const previews = getChainPreviews(locale as Locale);
      return previews
        .sort((a, b) => b.totalCorroborations - a.totalCorroborations)
        .slice(0, 5);
    },
    []
  );

  return {
    getChain,
    getChains,
    getFeaturedChains,
  };
}
