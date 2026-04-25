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
  EvidenceQuality,
  Result,
} from '@cocuyo/types';
import { ok, err, createCorroborationId } from '@cocuyo/types';

/**
 * Determine initial quality based on corroboration content.
 * Called automatically during corroborate().
 */
function determineInitialQuality(input: NewCorroboration): EvidenceQuality {
  // Witness accounts are observations
  if (input.type === 'witness') {
    return 'observation';
  }

  // Evidence with links/media is documented
  if (input.evidenceContent || input.evidencePostId) {
    return 'documented';
  }

  // Default
  return 'unverified';
}
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import { getConnectedCredential } from './service-utils';
import { personhoodService } from './personhood-service';

// Session cache for corroborations
const userCorroborations: Corroboration[] = [];

export class CorroborationServiceImpl implements CorroborationService {
  /**
   * Get all corroborations for a post.
   */
  getPostCorroborations(postId: PostId): Promise<readonly Corroboration[]> {
    const corroborations = userCorroborations.filter((c) => c.postId === postId);
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
  async corroborate(newCorroboration: NewCorroboration): Promise<Result<CorroborationId, string>> {
    const dimCredential = getConnectedCredential();
    if (dimCredential === null) {
      return err('Wallet not connected. Please connect to corroborate.');
    }

    // Capability gate: check personhood level allows corroboration
    const canCorroborate = await personhoodService.canPerform(dimCredential, 'canCorroborate');
    if (!canCorroborate) {
      return err('DIM verification required to corroborate.');
    }

    const now = Date.now();

    const quality = newCorroboration.quality ?? determineInitialQuality(newCorroboration);

    const corroboration: Corroboration = {
      id: '' as CorroborationId,
      postId: newCorroboration.postId,
      type: newCorroboration.type,
      dimSignature: dimCredential,
      quality,
      createdAt: now,
      ...(newCorroboration.claimId !== undefined && { claimId: newCorroboration.claimId }),
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

    return ok(corroborationWithId.id);
  }
}

// Export a singleton instance
export const corroborationService = new CorroborationServiceImpl();

// Legacy alias for backward compatibility
export { CorroborationServiceImpl as MockCorroborationService };
