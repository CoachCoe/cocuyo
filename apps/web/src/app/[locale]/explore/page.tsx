/**
 * Explore page — Browse active story chains and recent signals.
 *
 * This is the primary navigation view for the network.
 * Users explore by topic, location, and chain status — not by profile or algorithm.
 */

import type { ReactElement } from 'react';
import { chainService } from '@/lib/services';
import { signalService } from '@/lib/services';
import { getChainTitle } from '@/lib/services/mock-data';
import { SignalsList } from './SignalsList';
import { ExploreView } from './ExploreView';
import type { MapMarker } from '@/components/map';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface ExplorePageProps {
  params: Promise<{ locale: string }>;
}

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
      return 'var(--fg-success)';
    case 'established':
      return 'var(--fg-accent)';
    case 'emerging':
      return 'var(--fg-secondary)';
    case 'contested':
      return 'var(--fg-error)';
    default:
      return 'var(--fg-tertiary)';
  }
}

export default async function ExplorePage({ params }: ExplorePageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('explore');

  // Fetch featured chains
  const featuredChains = await chainService.getFeaturedChains();

  // Fetch recent signals
  const recentSignals = await signalService.getRecentSignals({
    pagination: { limit: 20, offset: 0 },
  });

  // Convert signals to map markers
  const markers: MapMarker[] = recentSignals.items
    .filter((signal) => signal.context.location != null)
    .map((signal) => {
      const location = signal.context.location;
      const totalCorroborations = signal.corroborations.witnessCount +
        signal.corroborations.evidenceCount +
        signal.corroborations.expertiseCount;
      return {
        id: signal.id,
        lat: location?.latitude ?? 0,
        lon: location?.longitude ?? 0,
        label: signal.context.locationName,
        status: totalCorroborations >= 3
          ? 'corroborated' as const
          : signal.corroborations.challengeCount > 0
            ? 'challenged' as const
            : 'pending' as const,
      };
    });

  return (
    <>
      <main>
        {/* Header */}
        <section className="py-12 border-b border-DEFAULT">
          <div className="container-wide">
            <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
            <p className="text-secondary max-w-2xl">
              {t('description')}
            </p>
          </div>
        </section>

        <ExploreView markers={markers}>
          {/* Active Story Chains */}
          <section className="py-12">
            <div className="container-wide">
              <h2 className="text-xl font-semibold mb-6">{t('activeChains')}</h2>

              <div className="grid gap-4">
                {featuredChains.map((chain, index) => (
                  <a
                    key={chain.id}
                    href={`/chain/${chain.id}`}
                    className={`block p-6 bg-surface-nested border border-DEFAULT rounded-container hover:border-[var(--color-firefly-gold)]/40 hover:shadow-[0_4px_20px_rgba(232,185,49,0.08)] hover:-translate-y-0.5 transition-all duration-200 ${index < 10 ? 'animate-stagger-item' : ''}`}
                    style={{ '--stagger-index': index } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-1">
                          {chain.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-tertiary">
                          {chain.location != null && (
                            <>
                              <span>{chain.location}</span>
                              <span aria-hidden="true">&middot;</span>
                            </>
                          )}
                          <span>{t('updated')} {formatRelativeTime(chain.updatedAt)}</span>
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 text-xs rounded-small capitalize"
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
                          className="px-2 py-0.5 text-xs bg-surface-muted text-secondary rounded-small"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-secondary">
                      <span>
                        <span className="text-primary">{chain.signalCount}</span> {t('signals')}
                      </span>
                      <span>
                        <span className="text-corroborated">
                          {chain.totalCorroborations}
                        </span>{' '}
                        {t('corroborations')}
                      </span>
                    </div>
                  </a>
                ))}
              </div>

              {featuredChains.length === 0 && (
                <p className="text-secondary text-center py-12">
                  {t('noChains')}
                </p>
              )}
            </div>
          </section>

          {/* Recent Signals */}
          <section className="py-12 bg-surface-container border-t border-DEFAULT">
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
    </>
  );
}
