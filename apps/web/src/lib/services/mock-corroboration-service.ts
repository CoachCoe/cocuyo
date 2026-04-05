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
} from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import { getConnectedCredential } from './mock-service-utils';

// Session cache for corroborations
const userCorroborations: Corroboration[] = [];

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
    const dimCredential = getConnectedCredential();
    if (dimCredential === null) {
      return Promise.resolve(
        err('Wallet not connected. Please connect to corroborate.')
      );
    }

    const now = Date.now();

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
