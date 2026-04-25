/**
 * Chain-backed implementation of the ChainService.
 *
 * Stores and retrieves story chains from the Bulletin Chain.
 * Currently returns empty results for queries - full implementation
 * requires chain indexing.
 */

import type {
  ChainService,
  StoryChain,
  ChainId,
  ChainPreview,
  PaginationParams,
  PaginatedResult,
} from '@cocuyo/types';
import { safeParseStoryChain } from '@cocuyo/types';
import { getBulletinClient } from '../chain/client';

/**
 * Chain-backed chain service.
 *
 * Provides real blockchain storage for story chains via Bulletin Chain.
 * Query methods return empty results until indexing is implemented.
 * Use MockChainService for development.
 */
export class ChainChainService implements ChainService {
  /**
   * Get a chain by its CID.
   *
   * Fetches the chain data from Bulletin Chain, validates, and parses it.
   */
  async getChain(id: ChainId, _locale?: string): Promise<StoryChain | null> {
    try {
      const bulletin = await getBulletinClient();
      const data = await bulletin.fetchJson<unknown>(id);
      return safeParseStoryChain(data);
    } catch {
      return null;
    }
  }

  /**
   * Get chain previews.
   *
   * TODO: Implement chain index queries.
   */
  getChains(_params: {
    topic?: string;
    location?: string;
    status?: StoryChain['status'];
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<ChainPreview>> {
    return Promise.resolve({
      items: [],
      total: 0,
      hasMore: false,
    });
  }

  /**
   * Get featured chains.
   *
   * TODO: Implement with chain indexing.
   */
  getFeaturedChains(_locale?: string): Promise<readonly ChainPreview[]> {
    return Promise.resolve([]);
  }
}
