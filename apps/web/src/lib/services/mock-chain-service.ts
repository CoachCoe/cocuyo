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
import { getChains, getChainPreviews, type Locale } from './mock-data';

export class MockChainService implements ChainService {
  getChain(id: ChainId, locale: Locale = 'en'): Promise<StoryChain | null> {
    const chains = getChains(locale);
    const chain = chains.find((c) => c.id === id);
    return Promise.resolve(chain ?? null);
  }

  getChains(params: {
    topic?: string;
    location?: string;
    status?: StoryChain['status'];
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<ChainPreview>> {
    let previews = getChainPreviews(params.locale ?? 'en');

    // Filter by topic
    const topicFilter = params.topic;
    if (topicFilter != null) {
      const topicLower = topicFilter.toLowerCase();
      previews = previews.filter((p) =>
        p.topics.some((t) => t.toLowerCase().includes(topicLower))
      );
    }

    // Filter by location
    const locationFilter = params.location;
    if (locationFilter != null) {
      const locationLower = locationFilter.toLowerCase();
      previews = previews.filter(
        (p) => p.location?.toLowerCase().includes(locationLower) ?? false
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

    return Promise.resolve({
      items,
      total,
      hasMore: end < total,
    });
  }

  getFeaturedChains(locale: Locale = 'en'): Promise<readonly ChainPreview[]> {
    const previews = getChainPreviews(locale);
    const sorted = previews
      .sort((a, b) => b.totalCorroborations - a.totalCorroborations)
      .slice(0, 5);
    return Promise.resolve(sorted);
  }
}

// Export a singleton instance
export const chainService = new MockChainService();
