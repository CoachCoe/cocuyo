/**
 * Mock coinage service for development.
 *
 * Simulates private payment operations with in-memory coin state.
 */

import type {
  CoinageService,
  CoinageError,
  Coin,
  CoinWallet,
  CoinExponent,
  PUSDAmount,
  PolkadotAddress,
  DIMCredential,
  TransactionHash,
  TransferPackage,
  RecyclerVoucher,
  RecyclerClaimToken,
  ClaimTokenAllocation,
  CoinPublicKey,
  Result,
} from '@cocuyo/types';
import {
  ok,
  err,
  createCoinPublicKey,
  toPUSDCents,
  decomposeAmountCents,
  totalCoinValueCents,
  validateSplit,
  canTransfer,
} from '@cocuyo/types';
import { createDelay, createTxHashGenerator } from './utils';

interface MockCoinageOptions {
  /** Initial coins in wallet */
  initialCoins?: readonly Coin[];
  /** Simulated network delay in ms */
  networkDelay?: number;
  /** Starting derivation index */
  derivationIndex?: number;
}

/**
 * Create a mock coinage service for development.
 */
export function createMockCoinageService(options?: MockCoinageOptions): CoinageService {
  const {
    initialCoins = [],
    networkDelay = 100,
    derivationIndex: initialDerivationIndex = 1,
  } = options ?? {};

  // State
  let wallet: CoinWallet = {
    totalBalanceCents: totalCoinValueCents(initialCoins),
    coins: [...initialCoins],
    nextDerivationIndex: initialDerivationIndex,
    pendingIncoming: [],
  };
  let derivationIndex = initialDerivationIndex;

  const delay = createDelay(networkDelay);
  const generateTxHash = createTxHashGenerator(2000);

  const generateCoinPublicKey = (): CoinPublicKey => {
    return createCoinPublicKey(`coin-pk-${(derivationIndex++).toString().padStart(8, '0')}`);
  };

  const createCoin = (exponent: CoinExponent): Coin => ({
    exponent,
    age: 0,
    owner: generateCoinPublicKey(),
    derivationIndex: derivationIndex - 1,
  });

  const updateWallet = (coins: readonly Coin[]) => {
    wallet = {
      ...wallet,
      coins: [...coins],
      totalBalanceCents: totalCoinValueCents(coins),
      nextDerivationIndex: derivationIndex,
    };
  };

  return {
    async scanForCoins(): Promise<CoinWallet> {
      await delay();
      return wallet;
    },

    getWallet(): CoinWallet {
      return wallet;
    },

    async onboard(params: {
      amount: PUSDAmount;
      sourceAddress: PolkadotAddress;
    }): Promise<Result<RecyclerVoucher[], CoinageError>> {
      await delay();

      const cents = toPUSDCents(params.amount);
      const exponents = decomposeAmountCents(cents);

      const vouchers: RecyclerVoucher[] = exponents.map((exponent) => ({
        recyclerExponent: exponent,
        ringIndex: Math.floor(Math.random() * 100),
        alias: new Uint8Array(32),
        createdAt: Date.now(),
      }));

      return ok(vouchers);
    },

    async claimCoins(params: {
      vouchers: readonly RecyclerVoucher[];
      claimToken: RecyclerClaimToken;
    }): Promise<Result<Coin[], CoinageError>> {
      await delay();

      const { vouchers, claimToken } = params;

      if (claimToken.type === 'paid' && claimToken.expiresAt < Date.now()) {
        return err({ type: 'NO_CLAIM_TOKENS', reason: 'Paid claim token has expired' });
      }

      const newCoins = vouchers.map((v) => createCoin(v.recyclerExponent));
      updateWallet([...wallet.coins, ...newCoins]);

      return ok(newCoins);
    },

    async splitCoin(params: {
      coin: Coin;
      into: readonly CoinExponent[];
    }): Promise<Result<Coin[], CoinageError>> {
      await delay();

      const { coin, into } = params;

      const validationError = validateSplit(coin.exponent, into);
      if (validationError !== null) {
        return err({ type: 'INVALID_SPLIT', reason: validationError });
      }

      const coinIndex = wallet.coins.findIndex((c) => c.derivationIndex === coin.derivationIndex);
      if (coinIndex === -1) {
        return err({ type: 'COIN_NOT_FOUND', derivationIndex: coin.derivationIndex });
      }

      const newCoins = into.map((exponent) => createCoin(exponent));
      const updatedCoins = [
        ...wallet.coins.slice(0, coinIndex),
        ...wallet.coins.slice(coinIndex + 1),
        ...newCoins,
      ];
      updateWallet(updatedCoins);

      return ok(newCoins);
    },

    prepareTransfer(params: {
      coins: readonly Coin[];
      expiresInSeconds?: number;
    }): TransferPackage {
      const { coins, expiresInSeconds = 3600 } = params;

      const keys = coins.map(() => `transfer-key-${Math.random().toString(36).substring(2)}`);
      const expiresAt = Date.now() + expiresInSeconds * 1000;

      // Remove coins from wallet (now pending outgoing)
      const coinIndices = new Set(coins.map((c) => c.derivationIndex));
      const remainingCoins = wallet.coins.filter((c) => !coinIndices.has(c.derivationIndex));
      updateWallet(remainingCoins);

      return {
        keys,
        exponents: coins.map((c) => c.exponent),
        totalValueCents: totalCoinValueCents(coins),
        expiresAt,
      };
    },

    async claimTransfer(params: {
      keys: readonly string[];
    }): Promise<Result<Coin[], CoinageError>> {
      await delay();

      // In mock, create coins based on key count (real impl verifies keys)
      const newCoins = params.keys.map(() => createCoin(0 as CoinExponent));
      updateWallet([...wallet.coins, ...newCoins]);

      return ok(newCoins);
    },

    async cancelTransfer(params: {
      coins: readonly Coin[];
    }): Promise<Result<Coin[], CoinageError>> {
      await delay();

      // Reclaim coins with new keys
      const reclaimedCoins = params.coins.map((c) => createCoin(c.exponent));
      updateWallet([...wallet.coins, ...reclaimedCoins]);

      return ok(reclaimedCoins);
    },

    async recycleCoin(params: {
      coins: readonly Coin[];
      claimToken: RecyclerClaimToken;
    }): Promise<Result<Coin[], CoinageError>> {
      await delay();

      const { coins, claimToken } = params;

      if (claimToken.type === 'paid' && claimToken.expiresAt < Date.now()) {
        return err({ type: 'NO_CLAIM_TOKENS', reason: 'Paid claim token has expired' });
      }

      // Remove old coins, create fresh ones
      const coinIndices = new Set(coins.map((c) => c.derivationIndex));
      const remainingCoins = wallet.coins.filter((c) => !coinIndices.has(c.derivationIndex));
      const freshCoins = coins.map((c) => createCoin(c.exponent));

      updateWallet([...remainingCoins, ...freshCoins]);

      return ok(freshCoins);
    },

    async offboard(params: {
      coins: readonly Coin[];
      destinationAddress: PolkadotAddress;
      claimToken: RecyclerClaimToken;
    }): Promise<Result<TransactionHash, CoinageError>> {
      await delay();

      const { coins, claimToken } = params;

      if (claimToken.type === 'paid' && claimToken.expiresAt < Date.now()) {
        return err({ type: 'NO_CLAIM_TOKENS', reason: 'Paid claim token has expired' });
      }

      for (const coin of coins) {
        if (!canTransfer(coin)) {
          return err({ type: 'COIN_AT_MAX_AGE', coin });
        }
      }

      // Remove coins from wallet
      const coinIndices = new Set(coins.map((c) => c.derivationIndex));
      const remainingCoins = wallet.coins.filter((c) => !coinIndices.has(c.derivationIndex));
      updateWallet(remainingCoins);

      return ok(generateTxHash());
    },

    async getClaimTokenAllocation(credential: DIMCredential): Promise<ClaimTokenAllocation> {
      await delay();

      const periodDays = 7;
      const periodStart = Math.floor(Date.now() / (periodDays * 24 * 60 * 60 * 1000));

      return {
        credential,
        period: periodStart,
        available: 10,
        used: 0,
        periodEndsAt: (periodStart + 1) * periodDays * 24 * 60 * 60 * 1000,
      };
    },
  };
}

/**
 * Create a mock coinage service with preset test coins.
 *
 * Test wallet contains ~$22 in various denominations.
 *
 * @internal For testing only
 */
export function createTestCoinageService(): CoinageService {
  const testCoins: Coin[] = [
    { exponent: 10 as CoinExponent, age: 0, owner: createCoinPublicKey('test-pk-1'), derivationIndex: 1 },
    { exponent: 10 as CoinExponent, age: 0, owner: createCoinPublicKey('test-pk-2'), derivationIndex: 2 },
    { exponent: 7 as CoinExponent, age: 1, owner: createCoinPublicKey('test-pk-3'), derivationIndex: 3 },
    { exponent: 5 as CoinExponent, age: 0, owner: createCoinPublicKey('test-pk-4'), derivationIndex: 4 },
    { exponent: 3 as CoinExponent, age: 2, owner: createCoinPublicKey('test-pk-5'), derivationIndex: 5 },
  ];

  return createMockCoinageService({
    initialCoins: testCoins,
    networkDelay: 50,
    derivationIndex: 100,
  });
}
