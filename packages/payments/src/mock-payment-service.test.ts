import { describe, it, expect, vi } from 'vitest';
import { createMockPaymentService, createTestPaymentService } from './mock-payment-service';
import {
  createPolkadotAddress,
  createPUSDAmount,
  ZERO_PUSD,
  comparePUSD,
} from '@cocuyo/types';

describe('createMockPaymentService', () => {
  const alice = createPolkadotAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
  const bob = createPolkadotAddress('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty');

  describe('getBalance', () => {
    it('returns zero balance for new address', async () => {
      const service = createMockPaymentService({ networkDelay: 0 });
      const balance = await service.getBalance(alice);

      expect(balance.address).toBe(alice);
      expect(comparePUSD(balance.available, ZERO_PUSD)).toBe(0);
      expect(comparePUSD(balance.locked, ZERO_PUSD)).toBe(0);
    });

    it('returns initial balance when provided', async () => {
      const initialAmount = createPUSDAmount(1_000_000n); // $1
      const service = createMockPaymentService({
        initialBalances: new Map([[alice, initialAmount]]),
        networkDelay: 0,
      });

      const balance = await service.getBalance(alice);
      expect(comparePUSD(balance.available, initialAmount)).toBe(0);
    });
  });

  describe('transfer', () => {
    it('transfers funds between addresses', async () => {
      const initialAmount = createPUSDAmount(1_000_000_000n); // $1,000
      const transferAmount = createPUSDAmount(100_000_000n); // $100
      const service = createMockPaymentService({
        initialBalances: new Map([[alice, initialAmount]]),
        networkDelay: 0,
      });

      const result = await service.transfer({
        from: alice,
        to: bob,
        amount: transferAmount,
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toMatch(/^0x/);
      }

      // Check balances updated
      const aliceBalance = await service.getBalance(alice);
      const bobBalance = await service.getBalance(bob);

      expect(comparePUSD(aliceBalance.available, createPUSDAmount(900_000_000n))).toBe(0);
      expect(comparePUSD(bobBalance.available, transferAmount)).toBe(0);
    });

    it('fails with insufficient balance', async () => {
      const initialAmount = createPUSDAmount(100_000n); // $0.10
      const transferAmount = createPUSDAmount(1_000_000n); // $1
      const service = createMockPaymentService({
        initialBalances: new Map([[alice, initialAmount]]),
        networkDelay: 0,
      });

      const result = await service.transfer({
        from: alice,
        to: bob,
        amount: transferAmount,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('INSUFFICIENT_BALANCE');
      }
    });

    it('fails with zero amount', async () => {
      const service = createMockPaymentService({
        initialBalances: new Map([[alice, createPUSDAmount(1_000_000n)]]),
        networkDelay: 0,
      });

      const result = await service.transfer({
        from: alice,
        to: bob,
        amount: ZERO_PUSD,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('BELOW_MINIMUM');
      }
    });

    it('fails with amount below minimum', async () => {
      const service = createMockPaymentService({
        initialBalances: new Map([[alice, createPUSDAmount(1_000_000n)]]),
        networkDelay: 0,
      });

      const result = await service.transfer({
        from: alice,
        to: bob,
        amount: createPUSDAmount(1n), // Below $0.10 minimum
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('BELOW_MINIMUM');
      }
    });

    it('includes memo in transfer', async () => {
      const service = createMockPaymentService({
        initialBalances: new Map([[alice, createPUSDAmount(1_000_000n)]]),
        networkDelay: 0,
      });

      const result = await service.transfer({
        from: alice,
        to: bob,
        amount: createPUSDAmount(100_000n),
        memo: 'Test payment',
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('watchTransfers', () => {
    it('notifies on incoming transfer', async () => {
      const service = createMockPaymentService({
        initialBalances: new Map([[alice, createPUSDAmount(1_000_000n)]]),
        networkDelay: 0,
      });

      const callback = vi.fn();
      const unsubscribe = service.watchTransfers(bob, callback);

      await service.transfer({
        from: alice,
        to: bob,
        amount: createPUSDAmount(100_000n),
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          from: alice,
          amount: createPUSDAmount(100_000n),
        })
      );

      unsubscribe();
    });

    it('does not notify for transfers to other addresses', async () => {
      const charlie = createPolkadotAddress('5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y');
      const service = createMockPaymentService({
        initialBalances: new Map([[alice, createPUSDAmount(1_000_000n)]]),
        networkDelay: 0,
      });

      const callback = vi.fn();
      service.watchTransfers(bob, callback);

      await service.transfer({
        from: alice,
        to: charlie,
        amount: createPUSDAmount(100_000n),
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('stops notifying after unsubscribe', async () => {
      const service = createMockPaymentService({
        initialBalances: new Map([[alice, createPUSDAmount(2_000_000n)]]),
        networkDelay: 0,
      });

      const callback = vi.fn();
      const unsubscribe = service.watchTransfers(bob, callback);

      await service.transfer({
        from: alice,
        to: bob,
        amount: createPUSDAmount(100_000n),
      });

      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      await service.transfer({
        from: alice,
        to: bob,
        amount: createPUSDAmount(100_000n),
      });

      expect(callback).toHaveBeenCalledTimes(1); // Still 1
    });
  });
});

describe('createTestPaymentService', () => {
  it('creates service with preset test balances', async () => {
    const service = createTestPaymentService();

    const alice = createPolkadotAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
    const balance = await service.getBalance(alice);

    expect(comparePUSD(balance.available, createPUSDAmount(1_000_000_000n))).toBe(0);
  });
});
