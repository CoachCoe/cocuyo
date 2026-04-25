/**
 * Tests for PersonhoodService.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PersonhoodServiceImpl,
  personhoodService,
  setPersonhoodLevel,
  clearPersonhoodCache,
} from './personhood-service';
import { createDIMCredential } from '@cocuyo/types';
import type { DIMCredential } from '@cocuyo/types';

describe('PersonhoodServiceImpl', () => {
  let service: PersonhoodServiceImpl;
  let testCredential: DIMCredential;

  beforeEach(() => {
    clearPersonhoodCache();
    service = new PersonhoodServiceImpl();
    testCredential = createDIMCredential('test-credential-123');
  });

  describe('getPersonhood', () => {
    it('returns lite level by default for new credentials', async () => {
      const state = await service.getPersonhood(testCredential);

      expect(state).not.toBeNull();
      expect(state?.level).toBe('lite');
      expect(state?.credential).toBe(testCredential);
      expect(state?.verifiedAt).toBeGreaterThan(0);
    });

    it('returns cached state on subsequent calls', async () => {
      const firstState = await service.getPersonhood(testCredential);
      const secondState = await service.getPersonhood(testCredential);

      expect(firstState).toEqual(secondState);
    });
  });

  describe('getLevel', () => {
    it('returns default lite level', async () => {
      const level = await service.getLevel(testCredential);
      expect(level).toBe('lite');
    });

    it('returns updated level after setPersonhoodLevel', async () => {
      setPersonhoodLevel(testCredential, 'full');
      const level = await service.getLevel(testCredential);
      expect(level).toBe('full');
    });
  });

  describe('getCapabilities', () => {
    it('returns correct capabilities for lite level', async () => {
      const caps = await service.getCapabilities(testCredential);

      expect(caps.canIlluminate).toBe(true);
      expect(caps.canCorroborate).toBe(true);
      expect(caps.canChallenge).toBe(true);
      expect(caps.canFundBounty).toBe(true);
      expect(caps.canClaimPayout).toBe(true);
      expect(caps.canReceiveCoinage).toBe(true);
    });

    it('returns correct capabilities for full level', async () => {
      setPersonhoodLevel(testCredential, 'full');
      const caps = await service.getCapabilities(testCredential);

      expect(caps.canIlluminate).toBe(true);
      expect(caps.canCorroborate).toBe(true);
      expect(caps.canChallenge).toBe(true);
      expect(caps.canFundBounty).toBe(true);
      expect(caps.canClaimPayout).toBe(true);
      expect(caps.canReceiveCoinage).toBe(true);
    });

    it('returns correct capabilities for none level', async () => {
      setPersonhoodLevel(testCredential, 'none');
      const caps = await service.getCapabilities(testCredential);

      expect(caps.canIlluminate).toBe(false);
      expect(caps.canCorroborate).toBe(false);
      expect(caps.canChallenge).toBe(false);
      expect(caps.canFundBounty).toBe(false);
      expect(caps.canClaimPayout).toBe(false);
      expect(caps.canReceiveCoinage).toBe(false);
    });
  });

  describe('canPerform', () => {
    it('returns true for allowed actions at lite level', async () => {
      expect(await service.canPerform(testCredential, 'canIlluminate')).toBe(true);
      expect(await service.canPerform(testCredential, 'canCorroborate')).toBe(true);
    });

    it('returns true for all basic actions at lite level', async () => {
      expect(await service.canPerform(testCredential, 'canClaimPayout')).toBe(true);
      expect(await service.canPerform(testCredential, 'canFundBounty')).toBe(true);
    });

    it('returns false for all actions at none level', async () => {
      setPersonhoodLevel(testCredential, 'none');

      expect(await service.canPerform(testCredential, 'canIlluminate')).toBe(false);
      expect(await service.canPerform(testCredential, 'canCorroborate')).toBe(false);
    });
  });

  describe('startVerification', () => {
    it('returns verification URL', async () => {
      const result = await service.startVerification({
        credential: testCredential,
        targetLevel: 'full',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.verificationUrl).toContain('target=full');
      }
    });
  });

  describe('completeVerification', () => {
    it('upgrades to full verification', async () => {
      const result = await service.completeVerification({
        credential: testCredential,
        verificationToken: 'mock-token',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.level).toBe('full');
      }

      const level = await service.getLevel(testCredential);
      expect(level).toBe('full');
    });
  });

  describe('setPersonhoodLevel helper', () => {
    it('sets level in cache', async () => {
      setPersonhoodLevel(testCredential, 'full');
      const level = await personhoodService.getLevel(testCredential);
      expect(level).toBe('full');
    });

    it('allows downgrading level', async () => {
      setPersonhoodLevel(testCredential, 'full');
      setPersonhoodLevel(testCredential, 'none');
      const level = await personhoodService.getLevel(testCredential);
      expect(level).toBe('none');
    });
  });

  describe('clearPersonhoodCache helper', () => {
    it('clears all cached state', async () => {
      // First call creates cached state at 'lite'
      await service.getPersonhood(testCredential);

      // Set to full to verify it's cached
      setPersonhoodLevel(testCredential, 'full');
      expect(await service.getLevel(testCredential)).toBe('full');

      // Clear cache
      clearPersonhoodCache();

      // Next call should create new state at default 'lite'
      expect(await service.getLevel(testCredential)).toBe('lite');
    });
  });
});
