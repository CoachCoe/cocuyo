/**
 * Explore page — Browse active story chains and recent signals.
 *
 * Two-column layout:
 * - Left: Story chain filters (sidebar)
 * - Right: Signal feed (filterable by story)
 */

import type { ReactElement } from 'react';
import { chainService } from '@/lib/services';
import { signalService } from '@/lib/services';
import { getChainTitle, type Locale } from '@/lib/services/mock-data';
import { ExploreView } from './ExploreView';
import { ExploreHeader } from './ExploreHeader';
import { IlluminateFAB } from './IlluminateFAB';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface ExplorePageProps {
  params: Promise<{ locale: string }>;
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

  // Build chain titles map
  const chainTitles = Object.fromEntries(
    recentSignals.items
      .flatMap((s) => s.chainLinks)
      .map((id) => [id, getChainTitle(id as string, locale as Locale) ?? ''])
  );

  // Parse info popover content - split by double newlines for paragraphs
  const storiesInfoBody = t('storiesInfo.body')
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  const signalsInfoBody = t('signalsInfo.body')
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  return (
    <>
      <main className="min-h-screen">
        {/* Header with Illuminate button */}
        <ExploreHeader
          title={t('title')}
          description={t('description')}
          illuminateLabel={t('illuminateNew')}
        />

        {/* Two-column layout */}
        <section className="py-6">
          <div className="container-wide">
            <ExploreView
              chains={featuredChains}
              signals={[...recentSignals.items]}
              chainTitles={chainTitles}
              hasMore={recentSignals.hasMore}
              translations={{
                allSignals: t('allSignals'),
                storyChainsLabel: t('stories'),
                recentSignalsLabel: t('recentSignals'),
                storiesInfoTitle: t('storiesInfo.title'),
                signalsInfoTitle: t('signalsInfo.title'),
              }}
              storiesInfoBody={storiesInfoBody}
              signalsInfoBody={signalsInfoBody}
            />
          </div>
        </section>

        {/* Mobile floating action button */}
        <IlluminateFAB />
      </main>
    </>
  );
}
