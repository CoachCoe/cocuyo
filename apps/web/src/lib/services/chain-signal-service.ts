/**
 * Chain-backed implementation of the SignalService.
 *
 * Stores and retrieves signals from the Bulletin Chain using
 * @polkadot-apps/bulletin for data storage.
 *
 * NOTE: This is a partial implementation. Full functionality requires:
 * 1. Off-chain indexing for efficient queries
 * 2. Real DIM credential signing infrastructure
 *
 * Use MockSignalService for demos until signing infrastructure is ready.
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
import { err } from '@cocuyo/types';
import { getBulletinClient } from '../chain/client';

/**
 * Chain-backed signal service.
 *
 * Provides real blockchain storage for signals via Bulletin Chain.
 * Query methods return empty results until indexing is implemented.
 */
export class ChainSignalService implements SignalService {
  /**
   * Get a signal by its CID.
   *
   * Fetches the signal data from Bulletin Chain and parses it.
   * Returns null if the signal doesn't exist or parsing fails.
   */
  async getSignal(id: SignalId, _locale?: string): Promise<Signal | null> {
    try {
      const bulletin = await getBulletinClient();
      const stored = await bulletin.fetchJson<Signal>(id);
      return stored;
    } catch {
      return null;
    }
  }

  /**
   * Get all signals in a chain.
   *
   * TODO: Implement chain index queries.
   * Returns empty array until indexing is available.
   */
  getChainSignals(_chainId: ChainId, _locale?: string): Promise<readonly Signal[]> {
    return Promise.resolve([]);
  }

  /**
   * Get recent signals.
   *
   * TODO: Implement indexing for efficient queries.
   * Returns empty results until indexing is available.
   */
  getRecentSignals(_params: {
    topic?: string;
    location?: string;
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<Signal>> {
    return Promise.resolve({
      items: [],
      total: 0,
      hasMore: false,
    });
  }

  /**
   * Illuminate a new signal.
   *
   * GUARD: This method requires real DIM signing infrastructure.
   * Currently returns an error indicating signing is not yet implemented.
   * Use MockSignalService for demos.
   *
   * When signing is implemented, this will:
   * 1. Sign the signal content with the user's DIM credential
   * 2. Compute the CID from the signed content
   * 3. Upload to Bulletin Chain
   * 4. Return the CID as SignalId
   */
  illuminate(_signal: NewSignal): Promise<Result<SignalId, string>> {
    // GUARD: Real signing infrastructure required
    //
    // To implement this properly, we need:
    // 1. DIM credential from the connected wallet
    // 2. Ring VRF proof generation for anonymous signing
    // 3. CID computation before upload (not after)
    //
    // For now, return a clear error directing to MockSignalService for demos.
    return Promise.resolve(
      err(
        'On-chain illumination requires DIM signing infrastructure. ' +
        'Use MockSignalService (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
      )
    );
  }
}
