/**
 * Explore page — Browse active story chains and recent signals.
 *
 * This is the primary navigation view for the network.
 * Users explore by topic, location, and chain status — not by profile or algorithm.
 */

import type { ReactElement } from 'react';
import { chainService } from '@/lib/services';
import { signalService } from '@/lib/services';
import { getChainTitle, type Locale } from '@/lib/services/mock-data';
import { SignalsList } from './SignalsList';
import { ExploreView } from './ExploreView';
// Map view disabled for now - host API doesn't support it yet
// import type { MapMarker } from '@/components/map';
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

  // Map view disabled for now - host API doesn't support it yet

  return (
    <>
      <main className="min-h-screen">
        {/* Header */}
        <section className="pt-12 pb-6">
          <div className="container-narrow">
            <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
            <p className="text-secondary text-sm">
              {t('description')}
            </p>
          </div>
        </section>

        <ExploreView>
          {/* Stories - Clean list */}
          {featuredChains.length > 0 && (
            <section className="pb-10">
              <div className="container-narrow">
                <h2 className="text-xs font-medium text-tertiary uppercase tracking-wider mb-4">
                  {t('stories')}
                </h2>

                <div className="space-y-1">
                  {featuredChains.map((chain) => (
                    <a
                      key={chain.id}
                      href={`/chain/${chain.id}`}
                      className="flex items-center justify-between py-3 px-4 -mx-4 rounded-small hover:bg-surface-nested transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: getStatusColor(chain.status) }}
                          title={chain.status}
                        />
                        <span className="font-medium text-primary truncate group-hover:text-[var(--fg-accent)] transition-colors">
                          {chain.title}
                        </span>
                        {chain.location != null && (
                          <span className="text-xs text-tertiary hidden sm:inline">
                            {chain.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-tertiary shrink-0 ml-4">
                        <span><span className="text-secondary">{chain.signalCount}</span> {t('signals')}</span>
                        <span className="hidden sm:inline">{formatRelativeTime(chain.updatedAt)}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}

          {featuredChains.length === 0 && (
            <section className="pb-10">
              <div className="container-narrow">
                <p className="text-secondary text-center py-8 text-sm">
                  {t('noStories')}
                </p>
              </div>
            </section>
          )}

          {/* Divider */}
          <div className="container-narrow">
            <hr className="border-DEFAULT" />
          </div>

          {/* Recent Signals */}
          <section className="py-10">
            <div className="container-narrow">
              <SignalsList
                signals={[...recentSignals.items]}
                chainTitles={Object.fromEntries(
                  recentSignals.items
                    .flatMap((s) => s.chainLinks)
                    .map((id) => [id, getChainTitle(id as string, locale as Locale) ?? ''])
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
