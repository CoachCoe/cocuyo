/**
 * Explore page — Browse active story chains, bounties, and recent signals.
 *
 * Two-column layout:
 * - Left: Filters sidebar (story chains + bounties)
 * - Right: Signal feed (filterable by story or bounty)
 */

import type { ReactElement } from 'react';
import { chainService, signalService } from '@/lib/services';
import type { ChainId, BountyId, BountyPreview } from '@cocuyo/types';
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

  // Fetch featured chains (with locale for translated content)
  const featuredChains = await chainService.getFeaturedChains(locale);

  // Fetch recent posts with full data for display (with locale for translated content)
  const recentPosts = await signalService.getRecentPostsForDisplay({
    pagination: { limit: 20, offset: 0 },
    locale,
  });

  // Bounty-to-posts and chain-to-bounties relationships require indexing.
  // Pass empty maps/arrays to avoid showing incorrect associations.
  // Bounties are shown in the dedicated /bounties page instead.
  const bountyPostsMap: Record<BountyId, string[]> = {};
  const chainBountyMap: Record<ChainId, BountyPreview[]> = {};
  const orphanBounties: BountyPreview[] = [];

  // Chain titles map - populated from featured chains
  // Note: PostPreview doesn't track chain membership, so we use chain data
  const chainTitles: Record<string, string> = {};
  for (const chain of featuredChains) {
    chainTitles[chain.id] = chain.title;
  }

  // Parse info popover content - split by double newlines for paragraphs
  const storiesInfoBody = t('storiesInfo.body')
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  const postsInfoBody = t('postsInfo.body')
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  const openBountiesInfoBody = t('openBountiesInfo.body')
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
              chainBountyMap={chainBountyMap}
              orphanBounties={orphanBounties}
              bountyPostsMap={bountyPostsMap}
              posts={[...recentPosts.items]}
              chainTitles={chainTitles}
              hasMore={recentPosts.hasMore}
              translations={{
                allPosts: t('allPosts'),
                storiesLabel: t('storiesLabel'),
                openBountiesLabel: t('openBountiesLabel'),
                recentPostsLabel: t('recentPosts'),
                storiesInfoTitle: t('storiesInfo.title'),
                postsInfoTitle: t('postsInfo.title'),
                openBountiesInfoTitle: t('openBountiesInfo.title'),
                noMatchingBountyPosts: t('noMatchingBountyPosts'),
              }}
              storiesInfoBody={storiesInfoBody}
              postsInfoBody={postsInfoBody}
              openBountiesInfoBody={openBountiesInfoBody}
            />
          </div>
        </section>

        {/* Mobile floating action button */}
        <IlluminateFAB />
      </main>
    </>
  );
}
