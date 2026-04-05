/**
 * Address Utilities
 *
 * Re-exports from @polkadot-apps/address for Firefly Network use.
 */

export {
  truncateAddress,
  addressesEqual,
  isValidSs58,
  ss58Decode,
  ss58Encode,
  normalizeSs58,
  toGenericSs58,
  toPolkadotSs58,
  accountIdFromBytes,
  accountIdBytes,
  deriveH160,
  ss58ToH160,
  h160ToSs58,
  toH160,
  isValidH160,
} from '@polkadot-apps/address';

export type { SS58String, HexString } from '@polkadot-apps/address';
