/**
 * Feed Page
 *
 * Personalized feed with tabs for Following (topics user follows)
 * and Discover (trending/new signals).
 */

import type { ReactNode } from 'react';
import { getSignals, getChains, type Locale } from '@/lib/services/mock-data';
import { FeedView } from './FeedView';
import { setRequestLocale } from 'next-intl/server';

interface FeedPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FeedPage({ params }: FeedPageProps): Promise<ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get chain titles for display
  const chains = getChains(locale as Locale);
  const chainTitles: Record<string, string> = {};
  for (const chain of chains) {
    chainTitles[chain.id] = chain.title;
  }

  const signals = getSignals(locale as Locale);

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <FeedView signals={signals} chainTitles={chainTitles} />
      </div>
    </main>
  );
}
