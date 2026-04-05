/**
 * Mock implementation of the SignalService with real Bulletin storage.
 *
 * This service provides:
 * - Mock data for demo content (reads)
 * - Real Bulletin Chain storage for new signals (writes)
 * - Session cache for immediate feedback
 *
 * New signals are stored on Bulletin Chain and appear alongside demo data.
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
import { getSignals, getSignalsByChainId, type Locale } from './mock-data';
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
} from './mock-service-utils';

// Session cache for user-created signals
const userSignals: Signal[] = [];

// Re-export for backwards compatibility
export { setWallet as setConnectedWallet };

export class MockSignalService implements SignalService {
  async getSignal(id: SignalId, locale: Locale = 'en'): Promise<Signal | null> {
    // Check user signals first
    const userSignal = userSignals.find((s) => s.id === id);
    if (userSignal) return userSignal;

    // Check mock data
    const signals = getSignals(locale);
    const mockSignal = signals.find((s) => s.id === id);
    if (mockSignal) return mockSignal;

    // Try fetching from Bulletin Chain
    return fetchFromBulletin<Signal>(id);
  }

  getChainSignals(chainId: ChainId, locale: Locale = 'en'): Promise<readonly Signal[]> {
    // Combine mock and user signals for this chain
    const mockSignals = getSignalsByChainId(chainId, locale);
    const userChainSignals = userSignals.filter((s) => s.chainLinks.includes(chainId));
    return Promise.resolve([...userChainSignals, ...mockSignals]);
  }

  getRecentSignals(params: {
    topic?: string;
    location?: string;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<Signal>> {
    // Combine user signals with mock signals
    const mockData = getSignals(params.locale ?? 'en');
    let filtered = [...userSignals, ...mockData];

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
export const signalService = new MockSignalService();
