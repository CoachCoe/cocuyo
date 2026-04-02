'use client';

/**
 * Triangle Account Hook
 *
 * Provides access to the user's account when running in Triangle host.
 * Based on get-local's implementation pattern.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { encodeAddress } from '@polkadot/util-crypto';
import {
  getAccountsProvider,
  isInContainer,
  initHostDetection,
} from '../lib/host/detect';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface TriangleAccountState {
  /** The raw account object from the provider */
  account: { publicKey: Uint8Array; name?: string } | null;
  /** SS58-encoded address (generic substrate format, prefix 42) */
  address: string | null;
  /** Account name if available */
  name: string | null;
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Whether the user is connected with an account */
  isConnected: boolean;
  /** Whether the app is running inside Triangle host */
  isInHost: boolean;
}

const INITIAL_STATE: TriangleAccountState = {
  account: null,
  address: null,
  name: null,
  connectionStatus: 'disconnected',
  isConnected: false,
  isInHost: false,
};

/**
 * Hook to access the Triangle account state.
 */
export function useTriangleAccount(): TriangleAccountState {
  const [state, setState] = useState<TriangleAccountState>(INITIAL_STATE);
  const mountedRef = useRef(true);

  const fetchAccounts = useCallback(async () => {
    const accountsProvider = getAccountsProvider();
    if (!accountsProvider) return;

    try {
      // Fetch accounts with timeout
      const result = await Promise.race([
        accountsProvider.getNonProductAccounts(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Account fetch timeout')), 10000)
        ),
      ]);

      // The result is a tagged union - check for success
      if ('value' in result && Array.isArray(result.value) && result.value.length > 0) {
        const firstAccount = result.value[0];
        if (firstAccount == null) return;

        const address = encodeAddress(firstAccount.publicKey, 42); // Generic substrate prefix
        const accountName = firstAccount.name;

        // Construct account object with proper optional property handling
        const account: { publicKey: Uint8Array; name?: string } = {
          publicKey: firstAccount.publicKey,
        };
        if (accountName != null) {
          account.name = accountName;
        }

        if (mountedRef.current) {
          setState({
            account,
            address,
            name: accountName ?? null,
            connectionStatus: 'connected',
            isConnected: true,
            isInHost: true,
          });
        }
      } else {
        // No accounts available
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            connectionStatus: 'disconnected',
            isConnected: false,
          }));
        }
      }
    } catch {
      // Error fetching accounts
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          connectionStatus: 'disconnected',
          isConnected: false,
        }));
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Check if we're in a container
    const inContainer = isInContainer();

    if (!inContainer) {
      setState({
        ...INITIAL_STATE,
        connectionStatus: 'disconnected',
        isInHost: false,
      });
      return;
    }

    // We're in a container, start connecting
    setState(prev => ({
      ...prev,
      connectionStatus: 'connecting',
      isInHost: true,
    }));

    // Initialize host detection
    void initHostDetection().then((success) => {
      if (!mountedRef.current) return;

      if (!success) {
        setState(prev => ({
          ...prev,
          connectionStatus: 'disconnected',
          isConnected: false,
        }));
        return;
      }

      // Fetch initial accounts
      void fetchAccounts();

      // Subscribe to connection status changes
      const accountsProvider = getAccountsProvider();
      if (accountsProvider) {
        const subscription = accountsProvider.subscribeAccountConnectionStatus((status) => {
          if (!mountedRef.current) return;

          // Check if connected and refetch accounts
          // SDK returns union type with object variants; using 'in' checks for runtime safety
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (typeof status === 'object' && status !== null && 'Connected' in status) {
            void fetchAccounts();
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          } else if (typeof status === 'object' && status !== null && 'Connecting' in status) {
            setState(prev => ({
              ...prev,
              connectionStatus: 'connecting',
            }));
          } else {
            setState(prev => ({
              ...prev,
              account: null,
              address: null,
              name: null,
              connectionStatus: 'disconnected',
              isConnected: false,
            }));
          }
        });

        return () => {
          mountedRef.current = false;
          subscription.unsubscribe();
        };
      }
      return undefined;
    });

    return () => {
      mountedRef.current = false;
    };
  }, [fetchAccounts]);

  return state;
}
