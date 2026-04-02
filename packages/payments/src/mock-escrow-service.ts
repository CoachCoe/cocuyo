/**
 * Mock escrow service for development.
 *
 * Simulates bounty escrow management with in-memory state.
 * Funds are actually transferred to/from an escrow address.
 */

import type {
  EscrowService,
  EscrowState,
  EscrowError,
  PaymentService,
  BountyPayout,
  PayoutDistribution,
  PUSDAmount,
  PolkadotAddress,
  BountyId,
  EscrowId,
  DIMCredential,
  SignalId,
  TransactionHash,
  Result,
  PaymentMode,
} from '@cocuyo/types';
import {
  ok,
  err,
  createEscrowId,
  createPolkadotAddress,
  addPUSD,
  comparePUSD,
  ZERO_PUSD,
  toPUSDCents,
} from '@cocuyo/types';
import { createDelay, createTxHashGenerator } from './utils';

// Mock escrow holding address
const ESCROW_ADDRESS = createPolkadotAddress('5EscrowHo1dingAddressXXXXXXXXXXXXXXXXXXXXXXXX');

interface MockEscrowOptions {
  /** Payment service for fund transfers */
  paymentService: PaymentService;
  /** Escrow counter start */
  escrowCounter?: number;
  /** Simulated network delay in ms */
  networkDelay?: number;
}

/**
 * Create a mock escrow service for development.
 */
export function createMockEscrowService(options: MockEscrowOptions): EscrowService {
  const {
    paymentService,
    escrowCounter: initialEscrowCounter = 1,
    networkDelay = 100,
  } = options;

  // State
  const escrows = new Map<string, EscrowState>();
  const bountyToEscrow = new Map<string, EscrowId>();
  let escrowCounter = initialEscrowCounter;

  const delay = createDelay(networkDelay);
  const generateTxHash = createTxHashGenerator(1000);

  const generateEscrowId = (): EscrowId => {
    return createEscrowId(`escrow-${(escrowCounter++).toString().padStart(8, '0')}`);
  };

  return {
    async createEscrow(params: {
      bountyId: BountyId;
      funderAddress: PolkadotAddress;
      funderCredential: DIMCredential;
      amount: PUSDAmount;
      payoutMode: PaymentMode;
    }): Promise<Result<EscrowState, EscrowError>> {
      await delay();

      const { bountyId, funderAddress, funderCredential, amount, payoutMode } = params;

      // Check if escrow already exists for this bounty
      if (bountyToEscrow.has(bountyId)) {
        return err({
          type: 'INVALID_DISTRIBUTION',
          reason: `Escrow already exists for bounty ${bountyId}`,
        });
      }

      // Transfer funds from funder to escrow address
      const transferResult = await paymentService.transfer({
        from: funderAddress,
        to: ESCROW_ADDRESS,
        amount,
        memo: `Escrow deposit for bounty ${bountyId}`,
      });

      if (!transferResult.ok) {
        // Map payment error to escrow error
        if (transferResult.error.type === 'INSUFFICIENT_BALANCE') {
          return err({
            type: 'INSUFFICIENT_BALANCE',
            available: transferResult.error.available,
            required: transferResult.error.required,
          });
        }
        return err({
          type: 'TRANSACTION_FAILED',
          reason: `Failed to transfer funds: ${transferResult.error.type}`,
        });
      }

      // Create escrow record
      const escrowId = generateEscrowId();
      const escrowState: EscrowState = {
        id: escrowId,
        bountyId,
        funderAddress,
        funderCredential,
        amount,
        status: 'active',
        payoutMode,
        depositTxHash: transferResult.value,
        createdAt: Date.now(),
      };

      escrows.set(escrowId, escrowState);
      bountyToEscrow.set(bountyId, escrowId);

      return ok(escrowState);
    },

    async getEscrow(escrowId: EscrowId): Promise<EscrowState | null> {
      await delay();
      return escrows.get(escrowId) ?? null;
    },

    async getEscrowByBounty(bountyId: BountyId): Promise<EscrowState | null> {
      await delay();
      const escrowId = bountyToEscrow.get(bountyId);
      if (!escrowId) return null;
      return escrows.get(escrowId) ?? null;
    },

    async releaseFunds(params: {
      escrowId: EscrowId;
      distributions: readonly {
        recipientAddress: PolkadotAddress;
        recipientCredential: DIMCredential;
        signalId: SignalId;
        amount: PUSDAmount;
      }[];
    }): Promise<Result<BountyPayout, EscrowError>> {
      await delay();

      const { escrowId, distributions } = params;

      const escrow = escrows.get(escrowId);
      if (!escrow) {
        return err({ type: 'ESCROW_NOT_FOUND', escrowId });
      }

      if (escrow.status !== 'active') {
        return err({ type: 'ESCROW_ALREADY_SETTLED', escrowId });
      }

      // Validate distribution total matches escrow amount
      const totalDistribution = distributions.reduce<PUSDAmount>(
        (sum, d) => addPUSD(sum, d.amount),
        ZERO_PUSD
      );

      if (comparePUSD(totalDistribution, escrow.amount) !== 0) {
        return err({
          type: 'INVALID_DISTRIBUTION',
          reason: 'Distribution total does not match escrow amount',
        });
      }

      const totalCents = toPUSDCents(escrow.amount);
      const settlementTxHash = generateTxHash();

      // Build payout distributions with percentages
      const payoutDistributions: PayoutDistribution[] = distributions.map((d) => ({
        signalId: d.signalId,
        recipientAddress: d.recipientAddress,
        recipientCredential: d.recipientCredential,
        amount: d.amount,
        percentage: totalCents > 0 ? (toPUSDCents(d.amount) / totalCents) * 100 : 0,
      }));

      // Update escrow state
      const updatedEscrow: EscrowState = {
        ...escrow,
        status: 'released',
        settlementTxHash,
      };
      escrows.set(escrowId, updatedEscrow);

      return ok({
        bountyId: escrow.bountyId,
        totalAmount: escrow.amount,
        distributions: payoutDistributions,
        payoutMode: escrow.payoutMode,
        txHash: settlementTxHash,
        executedAt: Date.now(),
      });
    },

    async refundFunds(escrowId: EscrowId): Promise<Result<TransactionHash, EscrowError>> {
      await delay();

      const escrow = escrows.get(escrowId);
      if (!escrow) {
        return err({ type: 'ESCROW_NOT_FOUND', escrowId });
      }

      if (escrow.status !== 'active') {
        return err({ type: 'ESCROW_ALREADY_SETTLED', escrowId });
      }

      // Transfer funds back to funder
      const refundResult = await paymentService.transfer({
        from: ESCROW_ADDRESS,
        to: escrow.funderAddress,
        amount: escrow.amount,
        memo: `Escrow refund for bounty ${escrow.bountyId}`,
      });

      if (!refundResult.ok) {
        return err({
          type: 'TRANSACTION_FAILED',
          reason: `Failed to refund: ${refundResult.error.type}`,
        });
      }

      // Update escrow state
      const updatedEscrow: EscrowState = {
        ...escrow,
        status: 'refunded',
        settlementTxHash: refundResult.value,
      };
      escrows.set(escrowId, updatedEscrow);

      return ok(refundResult.value);
    },
  };
}

/**
 * Create a mock escrow service with a test payment service.
 *
 * @internal For testing only
 */
export function createTestEscrowService(paymentService: PaymentService): EscrowService {
  return createMockEscrowService({ paymentService, networkDelay: 50 });
}
