'use client';

/**
 * useBulletinStatus — Hook for Bulletin Chain connection status.
 *
 * Provides connection state to UI components for showing feedback
 * when the chain is unavailable.
 */

import { useEffect, useState } from 'react';
import { getBulletinClient } from '../lib/chain/client';

export type BulletinConnectionStatus = 'connecting' | 'connected' | 'error';

export interface UseBulletinStatusResult {
  /** Current connection status */
  status: BulletinConnectionStatus;
  /** Whether the client is connected and ready */
  isConnected: boolean;
  /** Error message if connection failed */
  error: string | null;
  /** Retry connection */
  retry: () => void;
}

/**
 * Hook to monitor Bulletin Chain connection status.
 *
 * @example
 * const { isConnected, status, error } = useBulletinStatus();
 * if (!isConnected) {
 *   return <ChainUnavailableBanner error={error} />;
 * }
 */
export function useBulletinStatus(): UseBulletinStatusResult {
  const [status, setStatus] = useState<BulletinConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async (): Promise<void> => {
    setStatus('connecting');
    setError(null);

    try {
      // Attempt to get the client - this will connect if not already connected
      await getBulletinClient();
      setStatus('connected');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to connect to Bulletin Chain');
    }
  };

  useEffect(() => {
    void checkConnection();
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    error,
    retry: () => void checkConnection(),
  };
}
