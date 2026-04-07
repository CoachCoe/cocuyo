'use client';

/**
 * Connection Status Indicator
 *
 * Shows wallet connection status when running in Triangle host.
 * No connect button needed - Triangle manages the connection.
 *
 * States:
 * - Connected: Green dot + truncated address
 * - Connecting: Pulsing gray dot + "..."
 * - Disconnected: Red dot (or hidden)
 */

import type { ReactNode } from 'react';
import { useSigner } from '@/lib/context/SignerContext';
import { truncateAddress } from '@/lib/utils/address';

export function ConnectButton(): ReactNode {
  const { isInHost, isConnected, status, selectedAccount } = useSigner();

  // Not in Triangle host - show nothing
  if (!isInHost) {
    return null;
  }

  // Connected - show green dot + address/name
  if (isConnected && selectedAccount) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full bg-[var(--color-corroborated)]"
          title="Connected"
        />
        <span className="text-sm text-[var(--fg-secondary)]">
          {selectedAccount.name ?? truncateAddress(selectedAccount.address, 6, 4)}
        </span>
      </div>
    );
  }

  // Connecting - show pulsing dot
  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full bg-[var(--fg-tertiary)] animate-pulse"
          title="Connecting..."
        />
        <span className="text-sm text-[var(--fg-tertiary)]">...</span>
      </div>
    );
  }

  // Disconnected - show red dot
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-2 rounded-full bg-[var(--color-challenged)]/60"
        title="Disconnected"
      />
    </div>
  );
}
