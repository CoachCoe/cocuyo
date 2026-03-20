'use client';

/**
 * App-specific Navbar with wallet connection and Illuminate modal integration.
 * Auto-detects current path for active link highlighting.
 * Note: Theme is controlled by Triangle host, not by this app.
 */

import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@cocuyo/ui';
import { ConnectButton } from './ConnectButton';
import { useIlluminate } from '@/hooks/useIlluminate';

export function AppNavbar(): ReactElement {
  const pathname = usePathname();
  const { openModal } = useIlluminate();

  return (
    <Navbar
      currentPath={pathname}
      walletSlot={<ConnectButton />}
      onIlluminate={() => openModal()}
      LinkComponent={Link}
    />
  );
}
