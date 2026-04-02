/**
 * Signal Detail Page
 *
 * Shows a single signal with full context, verification status,
 * corroboration details, and related story chains.
 */

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSignalById, getAllSignalIds, getChainTitle, type Locale } from '@/lib/services/mock-data';
import { SignalDetailView } from './SignalDetailView';
import { routing } from '../../../../../i18n/routing';
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export function generateStaticParams(): Array<{ locale: string; id: string }> {
  return routing.locales.flatMap((locale) =>
    getAllSignalIds().map((id) => ({ locale, id }))
  );
}

export default async function SignalPage({ params }: Props): Promise<ReactNode> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const signal = getSignalById(id, locale as Locale);

  if (signal === undefined) {
    notFound();
  }

  // Get chain titles for display (locale-aware)
  const chainTitles: Record<string, string> = {};
  for (const chainId of signal.chainLinks) {
    const title = getChainTitle(chainId, locale as Locale);
    if (title !== undefined) {
      chainTitles[chainId] = title;
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)]">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to Explore</span>
          </Link>
        </div>
      </div>

      {/* Signal Content */}
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <SignalDetailView signal={signal} chainTitles={chainTitles} />
      </div>
    </main>
  );
}
