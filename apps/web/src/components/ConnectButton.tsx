'use client';

/**
 * Wallet Connect Button component.
 *
 * Uses Web3Modal for wallet connection.
 * Styled to match the Firefly Network design system.
 */

import type { ReactElement } from 'react';
import { useWeb3Modal, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react';

export function ConnectButton(): ReactElement {
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useWeb3ModalAccount();

  const handleConnect = (): void => {
    void open();
  };

  const handleDisconnect = (): void => {
    disconnect();
  };

  if (isConnected && address != null) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleDisconnect}
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Disconnect
        </button>
        <button
          onClick={handleConnect}
          className="px-4 py-2 text-sm font-medium border border-[var(--color-border-emphasis)] rounded-md text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 text-sm font-medium border border-[var(--color-text-primary)] rounded-md text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] transition-colors"
    >
      Connect Wallet
    </button>
  );
}
