/**
 * Shared utilities for mock services.
 *
 * Provides common functionality to reduce code duplication:
 * - Wallet state management
 * - Pseudonym generation
 * - Pagination helpers
 * - Bulletin Chain upload with fallback
 */

import type { PaginatedResult, Result } from '@cocuyo/types';
import { ok, err, createDIMCredential, type DIMCredential } from '@cocuyo/types';
import { getBulletinClient } from '../chain/client';
import { createLogger } from '../logging';
import { requestTransactionSubmit } from '../host/permissions';
import { isHosted } from '../host/detect';

const logger = createLogger('MockServices');

// ============================================================
// Wallet State Management
// ============================================================

let connectedAddress: string | null = null;

/**
 * Set the connected wallet address.
 * Call this when wallet connects/disconnects.
 */
export function setConnectedWallet(address: string | null): void {
  connectedAddress = address;
}

/**
 * Get the currently connected wallet address.
 */
export function getConnectedWallet(): string | null {
  return connectedAddress;
}

/**
 * Check if a wallet is connected.
 */
export function isWalletConnected(): boolean {
  return connectedAddress !== null;
}

/**
 * Get a DIM credential for the connected wallet.
 */
export function getConnectedCredential(): DIMCredential | null {
  if (connectedAddress === null) return null;
  return createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
}

// ============================================================
// Pseudonym Generation
// ============================================================

const ADJECTIVES = [
  'Swift',
  'Bright',
  'Silent',
  'Golden',
  'Crystal',
  'Shadow',
  'Thunder',
  'Cosmic',
  'Ember',
  'Frost',
  'Mystic',
  'Lunar',
  'Solar',
  'Wild',
  'Ancient',
];

const NOUNS = [
  'Firefly',
  'Phoenix',
  'Condor',
  'Jaguar',
  'Quetzal',
  'Orchid',
  'Ceiba',
  'Cacao',
  'Ocelot',
  'Toucan',
  'Macaw',
  'Iguana',
  'Tapir',
  'Manatee',
  'Harpy',
];

/**
 * Generate a consistent pseudonym from wallet address.
 * Uses first 8 hex characters to deterministically pick adjective + noun.
 */
export function generatePseudonym(address: string): string {
  const addrBytes = address.slice(2, 10);
  const adjIdx = parseInt(addrBytes.slice(0, 4), 16) % ADJECTIVES.length;
  const nounIdx = parseInt(addrBytes.slice(4, 8), 16) % NOUNS.length;

  return `${ADJECTIVES[adjIdx]} ${NOUNS[nounIdx]}`;
}

// ============================================================
// Pagination Helpers
// ============================================================

export interface PaginationParams {
  offset: number;
  limit: number;
}

/**
 * Apply pagination to an array of items.
 * Returns a PaginatedResult with items, total count, and hasMore flag.
 */
export function paginate<T>(items: T[], pagination: PaginationParams): PaginatedResult<T> {
  const total = items.length;
  const start = pagination.offset;
  const end = start + pagination.limit;
  const paginatedItems = items.slice(start, end);

  return {
    items: paginatedItems,
    total,
    hasMore: end < total,
  };
}

/**
 * Filter items by a string field matching a search term (case-insensitive).
 */
export function filterByString<T>(
  items: T[],
  getValue: (item: T) => string | undefined,
  searchTerm: string | undefined
): T[] {
  if (searchTerm === undefined) return items;
  const termLower = searchTerm.toLowerCase();
  return items.filter((item) => {
    const value = getValue(item);
    return value?.toLowerCase().includes(termLower) ?? false;
  });
}

/**
 * Filter items by topics array matching a search term (case-insensitive).
 */
export function filterByTopic<T>(
  items: T[],
  getTopics: (item: T) => readonly string[],
  topic: string | undefined
): T[] {
  if (topic === undefined) return items;
  const topicLower = topic.toLowerCase();
  return items.filter((item) => getTopics(item).some((t) => t.toLowerCase().includes(topicLower)));
}

// ============================================================
// Bulletin Chain Upload
// ============================================================

/** Track if we've requested transaction permission (avoids repeat prompts) */
let transactionPermissionRequested = false;

export interface UploadResult {
  cid: string;
  usedFallback: boolean;
}

export interface PhotoUploadResult {
  cid: string;
  mimeType: string;
  size: number;
}

/**
 * Upload data to Bulletin Chain.
 * Returns the CID on success, or an error message on failure.
 * No silent fallback - callers should handle errors explicitly.
 */
export async function uploadToBulletin(data: unknown): Promise<Result<UploadResult, string>> {
  try {
    // Request TransactionSubmit permission on first upload (Host mode only)
    if (!transactionPermissionRequested && isHosted()) {
      transactionPermissionRequested = true;
      await requestTransactionSubmit();
    }

    const bulletin = await getBulletinClient();
    const encoder = new TextEncoder();
    const jsonData = encoder.encode(JSON.stringify(data));
    const result = await bulletin.upload(jsonData);

    logger.debug('Uploaded to Bulletin Chain', 'uploadToBulletin', { cid: result.cid });
    return ok({ cid: result.cid, usedFallback: false });
  } catch (uploadError) {
    const message = uploadError instanceof Error ? uploadError.message : 'Bulletin upload failed';
    logger.swallowed('Bulletin upload failed', 'uploadToBulletin', uploadError);
    return err(message);
  }
}

/**
 * Fetch data from Bulletin Chain by CID.
 * Returns null if fetch fails.
 */
export async function fetchFromBulletin<T>(cid: string): Promise<T | null> {
  try {
    const bulletin = await getBulletinClient();
    return await bulletin.fetchJson<T>(cid);
  } catch (fetchError) {
    logger.swallowed('Bulletin fetch failed', 'fetchFromBulletin', fetchError, { cid });
    return null;
  }
}

/**
 * Upload a photo file to Bulletin Chain.
 * Returns the CID and metadata on success.
 */
export async function uploadPhotoToBulletin(
  file: File
): Promise<Result<PhotoUploadResult, string>> {
  try {
    const bulletin = await getBulletinClient();
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const result = await bulletin.upload(bytes);

    logger.debug('Uploaded photo to Bulletin Chain', 'uploadPhotoToBulletin', {
      cid: result.cid,
      mimeType: file.type,
      size: file.size,
    });

    return ok({
      cid: result.cid,
      mimeType: file.type,
      size: file.size,
    });
  } catch (uploadError) {
    const message = uploadError instanceof Error ? uploadError.message : 'Photo upload failed';
    logger.swallowed('Photo upload failed', 'uploadPhotoToBulletin', uploadError);
    return err(message);
  }
}

/**
 * Fetch photo bytes from Bulletin Chain by CID.
 * Returns null if fetch fails.
 */
export async function fetchPhotoFromBulletin(cid: string): Promise<Uint8Array | null> {
  try {
    const bulletin = await getBulletinClient();
    return await bulletin.fetchBytes(cid);
  } catch (fetchError) {
    logger.swallowed('Photo fetch failed', 'fetchPhotoFromBulletin', fetchError, { cid });
    return null;
  }
}
