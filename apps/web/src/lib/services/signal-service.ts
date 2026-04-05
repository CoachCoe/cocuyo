/**
 * Signal Service implementation with real Bulletin storage.
 *
 * This service provides:
 * - Bulletin Chain storage for signals (writes)
 * - Session cache for immediate feedback
 * - Empty results for queries until indexing is implemented
 *
 * Signals are stored on Bulletin Chain and can be fetched by CID.
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
import { ok, err, createSignalId, emptyCorroborationSummary } from '@cocuyo/types';
import {
  setConnectedWallet as setWallet,
  getConnectedWallet,
  getConnectedCredential,
  generatePseudonym,
  paginate,
  filterByTopic,
  filterByString,
  uploadToBulletin,
  fetchFromBulletin,
} from './service-utils';

export type Locale = 'en' | 'es';

// Session cache for user-created signals
const userSignals: Signal[] = [];

// Re-export for backwards compatibility
export { setWallet as setConnectedWallet };

export class SignalServiceImpl implements SignalService {
  async getSignal(id: SignalId, _locale: Locale = 'en'): Promise<Signal | null> {
    // Check user signals first
    const userSignal = userSignals.find((s) => s.id === id);
    if (userSignal) return userSignal;

    // Try fetching from Bulletin Chain
    return fetchFromBulletin<Signal>(id);
  }

  getChainSignals(chainId: ChainId, _locale: Locale = 'en'): Promise<readonly Signal[]> {
    // Return only user-created signals for this chain
    // Full chain queries require indexing
    const userChainSignals = userSignals.filter((s) => s.chainLinks.includes(chainId));
    return Promise.resolve(userChainSignals);
  }

  getRecentSignals(params: {
    topic?: string;
    location?: string;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<Signal>> {
    // Return only user-created signals
    // Full queries require indexing
    let filtered = [...userSignals];

    // Filter by topic and location using shared utilities
    filtered = filterByTopic(filtered, (s) => s.context.topics, params.topic);
    filtered = filterByString(filtered, (s) => s.context.locationName, params.location);

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Apply pagination using shared utility
    return Promise.resolve(paginate(filtered, params.pagination));
  }

  async illuminate(signal: NewSignal): Promise<Result<SignalId, string>> {
    const connectedAddress = getConnectedWallet();
    const dimCredential = getConnectedCredential();

    if (connectedAddress === null || dimCredential === null) {
      return err('Wallet not connected. Please connect your wallet to illuminate.');
    }

    const now = Date.now();

    // Build full signal with author info
    const fullSignal: Signal = {
      id: '' as SignalId, // Will be replaced with CID
      author: {
        id: connectedAddress,
        credentialHash: dimCredential,
        pseudonym: generatePseudonym(connectedAddress),
        disclosureLevel: 'anonymous',
      },
      content: {
        text: signal.content.text,
        ...(signal.content.links && { links: signal.content.links }),
        ...(signal.content.media && { media: signal.content.media }),
      },
      context: {
        topics: signal.context.topics,
        ...(signal.context.locationName !== undefined && { locationName: signal.context.locationName }),
        ...(signal.context.location !== undefined && { location: signal.context.location }),
        ...(signal.context.timeframe !== undefined && { timeframe: signal.context.timeframe }),
      },
      dimSignature: dimCredential,
      corroborations: emptyCorroborationSummary(),
      verification: {
        status: 'unverified',
      },
      chainLinks: signal.chainLinks ?? [],
      createdAt: now,
    };

    // Upload to Bulletin Chain (with local fallback)
    const uploadResult = await uploadToBulletin(fullSignal);
    if (!uploadResult.ok) {
      return err(uploadResult.error);
    }

    // Update with CID
    const signalWithId: Signal = {
      ...fullSignal,
      id: createSignalId(uploadResult.value.cid),
    };

    // Add to session cache
    userSignals.unshift(signalWithId);

    return ok(signalWithId.id);
  }
}

// Export a singleton instance
export const signalService = new SignalServiceImpl();

// Legacy alias for backward compatibility
export { SignalServiceImpl as MockSignalService };
