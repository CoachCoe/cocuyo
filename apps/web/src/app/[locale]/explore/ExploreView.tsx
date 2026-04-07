'use client';

/**
 * ExploreView — Main client component for the explore page.
 *
 * Manages filter state and renders two-column layout:
 * - Left: Filters sidebar (story chains + bounties)
 * - Right: Signal feed (filtered by chain, bounty, or all)
 */

import { useState, useMemo, useCallback, type ReactElement, type ReactNode } from 'react';
import type { ChainPreview, ChainId, Post, BountyPreview, BountyId } from '@cocuyo/types';
import { useIlluminate } from '@/hooks/useIlluminate';
import { ExploreFilters, type ExploreFilterType } from './ExploreFilters';
import { FeedPostsList, type ViewMode } from './FeedPostsList';

export interface ExploreViewProps {
  /** Available story chains */
  chains: readonly ChainPreview[];
  /** Mapping of chain ID to bounty (for chains with funding) */
  chainBountyMap: Record<string, BountyPreview[]>;
  /** Orphan bounties - open questions without stories yet */
  orphanBounties: readonly BountyPreview[];
  /** Mapping of bounty ID to contributing post IDs */
  bountyPostsMap: Record<string, readonly string[]>;
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
    openBountiesLabel: string;
    recentPostsLabel: string;
    storiesInfoTitle: string;
    postsInfoTitle: string;
    openBountiesInfoTitle: string;
    noMatchingBountyPosts: string;
  };
  /** Info popover content for stories */
  storiesInfoBody?: ReactNode | undefined;
  /** Info popover content for posts */
  postsInfoBody?: ReactNode | undefined;
  /** Info popover content for open bounties */
  openBountiesInfoBody?: ReactNode | undefined;
}

export function ExploreView({
  chains,
  chainBountyMap,
  orphanBounties,
  bountyPostsMap,
  posts,
  chainTitles,
  hasMore,
  translations,
  storiesInfoBody,
  postsInfoBody,
  openBountiesInfoBody,
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

  // Handle illuminate button click on a bounty
  const handleIlluminateBounty = useCallback(
    (bountyId: BountyId) => {
      openModal({ bountyId });
    },
    [openModal]
  );

  // Get the active bounty (if filtering by bounty)
  const activeBounty = useMemo(() => {
    if (filterType !== 'bounty' || filterId === null) return null;
    return orphanBounties.find((b) => b.id === filterId) ?? null;
  }, [filterType, filterId, orphanBounties]);

  // Filter posts based on active filter
  const filteredPosts = useMemo(() => {
    switch (filterType) {
      case null:
        return posts;
      case 'chain':
        return posts.filter((post) => post.chainLinks.includes(filterId as ChainId));
      case 'bounty': {
        if (filterId === null) return posts;
        const contributingPostIds = bountyPostsMap[filterId] ?? [];
        return posts.filter((post) => contributingPostIds.includes(post.id));
      }
    }
  }, [posts, filterType, filterId, bountyPostsMap]);

  // Determine the posts section title based on filter
  const postsSectionTitle = useMemo(() => {
    switch (filterType) {
      case null:
        return translations.recentPostsLabel;
      case 'chain': {
        const chain = chains.find((c) => c.id === filterId);
        return chain?.title ?? translations.recentPostsLabel;
      }
      case 'bounty':
        return activeBounty?.title ?? translations.recentPostsLabel;
    }
  }, [filterType, filterId, chains, activeBounty, translations.recentPostsLabel]);

  // Determine empty state message
  const emptyStateMessage = useMemo(() => {
    if (filterType === 'bounty') {
      return translations.noMatchingBountyPosts;
    }
    return undefined; // Use default
  }, [filterType, translations.noMatchingBountyPosts]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar - Filters */}
      <aside className="md:w-72 lg:w-80 shrink-0">
        <div className="md:sticky md:top-24">
          <ExploreFilters
            chains={chains}
            chainBountyMap={chainBountyMap}
            orphanBounties={orphanBounties}
            activeFilterType={filterType}
            activeFilterId={filterId}
            onFilterChange={handleFilterChange}
            onIlluminateChain={handleIlluminateChain}
            onIlluminateBounty={handleIlluminateBounty}
            translations={{
              allPostsLabel: translations.allPosts,
              storiesLabel: translations.storiesLabel,
              openBountiesLabel: translations.openBountiesLabel,
            }}
            storiesInfoTitle={translations.storiesInfoTitle}
            storiesInfoBody={storiesInfoBody}
            openBountiesInfoTitle={translations.openBountiesInfoTitle}
            openBountiesInfoBody={openBountiesInfoBody}
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
