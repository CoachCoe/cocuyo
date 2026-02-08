/**
 * Mock implementation of the ChainService.
 */

import type {
  ChainService,
  StoryChain,
  ChainId,
  ChainPreview,
  PaginationParams,
  PaginatedResult,
} from '@cocuyo/types';
import { mockChains, getChainPreviews } from './mock-data';

export class MockChainService implements ChainService {
  async getChain(id: ChainId): Promise<StoryChain | null> {
    const chain = mockChains.find((c) => c.id === id);
    return chain ?? null;
  }

  async getChains(params: {
    topic?: string;
    location?: string;
    status?: StoryChain['status'];
    pagination: PaginationParams;
  }): Promise<PaginatedResult<ChainPreview>> {
    let previews = getChainPreviews();

    // Filter by topic
    if (params.topic != null) {
      previews = previews.filter((p) =>
        p.topics.some((t) =>
          t.toLowerCase().includes(params.topic!.toLowerCase())
        )
      );
    }

    // Filter by location
    if (params.location != null) {
      previews = previews.filter(
        (p) =>
          p.location?.toLowerCase().includes(params.location!.toLowerCase()) ??
          false
      );
    }

    // Filter by status
    if (params.status != null) {
      previews = previews.filter((p) => p.status === params.status);
    }

    // Sort by update time (newest first)
    previews.sort((a, b) => b.updatedAt - a.updatedAt);

    // Apply pagination
    const total = previews.length;
    const start = params.pagination.offset;
    const end = start + params.pagination.limit;
    const items = previews.slice(start, end);

    return {
      items,
      total,
      hasMore: end < total,
    };
  }

  async getFeaturedChains(): Promise<readonly ChainPreview[]> {
    // Return top chains by corroboration weight
    const previews = getChainPreviews();
    return previews
      .sort((a, b) => b.totalCorroborations - a.totalCorroborations)
      .slice(0, 5);
  }
}

// Export a singleton instance
export const chainService = new MockChainService();
