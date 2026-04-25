/**
 * Chain Provider Module
 *
 * Provides access to Polkadot chains via the Triangle host or direct connection.
 */

import { createPapiProvider } from '@novasamatech/product-sdk';

/**
 * Known chain genesis hashes.
 */
export const CHAINS = {
  polkadot: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3' as const,
  kusama: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe' as const,
  westend: '0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e' as const,
  polkadotAssetHub: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f' as const,
  westendAssetHub: '0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9' as const,
} as const;

export type ChainId = keyof typeof CHAINS;
export type GenesisHash = (typeof CHAINS)[ChainId];

/**
 * Create a PAPI client for a specific chain.
 *
 * When running in Triangle host, uses the host's WebSocket provider.
 * When running standalone, returns null (requires direct connection setup).
 *
 * @param genesisHash - The genesis hash of the chain to connect to
 * @returns A PAPI provider or null if not available
 */
export function createChainClient(
  genesisHash: GenesisHash
): ReturnType<typeof createPapiProvider> | null {
  try {
    return createPapiProvider(genesisHash);
  } catch {
    // Host API not available (not in Triangle)
    return null;
  }
}

/**
 * Create a client for a known chain by ID.
 */
export function createKnownChainClient(
  chainId: ChainId
): ReturnType<typeof createPapiProvider> | null {
  return createChainClient(CHAINS[chainId]);
}
