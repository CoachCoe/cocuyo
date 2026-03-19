'use client';

/**
 * App-specific Navbar with wallet connection and Illuminate modal integration.
 * Auto-detects current path for active link highlighting.
 */

import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@cocuyo/ui';
import { ConnectButton } from './ConnectButton';
import { ThemeToggle } from './ThemeToggle';
import { useIlluminate } from '@/hooks/useIlluminate';

export function AppNavbar(): ReactElement {
  const pathname = usePathname();
  const { openModal } = useIlluminate();

  return (
    <Navbar
      currentPath={pathname}
      walletSlot={<ConnectButton />}
      actionsSlot={<ThemeToggle />}
      onIlluminate={() => openModal()}
      LinkComponent={Link}
    />
  );
}
