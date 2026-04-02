/**
 * Payment router for selecting between public and private payments.
 */

import type {
  PaymentRouter,
  PaymentService,
  CoinageService,
  PaymentError,
  CoinageError,
  PUSDAmount,
  PolkadotAddress,
  TransactionHash,
  TransferPackage,
  PaymentMode,
  PaymentModeContext,
  Result,
} from '@cocuyo/types';
import { ok, err, selectPaymentMode, describePaymentMode } from '@cocuyo/types';

interface PaymentRouterOptions {
  paymentService: PaymentService;
  coinageService: CoinageService;
}

/**
 * Build PaymentModeContext without undefined values for exactOptionalPropertyTypes.
 */
function buildModeContext(
  useCase: string,
  complianceRequired: boolean,
  senderPreference?: PaymentMode,
  receiverPreference?: PaymentMode
): PaymentModeContext {
  const base: PaymentModeContext = {
    useCase: useCase as PaymentModeContext['useCase'],
    complianceRequired,
  };

  // Only add optional properties if they have values
  if (senderPreference !== undefined && receiverPreference !== undefined) {
    return { ...base, senderPreference, receiverPreference };
  }
  if (senderPreference !== undefined) {
    return { ...base, senderPreference };
  }
  if (receiverPreference !== undefined) {
    return { ...base, receiverPreference };
  }
  return base;
}

export function createPaymentRouter(options: PaymentRouterOptions): PaymentRouter {
  const { paymentService, coinageService } = options;

  return {
    getRecommendedMode(params: {
      useCase: string;
      senderPreference?: PaymentMode;
      receiverPreference?: PaymentMode;
      complianceRequired?: boolean;
      receiverHasCoinage?: boolean;
    }): { mode: PaymentMode; reason: string; warning?: string } {
      const { receiverHasCoinage = true, complianceRequired = false } = params;

      const context = buildModeContext(
        params.useCase,
        complianceRequired,
        params.senderPreference,
        params.receiverPreference
      );

      const result = selectPaymentMode(context);

      // Fall back to public if receiver can't use private
      if (result.mode === 'private' && !receiverHasCoinage) {
        return {
          mode: 'public',
          reason: 'Receiver does not support private payments',
          warning: 'Falling back to public payment as receiver has not set up Coinage',
        };
      }

      const modeInfo = describePaymentMode(result.mode);

      if (result.warning) {
        return { mode: result.mode, reason: modeInfo.description, warning: result.warning };
      }
      return { mode: result.mode, reason: modeInfo.description };
    },

    async sendPublicPayment(params: {
      from: PolkadotAddress;
      to: PolkadotAddress;
      amount: PUSDAmount;
      memo?: string;
    }): Promise<Result<TransactionHash, PaymentError>> {
      return paymentService.transfer(params);
    },

    async preparePrivatePayment(params: {
      amountCents: number;
    }): Promise<Result<TransferPackage, CoinageError>> {
      const { amountCents } = params;
      const wallet = coinageService.getWallet();

      if (wallet.totalBalanceCents < amountCents) {
        return err({
          type: 'INSUFFICIENT_COINS',
          available: wallet.totalBalanceCents,
          required: amountCents,
        });
      }

      // Select coins greedily (largest first)
      const sortedCoins = [...wallet.coins].sort((a, b) => b.exponent - a.exponent);
      const selectedCoins: typeof sortedCoins = [];
      let selectedValue = 0;

      for (const coin of sortedCoins) {
        if (selectedValue >= amountCents) break;
        selectedCoins.push(coin);
        selectedValue += 2 ** coin.exponent;
      }

      const transferPackage = coinageService.prepareTransfer({
        coins: selectedCoins,
        expiresInSeconds: 3600,
      });

      return ok(transferPackage);
    },
  };
}
