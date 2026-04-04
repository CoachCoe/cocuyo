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
import { ok, err, createSignalId, createDIMCredential, emptyCorroborationSummary } from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import { getSignals, getSignalsByChainId, type Locale } from './mock-data';
import { getBulletinClient } from '../chain/client';

// Session cache for user-created signals
const userSignals: Signal[] = [];

// Connected wallet address for author generation
let connectedAddress: string | null = null;

/**
 * Set the connected wallet address.
 * Call this when wallet connects/disconnects.
 */
export function setConnectedWallet(address: string | null): void {
  connectedAddress = address;
}

/**
 * Generate a consistent pseudonym from wallet address.
 */
function generatePseudonym(address: string): string {
  const adjectives = [
    'Swift', 'Bright', 'Silent', 'Golden', 'Crystal',
    'Shadow', 'Thunder', 'Cosmic', 'Ember', 'Frost',
    'Mystic', 'Lunar', 'Solar', 'Wild', 'Ancient',
  ];
  const nouns = [
    'Firefly', 'Phoenix', 'Condor', 'Jaguar', 'Quetzal',
    'Orchid', 'Ceiba', 'Cacao', 'Ocelot', 'Toucan',
    'Macaw', 'Iguana', 'Tapir', 'Manatee', 'Harpy',
  ];

  const addrBytes = address.slice(2, 10);
  const adjIdx = parseInt(addrBytes.slice(0, 4), 16) % adjectives.length;
  const nounIdx = parseInt(addrBytes.slice(4, 8), 16) % nouns.length;

  return `${adjectives[adjIdx]} ${nouns[nounIdx]}`;
}

export class MockSignalService implements SignalService {
  async getSignal(id: SignalId, locale: Locale = 'en'): Promise<Signal | null> {
    // Check user signals first
    const userSignal = userSignals.find((s) => s.id === id);
    if (userSignal) {
      return userSignal;
    }

    // Check mock data
    const signals = getSignals(locale);
    const mockSignal = signals.find((s) => s.id === id);
    if (mockSignal) {
      return mockSignal;
    }

    // Try fetching from Bulletin Chain
    try {
      const bulletin = await getBulletinClient();
      const stored = await bulletin.fetchJson<Signal>(id);
      return stored;
    } catch {
      return null;
    }
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

  async illuminate(signal: NewSignal): Promise<Result<SignalId, string>> {
    if (connectedAddress === null) {
      return err('Wallet not connected. Please connect your wallet to illuminate.');
    }

    const now = Date.now();

    // Build full signal with author info
    const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
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

    try {
      // Try to store on Bulletin Chain
      const bulletin = await getBulletinClient();
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(fullSignal));
      const result = await bulletin.upload(data);

      // Update with real CID
      const signalWithId: Signal = {
        ...fullSignal,
        id: createSignalId(result.cid),
      };

      // Add to session cache
      userSignals.unshift(signalWithId);

      return ok(signalWithId.id);
    } catch (uploadError) {
      // Fallback to local-only if Bulletin unavailable
      console.warn('Bulletin upload failed, using local CID:', uploadError);

      const cid = calculateCIDFromJSON(fullSignal);
      const signalWithId: Signal = {
        ...fullSignal,
        id: createSignalId(cid),
      };

      // Add to session cache
      userSignals.unshift(signalWithId);

      return ok(signalWithId.id);
    }
  }
}

// Export a singleton instance
export const signalService = new MockSignalService();
