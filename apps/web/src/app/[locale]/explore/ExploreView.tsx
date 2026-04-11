'use client';

/**
 * ExploreView — Main client component for the explore page.
 *
 * Manages filter state and renders two-column layout:
 * - Left: Filters sidebar (story chains + campaigns)
 * - Right: Signal feed (filtered by chain, campaign, or all)
 */

import { useState, useMemo, useCallback, type ReactElement, type ReactNode } from 'react';
import type { ChainPreview, ChainId, Post, CampaignPreview, CampaignId } from '@cocuyo/types';
import { useIlluminate } from '@/hooks/useIlluminate';
import { ExploreFilters, type ExploreFilterType } from './ExploreFilters';
import { FeedPostsList, type ViewMode } from './FeedPostsList';

export interface ExploreViewProps {
  /** Available story chains */
  chains: readonly ChainPreview[];
  /** Mapping of chain ID to campaign (for chains with funding) */
  chainCampaignMap: Record<string, CampaignPreview[]>;
  /** Orphan campaigns - open questions without stories yet */
  orphanCampaigns: readonly CampaignPreview[];
  /** Mapping of campaign ID to contributing post IDs */
  campaignPostsMap: Record<string, readonly string[]>;
  /** All posts */
  posts: Post[];
  /** Chain titles map for signal cards */
  chainTitles: Record<string, string>;
  /** Whether there are more signals to load */
  hasMore: boolean;
  /** Translation strings */
  translations: {
    allPosts: string;
    storiesLabel: string;
    openCampaignsLabel: string;
    recentPostsLabel: string;
    storiesInfoTitle: string;
    postsInfoTitle: string;
    openCampaignsInfoTitle: string;
    noMatchingCampaignPosts: string;
  };
  /** Info popover content for stories */
  storiesInfoBody?: ReactNode | undefined;
  /** Info popover content for posts */
  postsInfoBody?: ReactNode | undefined;
  /** Info popover content for open campaigns */
  openCampaignsInfoBody?: ReactNode | undefined;
}

export function ExploreView({
  chains,
  chainCampaignMap,
  orphanCampaigns,
  campaignPostsMap,
  posts,
  chainTitles,
  hasMore,
  translations,
  storiesInfoBody,
  postsInfoBody,
  openCampaignsInfoBody,
}: ExploreViewProps): ReactElement {
  const [filterType, setFilterType] = useState<ExploreFilterType>(null);
  const [filterId, setFilterId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { openModal } = useIlluminate();

  // Handle filter change
  const handleFilterChange = useCallback((type: ExploreFilterType, id: string | null) => {
    setFilterType(type);
    setFilterId(id);
  }, []);

  // Handle illuminate button click on a story chain
  const handleIlluminateChain = useCallback(
    (chainId: ChainId) => {
      openModal({ chainId });
    },
    [openModal]
  );

  // Handle illuminate button click on a campaign
  const handleIlluminateCampaign = useCallback(
    (campaignId: CampaignId) => {
      openModal({ campaignId });
    },
    [openModal]
  );

  // Get the active campaign (if filtering by campaign)
  const activeCampaign = useMemo(() => {
    if (filterType !== 'campaign' || filterId === null) return null;
    return orphanCampaigns.find((c) => c.id === filterId) ?? null;
  }, [filterType, filterId, orphanCampaigns]);

  // Filter posts based on active filter
  const filteredPosts = useMemo(() => {
    switch (filterType) {
      case null:
        return posts;
      case 'chain':
        return posts.filter((post) => post.chainLinks.includes(filterId as ChainId));
      case 'campaign': {
        if (filterId === null) return posts;
        const contributingPostIds = campaignPostsMap[filterId] ?? [];
        return posts.filter((post) => contributingPostIds.includes(post.id));
      }
    }
  }, [posts, filterType, filterId, campaignPostsMap]);

  // Determine the posts section title based on filter
  const postsSectionTitle = useMemo(() => {
    switch (filterType) {
      case null:
        return translations.recentPostsLabel;
      case 'chain': {
        const chain = chains.find((c) => c.id === filterId);
        return chain?.title ?? translations.recentPostsLabel;
      }
      case 'campaign':
        return activeCampaign?.title ?? translations.recentPostsLabel;
    }
  }, [filterType, filterId, chains, activeCampaign, translations.recentPostsLabel]);

  // Determine empty state message
  const emptyStateMessage = useMemo(() => {
    if (filterType === 'campaign') {
      return translations.noMatchingCampaignPosts;
    }
    return undefined; // Use default
  }, [filterType, translations.noMatchingCampaignPosts]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar - Filters */}
      <aside className="md:w-72 lg:w-80 shrink-0">
        <div className="md:sticky md:top-24">
          <ExploreFilters
            chains={chains}
            chainCampaignMap={chainCampaignMap}
            orphanCampaigns={orphanCampaigns}
            activeFilterType={filterType}
            activeFilterId={filterId}
            onFilterChange={handleFilterChange}
            onIlluminateChain={handleIlluminateChain}
            onIlluminateCampaign={handleIlluminateCampaign}
            translations={{
              allPostsLabel: translations.allPosts,
              storiesLabel: translations.storiesLabel,
              openCampaignsLabel: translations.openCampaignsLabel,
            }}
            storiesInfoTitle={translations.storiesInfoTitle}
            storiesInfoBody={storiesInfoBody}
            openCampaignsInfoTitle={translations.openCampaignsInfoTitle}
            openCampaignsInfoBody={openCampaignsInfoBody}
          />
        </div>
      </aside>

      {/* Main content - Post Feed */}
      <main className="flex-1 min-w-0">
        <FeedPostsList
          posts={filteredPosts}
          chainTitles={chainTitles}
          hasMore={hasMore && filterType === null}
          title={postsSectionTitle}
          infoTitle={filterType === null ? translations.postsInfoTitle : undefined}
          infoBody={filterType === null ? postsInfoBody : undefined}
          isFiltered={filterType !== null}
          emptyStateMessage={emptyStateMessage}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </main>
    </div>
  );
}
