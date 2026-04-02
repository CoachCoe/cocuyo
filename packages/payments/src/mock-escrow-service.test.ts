import { describe, it, expect } from 'vitest';
import { createMockEscrowService, createTestEscrowService } from './mock-escrow-service';
import { createMockPaymentService } from './mock-payment-service';
import {
  createPolkadotAddress,
  createPUSDAmount,
  createBountyId,
  createDIMCredential,
  createSignalId,
  comparePUSD,
} from '@cocuyo/types';

describe('createMockEscrowService', () => {
  const alice = createPolkadotAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
  const bob = createPolkadotAddress('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty');
  const escrowAddress = createPolkadotAddress('5EscrowHo1dingAddressXXXXXXXXXXXXXXXXXXXXXXXX');
  const aliceCredential = createDIMCredential('alice-dim-credential');
  const bobCredential = createDIMCredential('bob-dim-credential');
  const bountyId = createBountyId('bounty-001');

  function createServices(aliceBalance = 10_000_000_000n) {
    const paymentService = createMockPaymentService({
      initialBalances: new Map([
        [alice, createPUSDAmount(aliceBalance)],
        // Escrow address needs balance for refunds
        [escrowAddress, createPUSDAmount(100_000_000_000n)],
      ]),
      networkDelay: 0,
    });
    const escrowService = createMockEscrowService({
      paymentService,
      networkDelay: 0,
    });
    return { paymentService, escrowService };
  }

  describe('createEscrow', () => {
    it('creates escrow and transfers funds', async () => {
      const { paymentService, escrowService } = createServices();
      const amount = createPUSDAmount(1_000_000_000n);

      const result = await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount,
        payoutMode: 'public',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.bountyId).toBe(bountyId);
        expect(result.value.funderAddress).toBe(alice);
        expect(result.value.status).toBe('active');
        expect(comparePUSD(result.value.amount, amount)).toBe(0);
      }

      // Verify funds were transferred from Alice
      const aliceBalanceAfter = await paymentService.getBalance(alice);
      expect(comparePUSD(aliceBalanceAfter.available, createPUSDAmount(9_000_000_000n))).toBe(0);
    });

    it('fails when creating duplicate escrow for same bounty', async () => {
      const { escrowService } = createServices();
      const amount = createPUSDAmount(1_000_000_000n);

      await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount,
        payoutMode: 'public',
      });

      const result = await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount,
        payoutMode: 'public',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('INVALID_DISTRIBUTION');
      }
    });

    it('fails with insufficient balance', async () => {
      const { escrowService } = createServices(100_000_000n); // Only $100

      const result = await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount: createPUSDAmount(1_000_000_000n), // $1,000
        payoutMode: 'public',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('INSUFFICIENT_BALANCE');
      }
    });
  });

  describe('getEscrow', () => {
    it('returns escrow by ID', async () => {
      const { escrowService } = createServices();

      const createResult = await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount: createPUSDAmount(1_000_000_000n),
        payoutMode: 'public',
      });

      expect(createResult.ok).toBe(true);
      if (!createResult.ok) return;

      const escrow = await escrowService.getEscrow(createResult.value.id);
      expect(escrow).not.toBeNull();
      expect(escrow?.bountyId).toBe(bountyId);
    });

    it('returns null for non-existent escrow', async () => {
      const { escrowService } = createServices();
      const result = await escrowService.getEscrow(
        'escrow-nonexistent' as ReturnType<typeof import('@cocuyo/types').createEscrowId>
      );
      expect(result).toBeNull();
    });
  });

  describe('getEscrowByBounty', () => {
    it('returns escrow by bounty ID', async () => {
      const { escrowService } = createServices();

      await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount: createPUSDAmount(1_000_000_000n),
        payoutMode: 'public',
      });

      const escrow = await escrowService.getEscrowByBounty(bountyId);
      expect(escrow).not.toBeNull();
      expect(escrow?.bountyId).toBe(bountyId);
    });

    it('returns null for bounty without escrow', async () => {
      const { escrowService } = createServices();
      const result = await escrowService.getEscrowByBounty(createBountyId('no-escrow'));
      expect(result).toBeNull();
    });
  });

  describe('releaseFunds', () => {
    it('releases funds to recipients', async () => {
      const { escrowService } = createServices();
      const amount = createPUSDAmount(1_000_000_000n);

      const createResult = await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount,
        payoutMode: 'public',
      });

      expect(createResult.ok).toBe(true);
      if (!createResult.ok) return;

      const releaseResult = await escrowService.releaseFunds({
        escrowId: createResult.value.id,
        distributions: [
          {
            recipientAddress: bob,
            recipientCredential: bobCredential,
            signalId: createSignalId('signal-001'),
            amount,
          },
        ],
      });

      expect(releaseResult.ok).toBe(true);
      if (releaseResult.ok) {
        expect(releaseResult.value.bountyId).toBe(bountyId);
        expect(releaseResult.value.distributions).toHaveLength(1);
        const distribution = releaseResult.value.distributions[0];
        if (distribution) {
          expect(distribution.recipientAddress).toBe(bob);
          expect(distribution.percentage).toBe(100);
        }
      }

      const escrow = await escrowService.getEscrow(createResult.value.id);
      expect(escrow?.status).toBe('released');
    });

    it('fails with mismatched distribution total', async () => {
      const { escrowService } = createServices();

      const createResult = await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount: createPUSDAmount(1_000_000_000n),
        payoutMode: 'public',
      });

      expect(createResult.ok).toBe(true);
      if (!createResult.ok) return;

      const releaseResult = await escrowService.releaseFunds({
        escrowId: createResult.value.id,
        distributions: [
          {
            recipientAddress: bob,
            recipientCredential: bobCredential,
            signalId: createSignalId('signal-001'),
            amount: createPUSDAmount(500_000_000n), // Only half
          },
        ],
      });

      expect(releaseResult.ok).toBe(false);
      if (!releaseResult.ok) {
        expect(releaseResult.error.type).toBe('INVALID_DISTRIBUTION');
      }
    });

    it('fails on already released escrow', async () => {
      const { escrowService } = createServices();
      const amount = createPUSDAmount(1_000_000_000n);

      const createResult = await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount,
        payoutMode: 'public',
      });

      expect(createResult.ok).toBe(true);
      if (!createResult.ok) return;

      await escrowService.releaseFunds({
        escrowId: createResult.value.id,
        distributions: [
          {
            recipientAddress: bob,
            recipientCredential: bobCredential,
            signalId: createSignalId('signal-001'),
            amount,
          },
        ],
      });

      const secondRelease = await escrowService.releaseFunds({
        escrowId: createResult.value.id,
        distributions: [
          {
            recipientAddress: bob,
            recipientCredential: bobCredential,
            signalId: createSignalId('signal-002'),
            amount,
          },
        ],
      });

      expect(secondRelease.ok).toBe(false);
      if (!secondRelease.ok) {
        expect(secondRelease.error.type).toBe('ESCROW_ALREADY_SETTLED');
      }
    });
  });

  describe('refundFunds', () => {
    it('refunds funds to funder', async () => {
      const { paymentService, escrowService } = createServices();
      const amount = createPUSDAmount(1_000_000_000n);

      const createResult = await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount,
        payoutMode: 'public',
      });

      expect(createResult.ok).toBe(true);
      if (!createResult.ok) return;

      // Alice's balance reduced after escrow creation
      const aliceBalanceAfterEscrow = await paymentService.getBalance(alice);
      expect(comparePUSD(aliceBalanceAfterEscrow.available, createPUSDAmount(9_000_000_000n))).toBe(0);

      const refundResult = await escrowService.refundFunds(createResult.value.id);

      expect(refundResult.ok).toBe(true);
      if (refundResult.ok) {
        expect(refundResult.value).toMatch(/^0x/);
      }

      // Alice's balance restored after refund
      const aliceBalanceAfterRefund = await paymentService.getBalance(alice);
      expect(comparePUSD(aliceBalanceAfterRefund.available, createPUSDAmount(10_000_000_000n))).toBe(0);

      const escrow = await escrowService.getEscrow(createResult.value.id);
      expect(escrow?.status).toBe('refunded');
    });

    it('fails on already refunded escrow', async () => {
      const { escrowService } = createServices();

      const createResult = await escrowService.createEscrow({
        bountyId,
        funderAddress: alice,
        funderCredential: aliceCredential,
        amount: createPUSDAmount(1_000_000_000n),
        payoutMode: 'public',
      });

      expect(createResult.ok).toBe(true);
      if (!createResult.ok) return;

      await escrowService.refundFunds(createResult.value.id);
      const secondRefund = await escrowService.refundFunds(createResult.value.id);

      expect(secondRefund.ok).toBe(false);
      if (!secondRefund.ok) {
        expect(secondRefund.error.type).toBe('ESCROW_ALREADY_SETTLED');
      }
    });

    it('fails for non-existent escrow', async () => {
      const { escrowService } = createServices();

      const result = await escrowService.refundFunds(
        'escrow-nonexistent' as ReturnType<typeof import('@cocuyo/types').createEscrowId>
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('ESCROW_NOT_FOUND');
      }
    });
  });
});

describe('createTestEscrowService', () => {
  it('creates escrow service with payment service', async () => {
    const alice = createPolkadotAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

    const paymentService = createMockPaymentService({
      initialBalances: new Map([[alice, createPUSDAmount(1_000_000_000n)]]),
      networkDelay: 0,
    });
    const escrowService = createTestEscrowService(paymentService);

    const result = await escrowService.createEscrow({
      bountyId: createBountyId('test-bounty'),
      funderAddress: alice,
      funderCredential: createDIMCredential('test-cred'),
      amount: createPUSDAmount(100_000_000n),
      payoutMode: 'public',
    });

    expect(result.ok).toBe(true);
  });
});
