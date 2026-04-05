'use client';

/**
 * Signer Context
 *
 * Provides wallet connection state via @polkadot-apps/signer's SignerManager.
 * Handles auto-detection of Host API vs browser extensions.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  SignerManager,
  type SignerState,
  type SignerAccount,
  type ConnectionStatus,
  type SignerError as PolkadotSignerError,
  isInsideContainer,
} from '@polkadot-apps/signer';
import type { PolkadotSigner } from 'polkadot-api';
import type { Result } from '@cocuyo/types';
import { SignerNotConnectedError, SigningFailedError } from '../errors';

/** Context value with manager access and state */
interface SignerContextValue {
  manager: SignerManager;
  state: SignerState;
}

const SignerContext = createContext<SignerContextValue | null>(null);

interface SignerProviderProps {
  children: ReactNode;
}

/**
 * Provider component that initializes and manages the SignerManager.
 * Auto-connects on mount using environment-aware detection.
 */
export function SignerProvider({ children }: SignerProviderProps): ReactNode {
  const managerRef = useRef<SignerManager | null>(null);
  const [state, setState] = useState<SignerState | null>(null);

  useEffect(() => {
    const manager = new SignerManager({
      dappName: 'firefly-network',
      ss58Prefix: 42,
      hostTimeout: 10_000,
      extensionTimeout: 1_000,
    });
    managerRef.current = manager;

    const unsubscribe = manager.subscribe(setState);
    void manager.connect();

    return () => {
      unsubscribe();
      manager.destroy();
    };
  }, []);

  // Render children while loading (no blocking)
  if (!state || !managerRef.current) {
    return <>{children}</>;
  }

  return (
    <SignerContext.Provider value={{ manager: managerRef.current, state }}>
      {children}
    </SignerContext.Provider>
  );
}

/**
 * Hook to access the SignerManager instance and full state.
 * Throws if used outside SignerProvider.
 */
export function useSignerManager(): SignerContextValue {
  const ctx = useContext(SignerContext);
  if (!ctx) {
    throw new Error('useSignerManager must be used within SignerProvider');
  }
  return ctx;
}

/** Signing error types */
type SignError = SignerNotConnectedError | SigningFailedError;

/** Return type for the useSigner hook */
export interface UseSignerResult {
  /** All available accounts */
  accounts: readonly SignerAccount[];
  /** Currently selected account */
  selectedAccount: SignerAccount | null;
  /** Connection status */
  status: ConnectionStatus;
  /** Whether connected with at least one account */
  isConnected: boolean;
  /** Whether running inside a container (Triangle/iframe) */
  isInHost: boolean;
  /** Connect to a provider (auto-detect if no type specified) */
  connect: () => Promise<Result<SignerAccount[], PolkadotSignerError>>;
  /** Disconnect from current provider */
  disconnect: () => void;
  /** Select an account by address */
  selectAccount: (address: string) => Result<SignerAccount, PolkadotSignerError>;
  /** Get the PolkadotSigner for the selected account */
  getSigner: () => PolkadotSigner | null;
  /** Sign arbitrary bytes - returns Result with typed error */
  signRaw: (data: Uint8Array) => Promise<Result<Uint8Array, SignError>>;
}

/** Disconnected state returned when context is not available */
const DISCONNECTED_STATE: UseSignerResult = {
  accounts: [],
  selectedAccount: null,
  status: 'disconnected',
  isConnected: false,
  isInHost: false,
  connect: () => Promise.resolve({ ok: false, error: new SignerNotConnectedError() } as Result<SignerAccount[], PolkadotSignerError>),
  disconnect: () => { /* no-op when disconnected */ },
  selectAccount: () => ({ ok: false, error: new SignerNotConnectedError() } as Result<SignerAccount, PolkadotSignerError>),
  getSigner: () => null,
  signRaw: () => Promise.resolve({ ok: false, error: new SignerNotConnectedError() }),
};

/**
 * Primary hook for wallet connection.
 * Provides a simplified API over the SignerManager.
 */
export function useSigner(): UseSignerResult {
  const ctx = useContext(SignerContext);

  // Memoize the API object to prevent recreation on every render
  const api = useMemo((): UseSignerResult => {
    if (!ctx) {
      return DISCONNECTED_STATE;
    }

    const { manager, state } = ctx;

    return {
      accounts: state.accounts,
      selectedAccount: state.selectedAccount,
      status: state.status,
      isConnected: state.status === 'connected' && state.accounts.length > 0,
      isInHost: isInsideContainer(),
      connect: () => manager.connect(),
      disconnect: () => manager.disconnect(),
      selectAccount: (address: string) => manager.selectAccount(address),
      getSigner: () => manager.getSigner(),
      signRaw: async (data: Uint8Array): Promise<Result<Uint8Array, SignError>> => {
        const result = await manager.signRaw(data);
        if (result.ok) {
          return { ok: true, value: result.value };
        }
        // Convert to our error type
        return { ok: false, error: new SigningFailedError(result.error.message) };
      },
    };
  }, [ctx]);

  return api;
}
