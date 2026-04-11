'use client';

/**
 * FeedPostsList — List of post cards with section header.
 * Supports toggling between list and map view.
 */

import type { ReactElement, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { Post, ChainId, CampaignId } from '@cocuyo/types';
import { FeedPostCard, AnimatedList, EmptyState, SkeletonFeedPostCard, type PostCampaignInfo } from '@cocuyo/ui';
import { SectionHeader } from './SectionHeader';
import { useCorroborateDispute } from '@/components/CorroborateDisputeSheet';
import { useTrustDrawer } from '@/components/TrustDrawer';

// Dynamic import with SSR disabled - map requires window/Leaflet
const PostMapView = dynamic(
  () => import('@/components/Map').then((m) => m.PostMapView),
  { ssr: false }
);

export type ViewMode = 'list' | 'map';

interface FeedPostsListProps {
  posts: Post[];
  chainTitles: Record<string, string>;
  hasMore: boolean;
  /** Section title */
  title: string;
  /** Title for the info popover */
  infoTitle?: string | undefined;
  /** Body content for the info popover */
  infoBody?: ReactNode | undefined;
  /** Whether the list is currently filtered */
  isFiltered?: boolean | undefined;
  /** Whether loading */
  isLoading?: boolean | undefined;
  /** Custom empty state message */
  emptyStateMessage?: string | undefined;
  /** Map of post IDs to campaign info (for display) */
  postCampaignMap?: Record<string, PostCampaignInfo> | undefined;
  /** Current view mode */
  viewMode?: ViewMode | undefined;
  /** Callback when view mode changes */
  onViewModeChange?: ((mode: ViewMode) => void) | undefined;
}

export function FeedPostsList({
  posts,
  chainTitles,
  hasMore,
  title,
  infoTitle,
  infoBody,
  isFiltered = false,
  isLoading = false,
  emptyStateMessage,
  postCampaignMap = {},
  viewMode = 'list',
  onViewModeChange,
}: FeedPostsListProps): ReactElement {
  const router = useRouter();
  const locale = useLocale();
  const { openSheet: openCorroborateSheet } = useCorroborateDispute();
  const { openDrawer: openTrustDrawer } = useTrustDrawer();

  const handlePostClick = (post: Post): void => {
    router.push(`/${locale}/post/${post.id}`);
  };

  const handleChainClick = (chainId: ChainId): void => {
    router.push(`/${locale}/chain/${chainId}`);
  };

  const handleCampaignClick = (campaignId: CampaignId): void => {
    router.push(`/${locale}/campaign/${campaignId}`);
  };

  const handleAuthorClick = (credentialHash: string): void => {
    router.push(`/${locale}/profile/${credentialHash}`);
  };

  const handleCorroborate = (post: Post): void => {
    const campaign = postCampaignMap[post.id];
    openCorroborateSheet({
      post,
      mode: 'corroborate',
      ...(campaign !== undefined && { campaign }),
    });
  };

  const handleDispute = (post: Post): void => {
    const campaign = postCampaignMap[post.id];
    openCorroborateSheet({
      post,
      mode: 'dispute',
      ...(campaign !== undefined && { campaign }),
    });
  };

  const handleViewTrust = (post: Post): void => {
    openTrustDrawer(post.id);
  };

  // View mode toggle component
  const viewToggle = onViewModeChange !== undefined && (
    <div className="flex items-center gap-1 bg-[var(--bg-surface-nested)] rounded-lg p-1">
      <button
        type="button"
        onClick={() => onViewModeChange('list')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'list'
            ? 'bg-[var(--bg-primary)] text-[var(--fg-primary)] shadow-sm'
            : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
        }`}
        aria-pressed={viewMode === 'list'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span>List</span>
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('map')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'map'
            ? 'bg-[var(--bg-primary)] text-[var(--fg-primary)] shadow-sm'
            : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
        }`}
        aria-pressed={viewMode === 'map'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span>Map</span>
      </button>
    </div>
  );

  // Show loading skeletons
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4 min-h-[40px]">
          <SectionHeader title={title} infoTitle={infoTitle} infoBody={infoBody} className="mb-0" />
          {viewToggle}
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonFeedPostCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 min-h-[40px]">
        <SectionHeader title={title} infoTitle={infoTitle} infoBody={infoBody} className="mb-0" />
        {viewToggle}
      </div>

      {viewMode === 'map' ? (
        <PostMapView
          posts={posts}
          locale={locale}
          className="h-[500px] rounded-lg"
        />
      ) : posts.length > 0 ? (
        <AnimatedList className="grid gap-4" variant="fast">
          {posts.map((post) => {
            const chainTitle =
              post.chainLinks.length > 0
                ? chainTitles[post.chainLinks[0] as string]
                : undefined;
            const campaign = postCampaignMap[post.id];
            return (
              <FeedPostCard
                key={post.id}
                post={post}
                {...(chainTitle !== undefined && { chainTitle })}
                {...(campaign !== undefined && { campaign })}
                onClick={() => handlePostClick(post)}
                onChainClick={handleChainClick}
                onCampaignClick={handleCampaignClick}
                onAuthorClick={handleAuthorClick}
                onCorroborate={() => handleCorroborate(post)}
                onDispute={() => handleDispute(post)}
                onViewTrust={() => handleViewTrust(post)}
                showActions
              />
            );
          })}
        </AnimatedList>
      ) : (
        <div>
          <EmptyState
            title={emptyStateMessage ?? (isFiltered ? 'No posts found' : 'No posts yet')}
            description={
              isFiltered
                ? 'No posts match your current filters.'
                : 'Be the first to illuminate. Share what you observe.'
            }
            size="md"
          />
        </div>
      )}

      {viewMode === 'list' && hasMore && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-medium border border-[var(--color-border-default)] rounded-small hover:border-[var(--fg-accent)] hover:text-[var(--fg-accent)] transition-colors"
          >
            Load more posts
          </button>
        </div>
      )}
    </div>
  );
}
