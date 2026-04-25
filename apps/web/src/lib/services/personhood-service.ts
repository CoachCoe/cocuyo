/**
 * Personhood Service implementation.
 *
 * Mock implementation for development. Stores personhood state
 * in memory per-session. Chain implementation will query DIM pallet.
 */

import type {
  PersonhoodService,
  PersonhoodState,
  PersonhoodLevel,
  PersonhoodCapabilities,
  PersonhoodError,
  DIMCredential,
  PUSDAmount,
  Result,
} from '@cocuyo/types';
import {
  ok,
  getCapabilities as getCapabilitiesForLevel,
  canPerform as canPerformForLevel,
  canFundAmount as canFundAmountForLevel,
  canClaimAmount as canClaimAmountForLevel,
} from '@cocuyo/types';

// In-memory personhood state cache
const personhoodCache = new Map<DIMCredential, PersonhoodState>();

// Default all connected users to 'lite' for demo purposes
const DEFAULT_LEVEL: PersonhoodLevel = 'lite';

export class PersonhoodServiceImpl implements PersonhoodService {
  async getPersonhood(credential: DIMCredential): Promise<PersonhoodState | null> {
    const existing = personhoodCache.get(credential);
    if (existing !== undefined) {
      return existing;
    }

    // For demo: auto-create lite personhood for any credential
    const state: PersonhoodState = {
      credential,
      level: DEFAULT_LEVEL,
      verifiedAt: Date.now(),
    };
    personhoodCache.set(credential, state);
    return state;
  }

  async getLevel(credential: DIMCredential): Promise<PersonhoodLevel> {
    const state = await this.getPersonhood(credential);
    return state?.level ?? 'none';
  }

  async getCapabilities(credential: DIMCredential): Promise<PersonhoodCapabilities> {
    const level = await this.getLevel(credential);
    return getCapabilitiesForLevel(level);
  }

  async canPerform(
    credential: DIMCredential,
    action: keyof Omit<PersonhoodCapabilities, 'maxBountyFunding' | 'maxBountyClaim'>
  ): Promise<boolean> {
    const level = await this.getLevel(credential);
    return canPerformForLevel(level, action);
  }

  async canFundAmount(credential: DIMCredential, amount: PUSDAmount): Promise<boolean> {
    const level = await this.getLevel(credential);
    return canFundAmountForLevel(level, amount);
  }

  async canClaimAmount(credential: DIMCredential, amount: PUSDAmount): Promise<boolean> {
    const level = await this.getLevel(credential);
    return canClaimAmountForLevel(level, amount);
  }

  async startVerification(params: {
    credential: DIMCredential;
    targetLevel: PersonhoodLevel;
  }): Promise<Result<{ verificationUrl: string }, PersonhoodError>> {
    // Mock: return a fake verification URL
    return ok({
      verificationUrl: `https://dim.polkadot.network/verify?target=${params.targetLevel}`,
    });
  }

  async completeVerification(params: {
    credential: DIMCredential;
    verificationToken: string;
  }): Promise<Result<PersonhoodState, PersonhoodError>> {
    // Mock: upgrade to full verification
    const state: PersonhoodState = {
      credential: params.credential,
      level: 'full',
      verifiedAt: Date.now(),
      verificationMethod: 'mock',
    };
    personhoodCache.set(params.credential, state);
    return ok(state);
  }
}

// Singleton instance
export const personhoodService = new PersonhoodServiceImpl();

/**
 * Set personhood level directly (for demos/testing).
 */
export function setPersonhoodLevel(credential: DIMCredential, level: PersonhoodLevel): void {
  personhoodCache.set(credential, {
    credential,
    level,
    verifiedAt: Date.now(),
  });
}

/**
 * Clear all cached personhood state (for testing).
 */
export function clearPersonhoodCache(): void {
  personhoodCache.clear();
}
