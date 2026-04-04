/**
 * Hooks Exports
 */

export { useSigner, useSignerManager, type UseSignerResult } from '../lib/context/SignerContext';
export { useBulletin, type UseBulletinResult } from './useBulletin';
export { useIlluminate } from './useIlluminate';
export { useIdentity, type IdentityState, type IdentityStatus } from './useIdentity';

// Contract hooks
export { useBountyEscrow, type UseBountyEscrowOptions } from './useBountyEscrow';
export { useFireflyReputation, type UseFireflyReputationOptions } from './useFireflyReputation';

// UI utility hooks
export { useClickOutside } from './useClickOutside';
export { useEscapeKey } from './useEscapeKey';
