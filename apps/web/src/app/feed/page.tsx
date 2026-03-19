/**
 * Feed Page
 *
 * Personalized feed with tabs for Following (topics user follows)
 * and Discover (trending/new signals).
 */

import type { ReactNode } from 'react';
import { mockSignals, mockChains } from '@/lib/services/mock-data';
import { FeedView } from './FeedView';

export default function FeedPage(): ReactNode {
  // Get chain titles for display
  const chainTitles: Record<string, string> = {};
  for (const chain of mockChains) {
    chainTitles[chain.id] = chain.title;
  }

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <FeedView signals={mockSignals} chainTitles={chainTitles} />
      </div>
    </main>
  );
}
