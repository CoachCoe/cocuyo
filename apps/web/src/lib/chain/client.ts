/**
 * Chain Client Wrapper
 *
 * Provides typed access to Polkadot chains via @polkadot-apps/chain-client.
 * Lazily initializes and caches the chain API.
 */

import { getChainAPI, type Environment, type ChainAPI } from '@polkadot-apps/chain-client';
import { BulletinClient } from '@polkadot-apps/bulletin';

/** Cache entry with environment tracking */
interface CacheEntry<T> {
  value: T;
  environment: Environment;
}

let apiCache: CacheEntry<ChainAPI<Environment>> | null = null;
let bulletinCache: CacheEntry<BulletinClient> | null = null;

/**
 * Get the current environment from configuration.
 * Defaults to 'paseo' for testnet development.
 */
function getEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_CHAIN_ENVIRONMENT;
  if (env === 'polkadot' || env === 'kusama' || env === 'paseo') {
    return env;
  }
  return 'paseo';
}

/**
 * Get the typed chain API for the configured environment.
 *
 * Provides access to:
 * - assetHub: Asset Hub chain API (tokens, NFTs)
 * - bulletin: Bulletin Chain API (content storage)
 * - individuality: Individuality chain API (DIMs, personhood)
 * - contracts: Ink! contract SDK
 *
 * @example
 * ```ts
 * const api = await getFireflyChainAPI();
 * const byteFee = await api.bulletin.query.TransactionStorage.ByteFee.getValue();
 * ```
 */
export async function getFireflyChainAPI(): Promise<ChainAPI<Environment>> {
  const env = getEnvironment();

  if (apiCache?.environment === env) {
    return apiCache.value;
  }

  const api = await getChainAPI(env);
  apiCache = { value: api, environment: env };

  return api;
}

/**
 * Get the BulletinClient for the configured environment.
 *
 * The BulletinClient provides high-level operations for:
 * - upload: Store data on chain
 * - fetchBytes/fetchJson: Retrieve data by CID
 * - cidExists: Check if content exists
 *
 * Auto-resolves signer/query paths based on environment:
 * - In host container: uses host preimage API
 * - Standalone: falls back to dev signer / gateway fetch
 *
 * @example
 * ```ts
 * const bulletin = await getBulletinClient();
 * const result = await bulletin.upload(data);
 * const content = await bulletin.fetchJson(result.cid);
 * ```
 */
export async function getBulletinClient(): Promise<BulletinClient> {
  const env = getEnvironment();

  if (bulletinCache?.environment === env) {
    return bulletinCache.value;
  }

  const client = await BulletinClient.create(env);
  bulletinCache = { value: client, environment: env };

  return client;
}

/**
 * Clear cached clients.
 * Useful for testing or environment switching.
 */
export function clearChainCache(): void {
  apiCache = null;
  bulletinCache = null;
}

// Re-export environment type for consumers
export type { Environment };
