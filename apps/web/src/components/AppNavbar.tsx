'use client';

/**
 * App-specific Navbar with wallet connection and Illuminate modal integration.
 */

import type { ReactElement } from 'react';
import Link from 'next/link';
import { Navbar } from '@cocuyo/ui';
import { ConnectButton } from './ConnectButton';
import { ThemeToggle } from './ThemeToggle';
import { useIlluminate } from '@/hooks/useIlluminate';

interface AppNavbarProps {
  currentPath?: string;
}

export function AppNavbar({ currentPath = '/' }: AppNavbarProps): ReactElement {
  const { openModal } = useIlluminate();

  return (
    <Navbar
      currentPath={currentPath}
      walletSlot={<ConnectButton />}
      actionsSlot={<ThemeToggle />}
      onIlluminate={() => openModal()}
      LinkComponent={Link}
    />
  );
}
