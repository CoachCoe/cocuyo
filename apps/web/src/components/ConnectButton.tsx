'use client';

/**
 * Connect Button component.
 *
 * Shows connection status when running in Triangle host.
 * Shows guidance message when running standalone.
 */

import type { ReactElement } from 'react';
import { useTriangleAccount } from '@/hooks/useTriangleAccount';

export function ConnectButton(): ReactElement {
  const { address, name, connectionStatus, isConnected, isInHost } = useTriangleAccount();

  // Not in Triangle host - show guidance
  if (!isInHost) {
    return (
      <span className="px-4 py-2 text-sm text-secondary">
        Open in Triangle to connect
      </span>
    );
  }

  // In host but not connected
  if (!isConnected) {
    return (
      <span className="px-4 py-2 text-sm text-secondary">
        {connectionStatus === 'connecting' ? 'Connecting...' : 'Sign in to Triangle'}
      </span>
    );
  }

  // Connected - show truncated address
  const displayName = name ?? (address !== null && address.length > 0
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Connected');

  return (
    <div className="flex items-center gap-3">
      <span className="px-4 py-2 text-sm font-medium border border-emphasis rounded-nested text-primary">
        {displayName}
      </span>
    </div>
  );
}
