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

export type Locale = 'en' | 'es';

export class ChainServiceImpl implements ChainService {
  async getChain(id: ChainId, _locale: Locale = 'en'): Promise<StoryChain | null> {
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
    // Returns empty until indexing is implemented
    return Promise.resolve({
      items: [],
      total: 0,
      hasMore: false,
    });
  }

  getFeaturedChains(_locale: Locale = 'en'): Promise<readonly ChainPreview[]> {
    // Returns empty until indexing is implemented
    return Promise.resolve([]);
  }
}

// Export a singleton instance
export const chainService = new ChainServiceImpl();

// Legacy alias for backward compatibility
export { ChainServiceImpl as MockChainService };
