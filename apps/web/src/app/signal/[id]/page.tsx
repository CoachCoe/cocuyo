/**
 * Signal Detail Page
 *
 * Shows a single signal with full context, verification status,
 * corroboration details, and related story chains.
 */

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSignalById, getAllSignalIds, getChainTitle } from '@/lib/services/mock-data';
import { SignalDetailView } from './SignalDetailView';

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): Array<{ id: string }> {
  return getAllSignalIds().map((id) => ({ id }));
}

export default async function SignalPage({ params }: Props): Promise<ReactNode> {
  const { id } = await params;
  const signal = getSignalById(id);

  if (signal === undefined) {
    notFound();
  }

  // Get chain titles for display
  const chainTitles: Record<string, string> = {};
  for (const chainId of signal.chainLinks) {
    const title = getChainTitle(chainId);
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
