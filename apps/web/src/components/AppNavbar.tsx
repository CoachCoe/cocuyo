'use client';

/**
 * App-specific Navbar with wallet connection and Illuminate modal integration.
 * Auto-detects current path for active link highlighting.
 * Note: Theme is controlled by Triangle host, not by this app.
 */

import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Navbar } from '@cocuyo/ui';
import { ConnectButton } from './ConnectButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useIlluminate } from '@/hooks/useIlluminate';

export function AppNavbar(): ReactElement {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');
  const tActions = useTranslations('actions');
  const { openModal } = useIlluminate();

  // Build locale-prefixed nav links with translated labels
  const navLinks = [
    { href: `/${locale}/feed`, label: t('feed') },
    { href: `/${locale}/explore`, label: t('explore') },
    { href: `/${locale}/collectives`, label: t('collectives') },
    { href: `/${locale}/verify`, label: t('verify') },
    { href: `/${locale}/search`, label: t('search') },
    { href: `/${locale}/about`, label: t('about') },
  ];

  return (
    <Navbar
      currentPath={pathname}
      walletSlot={<ConnectButton />}
      actionsSlot={<LanguageSwitcher />}
      onIlluminate={() => openModal()}
      LinkComponent={Link}
      navLinks={navLinks}
      illuminateLabel={tActions('illuminate')}
      homeLabel={t('home')}
      homeHref={`/${locale}`}
    />
  );
}
