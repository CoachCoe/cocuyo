/**
 * Mock implementation of the SignalService.
 *
 * This service abstracts data access so that components don't
 * import mock data directly. When we integrate with the chain,
 * we'll create a ChainSignalService that implements the same interface.
 */

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
import { ok, createSignalId } from '@cocuyo/types';
import { mockSignals, getSignalsByChainId } from './mock-data';

export class MockSignalService implements SignalService {
  getSignal(id: SignalId): Promise<Signal | null> {
    const signal = mockSignals.find((s) => s.id === id);
    return Promise.resolve(signal ?? null);
  }

  getChainSignals(chainId: ChainId): Promise<readonly Signal[]> {
    return Promise.resolve(getSignalsByChainId(chainId));
  }

  getRecentSignals(params: {
    topic?: string;
    location?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<Signal>> {
    let filtered = [...mockSignals];

    // Filter by topic if provided
    const topicFilter = params.topic;
    if (topicFilter != null) {
      const topicLower = topicFilter.toLowerCase();
      filtered = filtered.filter((s) =>
        s.context.topics.some((t) => t.toLowerCase().includes(topicLower))
      );
    }

    // Filter by location if provided
    const locationFilter = params.location;
    if (locationFilter != null) {
      const locationLower = locationFilter.toLowerCase();
      filtered = filtered.filter(
        (s) => s.context.locationName?.toLowerCase().includes(locationLower) ?? false
      );
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Apply pagination
    const total = filtered.length;
    const start = params.pagination.offset;
    const end = start + params.pagination.limit;
    const items = filtered.slice(start, end);

    return Promise.resolve({
      items,
      total,
      hasMore: end < total,
    });
  }

  illuminate(_signal: NewSignal): Promise<Result<SignalId, string>> {
    // In mock mode, generate an ID. Real implementation submits to chain.
    const id = createSignalId(`sig-${Date.now()}`);
    return Promise.resolve(ok(id));
  }
}

// Export a singleton instance
export const signalService = new MockSignalService();
