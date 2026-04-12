/**
 * Hooks Exports
 */

export { useSigner, useSignerManager, type UseSignerResult } from '../lib/context/SignerContext';
export { useBulletin, type UseBulletinResult } from './useBulletin';
export { useBulletinStatus, type UseBulletinStatusResult, type BulletinConnectionStatus } from './useBulletinStatus';
export { useBulletinWithSigner, type UseBulletinWithSignerResult } from './useBulletinWithSigner';
export { useIlluminate } from './useIlluminate';
export { useIdentity, type IdentityState, type IdentityStatus } from './useIdentity';

// Contract hooks
export { useBountyEscrow, type UseBountyEscrowOptions } from './useBountyEscrow';
export { useFireflyReputation, type UseFireflyReputationOptions } from './useFireflyReputation';

// UI utility hooks
export { useClickOutside } from './useClickOutside';
export { useEscapeKey } from './useEscapeKey';
