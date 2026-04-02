/**
 * Service exports.
 *
 * All data access should go through these services.
 * Components should never import mock data directly.
 *
 * Service selection is controlled by NEXT_PUBLIC_USE_CHAIN environment variable:
 * - false (default): Use mock services with local data
 * - true: Use chain services with Bulletin Chain storage
 */

import type { SignalService, ChainService, BountyService } from '@cocuyo/types';
import { MockSignalService } from './mock-signal-service';
import { MockChainService } from './mock-chain-service';
import { MockBountyService } from './mock-bounty-service';
import { ChainSignalService } from './chain-signal-service';
import { ChainChainService } from './chain-chain-service';

/**
 * Whether to use chain-backed services.
 * Set NEXT_PUBLIC_USE_CHAIN=true to enable blockchain storage.
 */
const USE_CHAIN_SERVICES = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

/**
 * Signal service instance.
 *
 * Provides access to signal data:
 * - getSignal: Fetch a single signal by ID
 * - getChainSignals: Get all signals in a story chain
 * - getRecentSignals: Paginated signal listing
 * - illuminate: Create a new signal
 */
export const signalService: SignalService = USE_CHAIN_SERVICES
  ? new ChainSignalService()
  : new MockSignalService();

/**
 * Chain service instance.
 *
 * Provides access to story chain data:
 * - getChain: Fetch a single chain by ID
 * - getChains: Paginated chain listing with filters
 * - getFeaturedChains: Top chains by corroboration
 */
export const chainService: ChainService = USE_CHAIN_SERVICES
  ? new ChainChainService()
  : new MockChainService();

/**
 * Bounty service instance.
 *
 * Provides access to bounty data:
 * - getBounty: Fetch a single bounty by ID
 * - getOpenBounties: Paginated bounty listing with filters
 * - createBounty: Create a new bounty (requires wallet)
 * - contributeToToBounty: Link a signal to a bounty
 */
export const bountyService: BountyService = new MockBountyService();

// Export classes for type checking and direct instantiation
export { MockSignalService } from './mock-signal-service';
export { MockChainService } from './mock-chain-service';
export { MockBountyService } from './mock-bounty-service';
export { ChainSignalService } from './chain-signal-service';
export { ChainChainService } from './chain-chain-service';
