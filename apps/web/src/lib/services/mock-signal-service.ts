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
  async getSignal(id: SignalId): Promise<Signal | null> {
    const signal = mockSignals.find((s) => s.id === id);
    return signal ?? null;
  }

  async getChainSignals(chainId: ChainId): Promise<readonly Signal[]> {
    return getSignalsByChainId(chainId);
  }

  async getRecentSignals(params: {
    topic?: string;
    location?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<Signal>> {
    let filtered = [...mockSignals];

    // Filter by topic if provided
    if (params.topic != null) {
      filtered = filtered.filter((s) =>
        s.context.topics.some((t) =>
          t.toLowerCase().includes(params.topic!.toLowerCase())
        )
      );
    }

    // Filter by location if provided
    if (params.location != null) {
      filtered = filtered.filter(
        (s) =>
          s.context.locationName
            ?.toLowerCase()
            .includes(params.location!.toLowerCase()) ?? false
      );
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Apply pagination
    const total = filtered.length;
    const start = params.pagination.offset;
    const end = start + params.pagination.limit;
    const items = filtered.slice(start, end);

    return {
      items,
      total,
      hasMore: end < total,
    };
  }

  async illuminate(_signal: NewSignal): Promise<Result<SignalId, string>> {
    // In mock mode, just generate an ID
    // In real implementation, this would submit to the chain
    const id = createSignalId(`sig-${Date.now()}`);
    return ok(id);
  }
}

// Export a singleton instance
export const signalService = new MockSignalService();
