import { describe, it, expect } from 'vitest';
import { createMockCoinageService, createTestCoinageService } from './mock-coinage-service';
import {
  createPolkadotAddress,
  createPUSDAmount,
  createDIMCredential,
  createCoinPublicKey,
  getCoinValueCents,
} from '@cocuyo/types';
import type { Coin, CoinExponent, RecyclerClaimToken } from '@cocuyo/types';

describe('createMockCoinageService', () => {
  const alice = createPolkadotAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
  const aliceCredential = createDIMCredential('alice-dim-credential');

  const createFreeClaimToken = (): RecyclerClaimToken => ({
    type: 'free_person',
    ringIndex: 0,
    counter: 0,
    period: 1,
    proof: new Uint8Array(32),
  });

  const createExpiredPaidToken = (): RecyclerClaimToken => ({
    type: 'paid',
    paidRingIndex: 0,
    proof: new Uint8Array(32),
    expiresAt: Date.now() - 1000, // Expired
  });

  describe('getWallet and scanForCoins', () => {
    it('returns empty wallet by default', async () => {
      const service = createMockCoinageService({ networkDelay: 0 });
      const wallet = service.getWallet();

      expect(wallet.coins).toHaveLength(0);
      expect(wallet.totalBalanceCents).toBe(0);
    });

    it('returns wallet with initial coins', async () => {
      const testCoins: Coin[] = [
        { exponent: 10 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-1'), derivationIndex: 1 },
      ];
      const service = createMockCoinageService({
        initialCoins: testCoins,
        networkDelay: 0,
      });

      const wallet = service.getWallet();
      expect(wallet.coins).toHaveLength(1);
      expect(wallet.totalBalanceCents).toBe(getCoinValueCents(10 as CoinExponent));
    });

    it('scanForCoins returns current wallet state', async () => {
      const service = createMockCoinageService({ networkDelay: 0 });
      const wallet = await service.scanForCoins();

      expect(wallet.coins).toHaveLength(0);
      expect(wallet.totalBalanceCents).toBe(0);
    });
  });

  describe('onboard', () => {
    it('creates vouchers for pUSD amount', async () => {
      const service = createMockCoinageService({ networkDelay: 0 });
      const amount = createPUSDAmount(10_000_000n); // $10 = 1000 cents

      const result = await service.onboard({
        amount,
        sourceAddress: alice,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        // Should decompose into optimal coin set
        const totalCents = result.value.reduce(
          (sum, v) => sum + getCoinValueCents(v.recyclerExponent),
          0
        );
        expect(totalCents).toBe(1000);
      }
    });
  });

  describe('claimCoins', () => {
    it('claims coins from vouchers', async () => {
      const service = createMockCoinageService({ networkDelay: 0 });

      // First onboard to get vouchers
      const onboardResult = await service.onboard({
        amount: createPUSDAmount(10_000_000n),
        sourceAddress: alice,
      });

      expect(onboardResult.ok).toBe(true);
      if (!onboardResult.ok) return;

      const claimResult = await service.claimCoins({
        vouchers: onboardResult.value,
        claimToken: createFreeClaimToken(),
      });

      expect(claimResult.ok).toBe(true);
      if (claimResult.ok) {
        expect(claimResult.value.length).toBe(onboardResult.value.length);
        // Wallet should now have coins
        const wallet = service.getWallet();
        expect(wallet.coins.length).toBe(claimResult.value.length);
      }
    });

    it('fails with expired paid claim token', async () => {
      const service = createMockCoinageService({ networkDelay: 0 });

      const result = await service.claimCoins({
        vouchers: [
          { recyclerExponent: 5 as CoinExponent, ringIndex: 0, alias: new Uint8Array(32), createdAt: Date.now() },
        ],
        claimToken: createExpiredPaidToken(),
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('NO_CLAIM_TOKENS');
      }
    });
  });

  describe('splitCoin', () => {
    it('splits coin into smaller denominations', async () => {
      const testCoins: Coin[] = [
        { exponent: 10 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-1'), derivationIndex: 100 },
      ];
      const service = createMockCoinageService({
        initialCoins: testCoins,
        networkDelay: 0,
        derivationIndex: 200, // Start higher to avoid collision with test coin
      });

      const coin = testCoins[0];
      if (!coin) throw new Error('Test setup error: missing coin');

      const result = await service.splitCoin({
        coin,
        into: [9 as CoinExponent, 9 as CoinExponent], // Split $10.24 into 2x $5.12
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        const firstCoin = result.value[0];
        const secondCoin = result.value[1];
        if (firstCoin) expect(firstCoin.exponent).toBe(9);
        if (secondCoin) expect(secondCoin.exponent).toBe(9);
      }

      // Original coin should be gone
      const wallet = service.getWallet();
      expect(wallet.coins.some((c) => c.derivationIndex === 100)).toBe(false);
      expect(wallet.coins).toHaveLength(2);
    });

    it('fails with invalid split (sum mismatch)', async () => {
      const testCoins: Coin[] = [
        { exponent: 10 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-1'), derivationIndex: 1 },
      ];
      const service = createMockCoinageService({
        initialCoins: testCoins,
        networkDelay: 0,
      });

      const coin = testCoins[0];
      if (!coin) throw new Error('Test setup error: missing coin');

      const result = await service.splitCoin({
        coin,
        into: [5 as CoinExponent, 5 as CoinExponent], // $0.32 + $0.32 != $10.24
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('INVALID_SPLIT');
      }
    });

    it('fails with coin not in wallet', async () => {
      const service = createMockCoinageService({ networkDelay: 0 });

      const result = await service.splitCoin({
        coin: { exponent: 5 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-1'), derivationIndex: 999 },
        into: [4 as CoinExponent, 4 as CoinExponent],
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // Either COIN_NOT_FOUND or INVALID_SPLIT depending on validation order
        expect(['COIN_NOT_FOUND', 'INVALID_SPLIT']).toContain(result.error.type);
      }
    });
  });

  describe('prepareTransfer', () => {
    it('prepares transfer package with keys', () => {
      const testCoins: Coin[] = [
        { exponent: 5 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-1'), derivationIndex: 1 },
        { exponent: 3 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-2'), derivationIndex: 2 },
      ];
      const service = createMockCoinageService({
        initialCoins: testCoins,
        networkDelay: 0,
      });

      const transfer = service.prepareTransfer({
        coins: testCoins,
      });

      expect(transfer.keys).toHaveLength(2);
      expect(transfer.exponents).toHaveLength(2);
      expect(transfer.totalValueCents).toBe(
        getCoinValueCents(5 as CoinExponent) + getCoinValueCents(3 as CoinExponent)
      );
      expect(transfer.expiresAt).toBeGreaterThan(Date.now());

      // Coins should be removed from wallet (now pending)
      const wallet = service.getWallet();
      expect(wallet.coins).toHaveLength(0);
    });
  });

  describe('cancelTransfer', () => {
    it('reclaims coins from cancelled transfer', async () => {
      const testCoins: Coin[] = [
        { exponent: 5 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-1'), derivationIndex: 1 },
      ];
      const service = createMockCoinageService({
        initialCoins: testCoins,
        networkDelay: 0,
      });

      service.prepareTransfer({ coins: testCoins });

      // Coins gone from wallet
      expect(service.getWallet().coins).toHaveLength(0);

      const result = await service.cancelTransfer({ coins: testCoins });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        // Wallet should have reclaimed coins
        expect(service.getWallet().coins).toHaveLength(1);
      }
    });
  });

  describe('recycleCoin', () => {
    it('recycles coins to reset age', async () => {
      // Use age >= 3 (minAgeForRecycling)
      const testCoins: Coin[] = [
        { exponent: 5 as CoinExponent, age: 5, owner: createCoinPublicKey('pk-1'), derivationIndex: 1 },
      ];
      const service = createMockCoinageService({
        initialCoins: testCoins,
        networkDelay: 0,
      });

      const result = await service.recycleCoin({
        coins: testCoins,
        claimToken: createFreeClaimToken(),
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        const coin = result.value[0];
        if (coin) {
          expect(coin.age).toBe(0);
          expect(coin.exponent).toBe(5);
        }
      }
    });

    it('fails with expired paid claim token', async () => {
      const testCoins: Coin[] = [
        { exponent: 5 as CoinExponent, age: 5, owner: createCoinPublicKey('pk-1'), derivationIndex: 1 },
      ];
      const service = createMockCoinageService({
        initialCoins: testCoins,
        networkDelay: 0,
      });

      const result = await service.recycleCoin({
        coins: testCoins,
        claimToken: createExpiredPaidToken(),
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('NO_CLAIM_TOKENS');
      }
    });
  });

  describe('offboard', () => {
    it('converts coins back to pUSD', async () => {
      const testCoins: Coin[] = [
        { exponent: 10 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-1'), derivationIndex: 1 },
      ];
      const service = createMockCoinageService({
        initialCoins: testCoins,
        networkDelay: 0,
      });

      const result = await service.offboard({
        coins: testCoins,
        destinationAddress: alice,
        claimToken: createFreeClaimToken(),
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toMatch(/^0x/);
      }

      // Coins should be removed from wallet
      expect(service.getWallet().coins).toHaveLength(0);
    });

    it('fails with expired paid claim token', async () => {
      const testCoins: Coin[] = [
        { exponent: 5 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-1'), derivationIndex: 1 },
      ];
      const service = createMockCoinageService({
        initialCoins: testCoins,
        networkDelay: 0,
      });

      const result = await service.offboard({
        coins: testCoins,
        destinationAddress: alice,
        claimToken: createExpiredPaidToken(),
      });

      expect(result.ok).toBe(false);
    });
  });

  describe('getClaimTokenAllocation', () => {
    it('returns allocation for credential', async () => {
      const service = createMockCoinageService({ networkDelay: 0 });

      const allocation = await service.getClaimTokenAllocation(aliceCredential);

      expect(allocation.credential).toBe(aliceCredential);
      expect(allocation.available).toBeGreaterThan(0);
      expect(allocation.used).toBe(0);
    });
  });
});

describe('createTestCoinageService', () => {
  it('creates service with preset test coins', () => {
    const service = createTestCoinageService();
    const wallet = service.getWallet();

    expect(wallet.coins.length).toBeGreaterThan(0);
    expect(wallet.totalBalanceCents).toBeGreaterThan(0);
  });
});
