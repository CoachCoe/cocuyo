/**
 * Host Detection Module Exports
 */

export {
  initHostDetection,
  isHosted,
  isInContainer,
  getAccountsProvider,
  type AccountConnectionStatus,
} from './detect';

export { CHAINS, type ChainId, createChainClient, createKnownChainClient } from './chain';

export { storage, read, write, clear } from './storage';

export { requestExternalPermissions } from './permissions';
