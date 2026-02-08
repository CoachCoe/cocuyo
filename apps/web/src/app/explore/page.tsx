/**
 * Explore page — Browse active story chains and recent signals.
 *
 * This is the primary navigation view for the network.
 * Users explore by topic, location, and chain status — not by profile or algorithm.
 */

import type { ReactElement } from 'react';
import { Footer } from '@cocuyo/ui';
import { chainService } from '@/lib/services';
import { signalService } from '@/lib/services';
import { getChainTitle, mockChains } from '@/lib/services/mock-data';
import { SignalsList } from './SignalsList';
import { ExploreView } from './ExploreView';
import { AppNavbar } from '@/components/AppNavbar';

/**
 * Format relative time for chain updates.
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return `${Math.floor(days / 7)}w ago`;
}

/**
 * Get status badge color.
 */
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

export default async function ExplorePage(): Promise<ReactElement> {
  // Fetch featured chains
  const featuredChains = await chainService.getFeaturedChains();

  // Fetch recent signals
  const recentSignals = await signalService.getRecentSignals({
    pagination: { limit: 5, offset: 0 },
  });

  // Collect all signals for the map view
  const allSignals = [...recentSignals.items];

  return (
    <>
      <AppNavbar currentPath="/explore" />

      <main className="pt-16">
        {/* Header */}
        <section className="py-12 border-b border-[var(--color-border-default)]">
          <div className="container-wide">
            <h1 className="text-3xl font-bold mb-4">Explore</h1>
            <p className="text-[var(--color-text-secondary)] max-w-2xl">
              Browse active story chains and recent signals from the network.
              Information spreads through corroboration, not algorithms.
            </p>
          </div>
        </section>

        <ExploreView signals={allSignals} chains={[...mockChains]}>
          {/* Active Story Chains */}
          <section className="py-12">
            <div className="container-wide">
              <h2 className="text-xl font-semibold mb-6">Active Story Chains</h2>

              <div className="grid gap-4">
                {featuredChains.map((chain) => (
                  <a
                    key={chain.id}
                    href={`/chain/${chain.id}`}
                    className="block p-6 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg hover:border-[var(--color-border-emphasis)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
                          {chain.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                          {chain.location != null && (
                            <>
                              <span>{chain.location}</span>
                              <span aria-hidden="true">&middot;</span>
                            </>
                          )}
                          <span>Updated {formatRelativeTime(chain.updatedAt)}</span>
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 text-xs rounded capitalize"
                        style={{
                          color: getStatusColor(chain.status),
                          border: `1px solid ${getStatusColor(chain.status)}`,
                        }}
                      >
                        {chain.status}
                      </span>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {chain.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 text-xs bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
                      <span>
                        <span className="text-[var(--color-text-primary)]">{chain.signalCount}</span> signals
                      </span>
                      <span>
                        <span className="text-[var(--color-corroborated)]">
                          {chain.totalCorroborations}
                        </span>{' '}
                        corroborations
                      </span>
                    </div>
                  </a>
                ))}
              </div>

              {featuredChains.length === 0 && (
                <p className="text-[var(--color-text-secondary)] text-center py-12">
                  No active chains yet. Be the first to illuminate.
                </p>
              )}
            </div>
          </section>

          {/* Recent Signals */}
          <section className="py-12 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-default)]">
            <div className="container-wide">
              <SignalsList
                signals={[...recentSignals.items]}
                chainTitles={Object.fromEntries(
                  recentSignals.items
                    .flatMap((s) => s.chainLinks)
                    .map((id) => [id, getChainTitle(id as string) ?? ''])
                )}
                hasMore={recentSignals.hasMore}
              />
            </div>
          </section>
        </ExploreView>
      </main>

      <Footer />
    </>
  );
}
