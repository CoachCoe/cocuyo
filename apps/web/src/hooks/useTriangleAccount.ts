'use client';

/**
 * Triangle Account Hook
 *
 * Provides access to the user's account when running in Triangle host.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAccountsProvider,
  isHosted,
  initHostDetection,
  type AccountConnectionStatus,
} from '../lib/host/detect';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'unavailable';

export interface TriangleAccountState {
  /** The raw account object from the provider */
  account: { publicKey: Uint8Array; name?: string } | null;
  /** SS58-encoded address */
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

/**
 * Map provider status to connection status.
 */
function mapStatus(status: AccountConnectionStatus | null): ConnectionStatus {
  if (!status) return 'unavailable';

  // The status is a tagged union, check the tag
  if (typeof status === 'object') {
    if ('Connected' in status) return 'connected';
    if ('Connecting' in status) return 'connecting';
    if ('Disconnected' in status) return 'disconnected';
  }

  return 'unavailable';
}

/**
 * Hook to access the Triangle account state.
 *
 * @returns Account state including address, connection status, and host detection
 */
export function useTriangleAccount(): TriangleAccountState {
  const [state, setState] = useState<TriangleAccountState>({
    account: null,
    address: null,
    name: null,
    connectionStatus: 'disconnected',
    isConnected: false,
    isInHost: false,
  });

  const updateState = useCallback((status: AccountConnectionStatus | null) => {
    const inHost = isHosted();
    const connectionStatus = mapStatus(status);

    // For now, we don't have a way to get the current account from status
    // This would need to be fetched separately using getProductAccount
    setState({
      account: null,
      address: null,
      name: null,
      connectionStatus,
      isConnected: connectionStatus === 'connected',
      isInHost: inHost,
    });
  }, []);

  useEffect(() => {
    // Initialize host detection on mount
    initHostDetection();

    const inHost = isHosted();

    if (!inHost) {
      setState({
        account: null,
        address: null,
        name: null,
        connectionStatus: 'unavailable',
        isConnected: false,
        isInHost: false,
      });
      return;
    }

    const accountsProvider = getAccountsProvider();
    if (!accountsProvider) {
      setState(prev => ({ ...prev, isInHost: true, connectionStatus: 'unavailable' }));
      return;
    }

    // Subscribe to account connection status changes
    const subscription = accountsProvider.subscribeAccountConnectionStatus((status) => {
      updateState(status);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateState]);

  return state;
}
