'use client';

/**
 * App-specific Navbar - minimal navigation.
 * Note: Theme is controlled by Triangle host, not by this app.
 */

import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Navbar } from '@cocuyo/ui';
import { ConnectButton } from './ConnectButton';
import { LanguageSwitcher } from './LanguageSwitcher';

export function AppNavbar(): ReactElement {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');

  // No nav links - About is accessible from landing page
  // Main content is accessed via the Illuminate CTA
  const navLinks: Array<{ href: string; label: string }> = [];

  return (
    <Navbar
      currentPath={pathname}
      walletSlot={<ConnectButton />}
      actionsSlot={<LanguageSwitcher />}
      LinkComponent={Link}
      navLinks={navLinks}
      homeLabel={t('home')}
      homeHref={`/${locale}`}
      brandName={t('brandName')}
    />
  );
}
