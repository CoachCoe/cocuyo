/**
 * Service Factory
 *
 * Returns appropriate service implementations based on the runtime environment.
 * Currently returns mock services in all modes.
 * Ready for future chain service implementations when Triangle integration is complete.
 */

import { MockSignalService } from './mock-signal-service';
import { MockChainService } from './mock-chain-service';
// import { isHosted } from '../host/detect'; // Available for future chain mode

export type ServiceMode = 'mock' | 'chain';

/**
 * Get the current service mode.
 * Currently always returns 'mock' - chain mode will be enabled when
 * on-chain storage integration is complete.
 */
export function getServiceMode(): ServiceMode {
  // Future: Check if hosted and chain connection is available
  // For now, always use mock services
  // When ready: return isHosted() ? 'chain' : 'mock';
  return 'mock';
}

/**
 * Create a signal service instance.
 */
export function createSignalService(): MockSignalService {
  // Future: Return chain-backed service when available
  return new MockSignalService();
}

/**
 * Create a chain service instance.
 */
export function createChainService(): MockChainService {
  // Future: Return chain-backed service when available
  return new MockChainService();
}

/**
 * Service factory for centralized service creation.
 */
export const serviceFactory = {
  getMode: getServiceMode,
  createSignalService,
  createChainService,
} as const;
