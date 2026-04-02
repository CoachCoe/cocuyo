/**
 * Shared utilities for mock payment services.
 * @internal
 */

import type { TransactionHash } from '@cocuyo/types';
import { createTransactionHash } from '@cocuyo/types';

/**
 * Create a delay function for simulating network latency.
 */
export function createDelay(ms: number): () => Promise<void> {
  return () => new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a transaction hash generator.
 */
export function createTxHashGenerator(startCounter = 1): () => TransactionHash {
  let counter = startCounter;
  return () => {
    const hash = `0x${(counter++).toString(16).padStart(64, '0')}`;
    return createTransactionHash(hash);
  };
}
