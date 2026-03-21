/**
 * Story Chain detail page — View a complete story chain with all signals.
 *
 * This page shows:
 * - Chain title, description, and status
 * - Verification trail summary
 * - All signals in the chain, in chronological order
 * - Corroboration details for each signal
 * - Option to add a signal to the chain
 */

import type { ReactElement } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { chainService } from '@/lib/services';
import { mockSignals, mockChains } from '@/lib/services/mock-data';
import { ChainSignalList } from './ChainSignalList';
import { AddSignalButton } from './AddSignalButton';
import type { ChainId } from '@cocuyo/types';
import { createChainId } from '@cocuyo/types';
import { routing } from '../../../../../i18n/routing';
import { setRequestLocale } from 'next-intl/server';

/**
 * Generate static params for all known chains across all locales.
 */
export function generateStaticParams(): Array<{ locale: string; id: string }> {
  return routing.locales.flatMap((locale) =>
    mockChains.map((chain) => ({
      locale,
      id: String(chain.id),
    }))
  );
}

interface ChainPageProps {
  params: Promise<{ locale: string; id: string }>;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'var(--color-corroborated)';
    case 'established':
      return 'var(--color-accent)';
    case 'emerging':
      return 'var(--color-text-secondary)';
    case 'contested':
      return 'var(--color-challenged)';
    default:
      return 'var(--color-text-tertiary)';
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ChainPage({ params }: ChainPageProps): Promise<ReactElement> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const chain = await chainService.getChain(id as ChainId);

  if (chain == null) {
    notFound();
  }

  // Get signals for this chain
  const signals = mockSignals.filter((s) =>
    s.chainLinks.some((link) => link === id)
  );

  const statusColor = getStatusColor(chain.status);

  return (
    <>
      <main>
        {/* Header */}
        <section className="py-12 border-b border-[var(--color-border-default)]">
          <div className="container-wide">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
              <Link
                href="/explore"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Explore
              </Link>
              <span className="mx-2 text-[var(--color-text-tertiary)]">/</span>
              <span className="text-[var(--color-text-primary)]">Story Chain</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                {/* Status badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 text-sm rounded-full capitalize"
                    style={{
                      color: statusColor,
                      border: `1px solid ${statusColor}`,
                    }}
                  >
                    {chain.status}
                  </span>
                  {chain.location != null && (
                    <span className="text-sm text-[var(--color-text-tertiary)]">
                      {chain.location}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">{chain.title}</h1>

                {/* Description */}
                <p className="text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
                  {chain.description}
                </p>

                {/* Topics */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {chain.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats card */}
              <div className="lg:w-72 p-6 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg">
                <h3 className="font-semibold mb-4">Verification Summary</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">Signals</dt>
                    <dd className="text-[var(--color-text-primary)] font-medium">{chain.stats.signalCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">Corroborations</dt>
                    <dd className="text-[var(--color-corroborated)] font-medium">
                      {chain.stats.totalCorroborations}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">Challenges</dt>
                    <dd
                      className="font-medium"
                      style={{
                        color:
                          chain.stats.totalChallenges > 0
                            ? 'var(--color-challenged)'
                            : 'var(--color-text-secondary)',
                      }}
                    >
                      {chain.stats.totalChallenges}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">Contributors</dt>
                    <dd className="text-[var(--color-text-primary)] font-medium">{chain.stats.contributorCount}</dd>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[var(--color-border-subtle)]">
                    <dt className="text-[var(--color-text-secondary)]">Weight</dt>
                    <dd className="text-[var(--color-accent)] font-medium">
                      {chain.stats.totalWeight.toFixed(1)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 pt-4 border-t border-[var(--color-border-subtle)]">
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-1">
                    Chain started
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {formatDate(chain.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add to Chain CTA */}
        <section className="py-6 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-default)]">
          <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[var(--color-text-secondary)]">
              Have information to add to this chain?
            </p>
            <AddSignalButton chainId={createChainId(id)} />
          </div>
        </section>

        {/* Signals Timeline */}
        <section className="py-12">
          <div className="container-wide">
            <h2 className="text-xl font-semibold mb-8">
              Verification Trail ({signals.length} signals)
            </h2>

            <ChainSignalList signals={signals} />

            {signals.length === 0 && (
              <div className="text-center py-12 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border-default)]">
                <p className="text-[var(--color-text-secondary)]">
                  No signals in this chain yet.
                </p>
                <AddSignalButton chainId={createChainId(id)} className="mt-4">
                  Be the First to Illuminate
                </AddSignalButton>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
