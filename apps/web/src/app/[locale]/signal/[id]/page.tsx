/**
 * Signal Detail Page
 *
 * Shows a single signal with full context, verification status,
 * corroboration details, and related story chains.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { signalService, chainService } from '@/lib/services';
import { SignalDetailView } from './SignalDetailView';
import { setRequestLocale } from 'next-intl/server';
import { validateSignalId } from '@/lib/utils/validators';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Generate static params for build.
 * Returns a placeholder route since we don't have pre-seeded data.
 * Real content will be fetched at runtime from Bulletin Chain.
 */
export function generateStaticParams(): { id: string }[] {
  // Return placeholder - actual data comes from Bulletin Chain at runtime
  return [{ id: '_' }];
}

/**
 * Empty state component shown when signal is not found.
 */
function SignalNotFound({ locale }: { locale: string }): ReactNode {
  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="border-b border-[var(--border-default)]">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <Link
            href={`/${locale}/explore`}
            className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to Explore</span>
          </Link>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-display text-[var(--fg-primary)] mb-4">
          Signal Not Found
        </h1>
        <p className="text-[var(--fg-secondary)] mb-8">
          This signal doesn&apos;t exist or hasn&apos;t been illuminated yet.
        </p>
        <Link
          href={`/${locale}/explore`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--bg-default)] font-medium hover:opacity-90 transition-opacity"
        >
          Explore Signals
        </Link>
      </div>
    </main>
  );
}

export default async function SignalPage({ params }: Props): Promise<ReactNode> {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const signalId = validateSignalId(id);
  if (signalId === null) {
    return <SignalNotFound locale={locale} />;
  }

  const signal = await signalService.getSignal(signalId, locale);

  if (signal === null) {
    return <SignalNotFound locale={locale} />;
  }

  // Get chain titles for display (locale-aware)
  const chainTitles: Record<string, string> = {};
  for (const chainId of signal.chainLinks) {
    const chain = await chainService.getChain(chainId, locale);
    if (chain !== null) {
      chainTitles[chainId] = chain.title;
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)]">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <Link
            href={`/${locale}/explore`}
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
