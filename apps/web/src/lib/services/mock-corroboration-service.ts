/**
 * Mock implementation of the CorroborationService.
 *
 * Provides corroboration functionality with session cache.
 */

import type {
  CorroborationService,
  Corroboration,
  CorroborationId,
  SignalId,
  NewCorroboration,
  Result,
} from '@cocuyo/types';
import {
  ok,
  err,
  createCorroborationId,
  createDIMCredential,
} from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';

// Session cache for corroborations
const userCorroborations: Corroboration[] = [];

// Connected wallet
let connectedAddress: string | null = null;

export function setCorroborationWallet(address: string | null): void {
  connectedAddress = address;
}

export class MockCorroborationService implements CorroborationService {
  /**
   * Get all corroborations for a signal.
   */
  getSignalCorroborations(signalId: SignalId): Promise<readonly Corroboration[]> {
    const corroborations = userCorroborations.filter(
      (c) => c.signalId === signalId
    );
    return Promise.resolve(corroborations);
  }

  /**
   * Submit a corroboration.
   */
  corroborate(
    newCorroboration: NewCorroboration
  ): Promise<Result<CorroborationId, string>> {
    if (connectedAddress === null) {
      return Promise.resolve(
        err('Wallet not connected. Please connect to corroborate.')
      );
    }

    const now = Date.now();
    const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);

    const corroboration: Corroboration = {
      id: '' as CorroborationId,
      signalId: newCorroboration.signalId,
      type: newCorroboration.type,
      dimSignature: dimCredential,
      weight: 1.0, // Default weight, would be calculated from reputation
      createdAt: now,
      ...(newCorroboration.note !== undefined && { note: newCorroboration.note }),
      ...(newCorroboration.evidenceSignalId !== undefined && {
        evidenceSignalId: newCorroboration.evidenceSignalId,
      }),
    };

    // Generate CID-based ID
    const cid = calculateCIDFromJSON(corroboration);
    const corroborationWithId: Corroboration = {
      ...corroboration,
      id: createCorroborationId(cid),
    };

    // Add to session cache
    userCorroborations.unshift(corroborationWithId);

    return Promise.resolve(ok(corroborationWithId.id));
  }
}

// Export a singleton instance
export const corroborationService = new MockCorroborationService();
