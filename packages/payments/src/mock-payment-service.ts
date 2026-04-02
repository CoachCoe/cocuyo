/**
 * Mock payment service for development.
 *
 * Simulates pUSD transfers with in-memory state.
 */

import type {
  PaymentService,
  PaymentError,
  PUSDAmount,
  PUSDBalance,
  PolkadotAddress,
  TransactionHash,
  Result,
} from '@cocuyo/types';
import {
  ok,
  err,
  createPUSDAmount,
  createPUSDBalance,
  createPolkadotAddress,
  addPUSD,
  subtractPUSD,
  comparePUSD,
  PUSD,
  ZERO_PUSD,
} from '@cocuyo/types';
import { createDelay, createTxHashGenerator } from './utils';

interface TransferWatcher {
  address: PolkadotAddress;
  callback: (transfer: {
    from: PolkadotAddress;
    amount: PUSDAmount;
    txHash: TransactionHash;
    timestamp: number;
  }) => void;
}

/**
 * Create a mock payment service for development.
 */
export function createMockPaymentService(options?: {
  /** Initial balances by address */
  initialBalances?: Map<string, PUSDAmount>;
  /** Simulated network delay in ms */
  networkDelay?: number;
  /** Transaction counter start */
  txCounter?: number;
}): PaymentService {
  const {
    initialBalances = new Map(),
    networkDelay = 100,
    txCounter = 1,
  } = options ?? {};

  // State
  const balances = new Map<string, { available: PUSDAmount; locked: PUSDAmount }>(
    Array.from(initialBalances.entries()).map(([addr, amount]) => [
      addr,
      { available: amount, locked: ZERO_PUSD },
    ])
  );
  const watchers: TransferWatcher[] = [];

  const delay = createDelay(networkDelay);
  const generateTxHash = createTxHashGenerator(txCounter);

  const getOrCreateBalance = (address: PolkadotAddress) => {
    const existing = balances.get(address);
    if (existing) return existing;
    const newBalance = { available: ZERO_PUSD, locked: ZERO_PUSD };
    balances.set(address, newBalance);
    return newBalance;
  };

  return {
    async getBalance(address: PolkadotAddress): Promise<PUSDBalance> {
      await delay();
      const balance = getOrCreateBalance(address);
      return createPUSDBalance(address, balance.available, balance.locked);
    },

    async transfer(params: {
      from: PolkadotAddress;
      to: PolkadotAddress;
      amount: PUSDAmount;
      memo?: string;
    }): Promise<Result<TransactionHash, PaymentError>> {
      await delay();

      const { from, to, amount } = params;

      // Validate minimum transfer amount
      if (comparePUSD(amount, createPUSDAmount(PUSD.minimumTransfer)) < 0) {
        return err({
          type: 'BELOW_MINIMUM',
          amount,
          minimum: createPUSDAmount(PUSD.minimumTransfer),
        });
      }

      // Check sender balance
      const senderBalance = getOrCreateBalance(from);
      if (comparePUSD(senderBalance.available, amount) < 0) {
        return err({
          type: 'INSUFFICIENT_BALANCE',
          available: senderBalance.available,
          required: amount,
        });
      }

      // Execute transfer
      const receiverBalance = getOrCreateBalance(to);
      senderBalance.available = subtractPUSD(senderBalance.available, amount);
      receiverBalance.available = addPUSD(receiverBalance.available, amount);

      // Generate receipt
      const txHash = generateTxHash();
      const timestamp = Date.now();

      // Notify watchers
      for (const watcher of watchers) {
        if (watcher.address === to) {
          watcher.callback({ from, amount, txHash, timestamp });
        }
      }

      return ok(txHash);
    },

    watchTransfers(
      address: PolkadotAddress,
      callback: (transfer: {
        from: PolkadotAddress;
        amount: PUSDAmount;
        txHash: TransactionHash;
        timestamp: number;
      }) => void
    ): () => void {
      const watcher: TransferWatcher = { address, callback };
      watchers.push(watcher);

      return () => {
        const index = watchers.indexOf(watcher);
        if (index >= 0) {
          watchers.splice(index, 1);
        }
      };
    },
  };
}

/**
 * Create a mock payment service with preset test balances.
 *
 * Test accounts:
 * - Alice: $1,000
 * - Bob: $500
 * - Treasury: $50,000
 *
 * @internal For testing only
 */
export function createTestPaymentService(): PaymentService {
  const alice = createPolkadotAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
  const bob = createPolkadotAddress('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty');
  const treasury = createPolkadotAddress('5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z');

  const initialBalances = new Map<string, PUSDAmount>([
    [alice, createPUSDAmount(1_000_000_000n)],
    [bob, createPUSDAmount(500_000_000n)],
    [treasury, createPUSDAmount(50_000_000_000n)],
  ]);

  return createMockPaymentService({ initialBalances, networkDelay: 50 });
}
