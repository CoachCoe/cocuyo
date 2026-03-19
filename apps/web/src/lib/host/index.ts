/**
 * Host Detection Module Exports
 */

export {
  initHostDetection,
  isHosted,
  getAccountsProvider,
  getMetaProvider,
  type AccountConnectionStatus,
} from './detect';

export {
  CHAINS,
  type ChainId,
  createChainClient,
  createKnownChainClient,
} from './chain';

export { storage, read, write, clear } from './storage';
