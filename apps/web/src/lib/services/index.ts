/**
 * Service exports.
 *
 * All data access should go through these services.
 * Components should never import mock data directly.
 */

import { MockSignalService } from './mock-signal-service';
import { MockChainService } from './mock-chain-service';

// Export service instances
// Future: Replace with chain-backed services when Triangle integration is complete
export const signalService = new MockSignalService();
export const chainService = new MockChainService();

// Export classes for type checking
export { MockSignalService } from './mock-signal-service';
export { MockChainService } from './mock-chain-service';
