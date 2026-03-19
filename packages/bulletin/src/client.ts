/**
 * Bulletin Chain Client — Content-addressed storage for F-Network.
 *
 * All F-Network data (signals, profiles, collectives, verifications)
 * is stored on Bulletin Chain as immutable, content-addressed records.
 */

import type { ContentHash } from '@cocuyo/types';
import { createContentHash } from '@cocuyo/types';

/**
 * Record types stored on Bulletin Chain.
 */
export type RecordType =
  | 'signal'
  | 'profile'
  | 'collective'
  | 'verification'
  | 'corroboration'
  | 'chain'
  | 'index';

/**
 * A record stored on Bulletin Chain.
 */
export interface BulletinRecord<T = unknown> {
  /** Record type for routing */
  readonly type: RecordType;
  /** The actual data */
  readonly data: T;
  /** Version for schema evolution */
  readonly version: number;
  /** When the record was created */
  readonly timestamp: number;
}

/**
 * Options for reading records.
 */
export interface ReadOptions {
  /** Use cached value if available */
  useCache?: boolean;
  /** Maximum age of cached value in ms */
  maxCacheAge?: number;
}

/**
 * Options for writing records.
 */
export interface WriteOptions {
  /** Pin the record for persistence */
  pin?: boolean;
}

/**
 * Bulletin Chain client interface.
 */
export interface BulletinClient {
  /**
   * Read a record by its content hash (CID).
   */
  read<T>(cid: ContentHash | string, options?: ReadOptions): Promise<BulletinRecord<T> | null>;

  /**
   * Write a record and get its content hash.
   */
  write<T>(record: BulletinRecord<T>, options?: WriteOptions): Promise<ContentHash>;

  /**
   * Check if a record exists.
   */
  exists(cid: ContentHash | string): Promise<boolean>;

  /**
   * Get multiple records by their CIDs.
   */
  readMany<T>(cids: readonly (ContentHash | string)[]): Promise<Map<string, BulletinRecord<T> | null>>;
}

// Bulletin Chain genesis hash (Paseo Bulletin)
const BULLETIN_GENESIS = '0x...'; // TODO: Add actual genesis hash

/**
 * Create a Bulletin Chain client.
 *
 * In Triangle host, this uses the chain provider.
 * In standalone mode, this uses localStorage for development.
 */
export async function createBulletinClient(
  options?: {
    /** Use in-memory storage (for testing) */
    inMemory?: boolean;
  }
): Promise<BulletinClient> {
  // Check if we're in Triangle host
  const isInHost = typeof window !== 'undefined' &&
    window.self !== window.top;

  if (!isInHost || options?.inMemory === true) {
    // Return local storage client for development
    return createLocalBulletinClient(options?.inMemory === true);
  }

  // In production Triangle environment, use real chain client
  return createProductionBulletinClient();
}

/**
 * Generate a content hash for a record.
 * Uses a simple hash for now; production would use proper CID generation.
 */
async function hashRecord<T>(record: BulletinRecord<T>): Promise<ContentHash> {
  const json = JSON.stringify(record);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);

  // Use SubtleCrypto for hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Format as a CID-like string (simplified)
  return createContentHash(`bafk${hashHex.slice(0, 52)}`);
}

/**
 * Local storage client for development.
 */
interface SimpleStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function createLocalBulletinClient(inMemory = false): BulletinClient {
  // In-memory storage for testing
  const memoryStore = new Map<string, string>();

  const getStorage = (): SimpleStorage => {
    if (inMemory || typeof localStorage === 'undefined') {
      return {
        getItem: (key: string): string | null => memoryStore.get(key) ?? null,
        setItem: (key: string, value: string): void => { memoryStore.set(key, value); },
      };
    }
    return localStorage;
  };

  const STORAGE_PREFIX = 'bulletin:';

  return {
    read<T>(cid: ContentHash | string, options?: ReadOptions): Promise<BulletinRecord<T> | null> {
      const storage = getStorage();
      const key = `${STORAGE_PREFIX}${cid}`;
      const stored = storage.getItem(key);

      if (stored === null) return Promise.resolve(null);

      try {
        const parsed = JSON.parse(stored) as {
          record: BulletinRecord<T>;
          cachedAt: number;
        };

        // Check cache age if specified
        const maxAge = options?.maxCacheAge;
        if (maxAge !== undefined && maxAge > 0) {
          const age = Date.now() - parsed.cachedAt;
          if (age > maxAge) {
            return Promise.resolve(null);
          }
        }

        return Promise.resolve(parsed.record);
      } catch {
        return Promise.resolve(null);
      }
    },

    async write<T>(record: BulletinRecord<T>, _options?: WriteOptions): Promise<ContentHash> {
      const storage = getStorage();
      const cid = await hashRecord(record);
      const key = `${STORAGE_PREFIX}${cid}`;

      storage.setItem(key, JSON.stringify({
        record,
        cachedAt: Date.now(),
      }));

      return cid;
    },

    exists(cid: ContentHash | string): Promise<boolean> {
      const storage = getStorage();
      const key = `${STORAGE_PREFIX}${cid}`;
      return Promise.resolve(storage.getItem(key) !== null);
    },

    async readMany<T>(cids: readonly (ContentHash | string)[]): Promise<Map<string, BulletinRecord<T> | null>> {
      const results = new Map<string, BulletinRecord<T> | null>();

      for (const cid of cids) {
        const record = await this.read<T>(cid);
        results.set(cid.toString(), record);
      }

      return results;
    },
  };
}

/**
 * Production Bulletin Chain client.
 */
async function createProductionBulletinClient(): Promise<BulletinClient> {
  // Dynamic import to avoid issues in non-host environments
  const { createPapiProvider } = await import('@novasamatech/product-sdk');

  // Create provider for Bulletin Chain (unused until implementation complete)
  void createPapiProvider(BULLETIN_GENESIS);

  // TODO: Implement actual Bulletin Chain interactions
  // For now, fall back to local storage client
  console.warn('Production Bulletin client not yet implemented, using local storage');
  return createLocalBulletinClient();
}

/**
 * Helper to create a typed record.
 */
export function createRecord<T>(
  type: RecordType,
  data: T,
  version = 1
): BulletinRecord<T> {
  return {
    type,
    data,
    version,
    timestamp: Date.now(),
  };
}
