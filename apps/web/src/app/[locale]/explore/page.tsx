/**
 * Explore page — Browse active story chains, campaigns, and recent signals.
 *
 * Two-column layout:
 * - Left: Filters sidebar (story chains + campaigns)
 * - Right: Signal feed (filterable by story or campaign)
 */

import type { ReactElement } from 'react';
import { chainService, signalService } from '@/lib/services';
import type { ChainId, CampaignId, CampaignPreview } from '@cocuyo/types';
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

  // Campaign-to-posts and chain-to-campaigns relationships require indexing.
  // Pass empty maps/arrays to avoid showing incorrect associations.
  // Campaigns are shown in the dedicated /campaigns page instead.
  const campaignPostsMap: Record<CampaignId, string[]> = {};
  const chainCampaignMap: Record<ChainId, CampaignPreview[]> = {};
  const orphanCampaigns: CampaignPreview[] = [];

  // Chain titles map - populated from featured chains
  // Note: PostPreview doesn't track chain membership, so we use chain data
  const chainTitles: Record<string, string> = {};
  for (const chain of featuredChains) {
    chainTitles[chain.id] = chain.title;
  }

  // Parse info popover content - split by double newlines for paragraphs
  const storiesInfoBody = t('storiesInfo.body')
    .split('\n\n')
    .map((paragraph: string, index: number) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  const postsInfoBody = t('postsInfo.body')
    .split('\n\n')
    .map((paragraph: string, index: number) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  const openCampaignsInfoBody = t('openCampaignsInfo.body')
    .split('\n\n')
    .map((paragraph: string, index: number) => (
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
              chainCampaignMap={chainCampaignMap}
              orphanCampaigns={orphanCampaigns}
              campaignPostsMap={campaignPostsMap}
              posts={[...recentPosts.items]}
              chainTitles={chainTitles}
              hasMore={recentPosts.hasMore}
              translations={{
                allPosts: t('allPosts'),
                storiesLabel: t('storiesLabel'),
                openCampaignsLabel: t('openCampaignsLabel'),
                recentPostsLabel: t('recentPosts'),
                storiesInfoTitle: t('storiesInfo.title'),
                postsInfoTitle: t('postsInfo.title'),
                openCampaignsInfoTitle: t('openCampaignsInfo.title'),
                noMatchingCampaignPosts: t('noMatchingCampaignPosts'),
              }}
              storiesInfoBody={storiesInfoBody}
              postsInfoBody={postsInfoBody}
              openCampaignsInfoBody={openCampaignsInfoBody}
            />
          </div>
        </section>

        {/* Mobile floating action button */}
        <IlluminateFAB />
      </main>
    </>
  );
}
