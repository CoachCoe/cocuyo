'use client';

/**
 * Personhood Hook
 *
 * Provides personhood state and capability checks for the current user.
 * Integrates with wallet state from useSigner.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSigner } from '@/lib/context/SignerContext';
import {
  personhoodService,
  setPersonhoodLevel as setPersonhoodLevelService,
} from '@/lib/services/personhood-service';
import type {
  PersonhoodLevel,
  PersonhoodCapabilities,
  PersonhoodState,
} from '@cocuyo/types';
import { createDIMCredential, getCapabilities } from '@cocuyo/types';

/**
 * Personhood state and actions returned by the hook.
 */
export interface PersonhoodInfo {
  /** Current personhood level */
  level: PersonhoodLevel;
  /** Full personhood state */
  state: PersonhoodState | null;
  /** Capabilities at current level */
  capabilities: PersonhoodCapabilities;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;

  // Actions
  /** Check if a specific action is allowed */
  canPerform: (
    action: keyof Omit<PersonhoodCapabilities, 'maxBountyFunding' | 'maxBountyClaim'>
  ) => boolean;
  /** Initiate upgrade verification */
  upgradeToFull: () => Promise<void>;
  /** For demos: directly set level */
  setLevel: (level: PersonhoodLevel) => void;
}

/**
 * Hook to access personhood state and capabilities.
 */
export function usePersonhood(): PersonhoodInfo {
  const { selectedAccount, isConnected } = useSigner();
  const [level, setLevelState] = useState<PersonhoodLevel>('none');
  const [state, setState] = useState<PersonhoodState | null>(null);
  const [capabilities, setCapabilities] = useState<PersonhoodCapabilities>(
    getCapabilities('none')
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Load personhood state when account changes
  useEffect(() => {
    mountedRef.current = true;
    const isMounted = (): boolean => mountedRef.current;

    async function loadPersonhood(): Promise<void> {
      if (!isConnected || selectedAccount === null) {
        setLevelState('none');
        setState(null);
        setCapabilities(getCapabilities('none'));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const credential = createDIMCredential(`dim-${selectedAccount.address.slice(2, 14)}`);
        const personhoodState = await personhoodService.getPersonhood(credential);

        if (!isMounted()) return;

        if (personhoodState !== null) {
          setLevelState(personhoodState.level);
          setState(personhoodState);
          setCapabilities(getCapabilities(personhoodState.level));
        } else {
          setLevelState('none');
          setState(null);
          setCapabilities(getCapabilities('none'));
        }
      } catch (err) {
        if (!isMounted()) return;
        setError(err instanceof Error ? err.message : 'Failed to load personhood');
      } finally {
        if (isMounted()) {
          setIsLoading(false);
        }
      }
    }

    void loadPersonhood();

    return () => {
      mountedRef.current = false;
    };
  }, [selectedAccount, isConnected]);

  const canPerform = useCallback(
    (
      action: keyof Omit<PersonhoodCapabilities, 'maxBountyFunding' | 'maxBountyClaim'>
    ): boolean => {
      return capabilities[action];
    },
    [capabilities]
  );

  const upgradeToFull = useCallback(async (): Promise<void> => {
    if (selectedAccount === null) {
      throw new Error('No wallet connected');
    }

    const credential = createDIMCredential(`dim-${selectedAccount.address.slice(2, 14)}`);
    const result = await personhoodService.startVerification({
      credential,
      targetLevel: 'full',
    });

    if (!result.ok) {
      throw new Error(`Verification failed: ${result.error.type}`);
    }

    // In a real implementation, redirect to verification URL
    // For demo, directly complete the verification
    const completeResult = await personhoodService.completeVerification({
      credential,
      verificationToken: 'mock-token',
    });

    if (!completeResult.ok) {
      throw new Error(`Verification failed: ${completeResult.error.type}`);
    }

    // Reload state
    const newState = await personhoodService.getPersonhood(credential);
    if (newState !== null) {
      setLevelState(newState.level);
      setState(newState);
      setCapabilities(getCapabilities(newState.level));
    }
  }, [selectedAccount]);

  const setLevel = useCallback(
    (newLevel: PersonhoodLevel): void => {
      if (selectedAccount === null) return;

      const credential = createDIMCredential(`dim-${selectedAccount.address.slice(2, 14)}`);
      setPersonhoodLevelService(credential, newLevel);
      setLevelState(newLevel);
      setState({ credential, level: newLevel, verifiedAt: Date.now() });
      setCapabilities(getCapabilities(newLevel));
    },
    [selectedAccount]
  );

  return {
    level,
    state,
    capabilities,
    isLoading,
    error,
    canPerform,
    upgradeToFull,
    setLevel,
  };
}
