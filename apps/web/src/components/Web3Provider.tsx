'use client';

/**
 * Web3 Provider component.
 * Initializes Web3Modal on the client side.
 */

import type { ReactNode } from 'react';

// Initialize web3modal as a side effect
import '@/lib/web3modal';

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps): ReactNode {
  return <>{children}</>;
}
