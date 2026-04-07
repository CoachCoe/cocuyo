/**
 * Corroboration Service implementation.
 *
 * Provides corroboration functionality with session cache.
 */

import type {
  CorroborationService,
  Corroboration,
  CorroborationId,
  PostId,
  NewCorroboration,
  Result,
} from '@cocuyo/types';
import {
  ok,
  err,
  createCorroborationId,
} from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import { getConnectedCredential } from './service-utils';

// Session cache for corroborations
const userCorroborations: Corroboration[] = [];

export class CorroborationServiceImpl implements CorroborationService {
  /**
   * Get all corroborations for a post.
   */
  getPostCorroborations(postId: PostId): Promise<readonly Corroboration[]> {
    const corroborations = userCorroborations.filter(
      (c) => c.postId === postId
    );
    return Promise.resolve(corroborations);
  }

  /**
   * @deprecated Use getPostCorroborations instead
   */
  getSignalCorroborations(postId: PostId): Promise<readonly Corroboration[]> {
    return this.getPostCorroborations(postId);
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
      postId: newCorroboration.postId,
      type: newCorroboration.type,
      dimSignature: dimCredential,
      weight: 1.0, // Default weight, would be calculated from reputation
      createdAt: now,
      ...(newCorroboration.note !== undefined && { note: newCorroboration.note }),
      ...(newCorroboration.evidencePostId !== undefined && {
        evidencePostId: newCorroboration.evidencePostId,
      }),
      ...(newCorroboration.evidenceType !== undefined && {
        evidenceType: newCorroboration.evidenceType,
      }),
      ...(newCorroboration.evidenceContent !== undefined && {
        evidenceContent: newCorroboration.evidenceContent,
      }),
      ...(newCorroboration.evidenceDescription !== undefined && {
        evidenceDescription: newCorroboration.evidenceDescription,
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
export const corroborationService = new CorroborationServiceImpl();

// Legacy alias for backward compatibility
export { CorroborationServiceImpl as MockCorroborationService };
