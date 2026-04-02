/**
 * Mock implementation of the SignalService.
 *
 * This service abstracts data access so that components don't
 * import mock data directly. When we integrate with the chain,
 * we'll create a ChainSignalService that implements the same interface.
 *
 * Uses Bulletin CID calculation for content-addressed signal IDs.
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
import { calculateCIDFromJSON, createRecord } from '@cocuyo/bulletin';
import { getSignals, getSignalsByChainId } from './mock-data';

export class MockSignalService implements SignalService {
  getSignal(id: SignalId): Promise<Signal | null> {
    // Use English as default locale for mock service
    const signals = getSignals('en');
    const signal = signals.find((s) => s.id === id);
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
    // Use English as default locale for mock service
    let filtered = [...getSignals('en')];

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

  illuminate(signal: NewSignal): Promise<Result<SignalId, string>> {
    // Calculate content-addressed ID using Bulletin CID
    const record = createRecord('signal', {
      ...signal,
      createdAt: Date.now(),
    });
    const cid = calculateCIDFromJSON(record);
    const id = createSignalId(cid);
    return Promise.resolve(ok(id));
  }
}

// Export a singleton instance
export const signalService = new MockSignalService();
