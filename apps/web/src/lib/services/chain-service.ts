/**
 * Chain Service implementation.
 *
 * This service provides story chain data access.
 * Returns empty results until indexing is implemented.
 */

import type {
  ChainService,
  StoryChain,
  ChainId,
  ChainPreview,
  PaginationParams,
  PaginatedResult,
} from '@cocuyo/types';
import { fetchFromBulletin } from './service-utils';
import { seedStoryChains } from '@/lib/seed-data';

export type Locale = 'en' | 'es';

// Session cache for chains (initialized with seed data)
const userChains: StoryChain[] = [...seedStoryChains.values()];

export class ChainServiceImpl implements ChainService {
  async getChain(id: ChainId, _locale: Locale = 'en'): Promise<StoryChain | null> {
    // Check local cache first
    const localChain = userChains.find((c) => c.id === id);
    if (localChain) return localChain;

    // Try fetching from Bulletin Chain
    return fetchFromBulletin<StoryChain>(id);
  }

  getChains(_params: {
    topic?: string;
    location?: string;
    status?: StoryChain['status'];
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<ChainPreview>> {
    // Convert to previews
    const previews: ChainPreview[] = userChains.map((chain) => ({
      id: chain.id,
      title: chain.title,
      topics: [...chain.topics],
      status: chain.status,
      postCount: chain.stats.postCount,
      totalCorroborations: chain.stats.totalCorroborations,
      updatedAt: chain.updatedAt,
    }));

    return Promise.resolve({
      items: previews,
      total: previews.length,
      hasMore: false,
    });
  }

  getFeaturedChains(_locale: Locale = 'en'): Promise<readonly ChainPreview[]> {
    // Convert to previews
    const previews: ChainPreview[] = userChains.map((chain) => ({
      id: chain.id,
      title: chain.title,
      topics: [...chain.topics],
      status: chain.status,
      postCount: chain.stats.postCount,
      totalCorroborations: chain.stats.totalCorroborations,
      updatedAt: chain.updatedAt,
    }));

    return Promise.resolve(previews);
  }
}

// Export a singleton instance
export const chainService = new ChainServiceImpl();

// Legacy alias for backward compatibility
export { ChainServiceImpl as MockChainService };
