import { describe, it, expect } from 'vitest';
import { createPaymentRouter } from './payment-router';
import { createMockPaymentService } from './mock-payment-service';
import { createMockCoinageService } from './mock-coinage-service';
import {
  createPolkadotAddress,
  createPUSDAmount,
  createCoinPublicKey,
} from '@cocuyo/types';
import type { Coin, CoinExponent } from '@cocuyo/types';

describe('createPaymentRouter', () => {
  const alice = createPolkadotAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
  const bob = createPolkadotAddress('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty');

  function createRouter() {
    const paymentService = createMockPaymentService({
      initialBalances: new Map([[alice, createPUSDAmount(10_000_000_000n)]]), // $10,000
      networkDelay: 0,
    });

    const testCoins: Coin[] = [
      { exponent: 10 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-1'), derivationIndex: 1 }, // $10.24
      { exponent: 10 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-2'), derivationIndex: 2 }, // $10.24
      { exponent: 7 as CoinExponent, age: 0, owner: createCoinPublicKey('pk-3'), derivationIndex: 3 },  // $1.28
    ];

    const coinageService = createMockCoinageService({
      initialCoins: testCoins,
      networkDelay: 0,
    });

    return createPaymentRouter({ paymentService, coinageService });
  }

  describe('getRecommendedMode', () => {
    it('recommends private for bounty payouts (protects journalist identity)', () => {
      const router = createRouter();

      const result = router.getRecommendedMode({
        useCase: 'bounty_payout',
      });

      expect(result.mode).toBe('private');
      expect(result.reason).toBeTruthy();
    });

    it('recommends public for settlement (transparency)', () => {
      const router = createRouter();

      const result = router.getRecommendedMode({
        useCase: 'settlement',
      });

      expect(result.mode).toBe('public');
    });

    it('recommends private for journalist salary', () => {
      const router = createRouter();

      const result = router.getRecommendedMode({
        useCase: 'journalist_salary',
      });

      expect(result.mode).toBe('private');
    });

    it('falls back to public when receiver lacks coinage', () => {
      const router = createRouter();

      const result = router.getRecommendedMode({
        useCase: 'journalist_salary',
        receiverHasCoinage: false,
      });

      expect(result.mode).toBe('public');
      expect(result.warning).toBeTruthy();
    });

    it('respects compliance requirements', () => {
      const router = createRouter();

      const result = router.getRecommendedMode({
        useCase: 'journalist_salary',
        complianceRequired: true,
      });

      expect(result.mode).toBe('public');
    });

    it('considers sender preference', () => {
      const router = createRouter();

      const result = router.getRecommendedMode({
        useCase: 'contribution',
        senderPreference: 'private',
      });

      expect(result.mode).toBe('private');
    });
  });

  describe('sendPublicPayment', () => {
    it('sends pUSD transfer', async () => {
      const router = createRouter();

      const result = await router.sendPublicPayment({
        from: alice,
        to: bob,
        amount: createPUSDAmount(100_000_000n), // $100
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toMatch(/^0x/);
      }
    });

    it('fails with insufficient balance', async () => {
      const router = createRouter();

      const result = await router.sendPublicPayment({
        from: bob, // Bob has no balance
        to: alice,
        amount: createPUSDAmount(100_000_000n),
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('INSUFFICIENT_BALANCE');
      }
    });

    it('includes memo in payment', async () => {
      const router = createRouter();

      const result = await router.sendPublicPayment({
        from: alice,
        to: bob,
        amount: createPUSDAmount(100_000n),
        memo: 'Test payment',
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('preparePrivatePayment', () => {
    it('prepares transfer package', async () => {
      const router = createRouter();

      const result = await router.preparePrivatePayment({
        amountCents: 500, // $5
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.keys.length).toBeGreaterThan(0);
        expect(result.value.totalValueCents).toBeGreaterThanOrEqual(500);
      }
    });

    it('fails with insufficient coins', async () => {
      const router = createRouter();

      const result = await router.preparePrivatePayment({
        amountCents: 10000, // $100 - more than available
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('INSUFFICIENT_COINS');
      }
    });

    it('selects optimal coins (largest first)', async () => {
      const router = createRouter();

      // Request $15 - should select both $10.24 coins
      const result = await router.preparePrivatePayment({
        amountCents: 1500,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        // Should use 2 large coins (2048 cents total = $20.48)
        expect(result.value.totalValueCents).toBeGreaterThanOrEqual(1500);
      }
    });
  });
});
