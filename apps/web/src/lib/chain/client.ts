/**
 * Chain Client Wrapper
 *
 * Provides typed access to Polkadot chains via @polkadot-apps/chain-client.
 * Lazily initializes and caches the chain API.
 */

import { getChainAPI, type Environment, type PresetChains, type ChainClient } from '@polkadot-apps/chain-client';
import { BulletinClient } from '@polkadot-apps/bulletin';

/** Cache entry with environment tracking - stores promise to prevent race conditions */
interface CacheEntry<T> {
  promise: Promise<T>;
  environment: Environment;
}

let apiCache: CacheEntry<ChainClient<PresetChains<Environment>>> | null = null;
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
 *
 * @example
 * ```ts
 * const api = await getFireflyChainAPI();
 * const byteFee = await api.bulletin.query.TransactionStorage.ByteFee.getValue();
 * ```
 */
export async function getFireflyChainAPI(): Promise<ChainClient<PresetChains<Environment>>> {
  const env = getEnvironment();

  if (apiCache?.environment === env) {
    return apiCache.promise;
  }

  const promise = getChainAPI(env);
  apiCache = { promise, environment: env };

  return promise;
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
    return bulletinCache.promise;
  }

  const promise = BulletinClient.create(env);
  bulletinCache = { promise, environment: env };

  return promise;
}

/**
 * Clear cached clients and destroy connections.
 * Useful for testing or environment switching.
 */
export async function clearChainCache(): Promise<void> {
  if (apiCache) {
    try {
      const api = await apiCache.promise;
      api.destroy();
    } catch {
      // Ignore errors during cleanup
    }
  }
  apiCache = null;
  bulletinCache = null;
}

// Re-export environment type for consumers
export type { Environment };
