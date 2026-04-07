'use client';

/**
 * ExploreFilters — Sidebar component for filtering signals.
 *
 * Unified stories view:
 * - "All Signals" as default
 * - Stories section: chains with bounty indicators for funded investigations
 * - Open Bounties section: bounties without stories yet (open questions)
 */

import type { ReactElement, ReactNode } from 'react';
import type { ChainPreview, ChainId, BountyPreview, BountyId } from '@cocuyo/types';
import { formatPUSDCompact } from '@cocuyo/types';
import { FireflySymbol } from '@cocuyo/ui';
import { SectionHeader } from './SectionHeader';

/** Filter type for the explore view */
export type ExploreFilterType = 'chain' | 'bounty' | null;

export interface ExploreFiltersProps {
  /** Available story chains */
  chains: readonly ChainPreview[];
  /** Mapping of chain ID to bounties (for chains with funding) */
  chainBountyMap: Record<string, BountyPreview[]>;
  /** Orphan bounties - open questions without stories yet */
  orphanBounties: readonly BountyPreview[];
  /** Currently active filter type */
  activeFilterType: ExploreFilterType;
  /** Currently active filter ID (chain or bounty) */
  activeFilterId: string | null;
  /** Callback when filter changes */
  onFilterChange: (type: ExploreFilterType, id: string | null) => void;
  /** Callback when illuminate button is clicked on a story */
  onIlluminateChain: (chainId: ChainId) => void;
  /** Callback when illuminate button is clicked on a bounty */
  onIlluminateBounty: (bountyId: BountyId) => void;
  /** Translation strings */
  translations: {
    allPostsLabel: string;
    storiesLabel: string;
    openBountiesLabel: string;
  };
  /** Info popover content for stories */
  storiesInfoTitle?: string;
  storiesInfoBody?: ReactNode;
  /** Info popover content for open bounties */
  openBountiesInfoTitle?: string;
  openBountiesInfoBody?: ReactNode;
}

/**
 * Get status badge color for chains.
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

export function ExploreFilters({
  chains,
  chainBountyMap,
  orphanBounties,
  activeFilterType,
  activeFilterId,
  onFilterChange,
  onIlluminateChain,
  onIlluminateBounty,
  translations: t,
  storiesInfoTitle,
  storiesInfoBody,
  openBountiesInfoTitle,
  openBountiesInfoBody,
}: ExploreFiltersProps): ReactElement {
  const isAllPostsActive = activeFilterType === null;

  return (
    <div className="space-y-6">
      {/* Stories Section */}
      <div className="space-y-4">
        <div className="flex items-center min-h-[40px]">
          <SectionHeader title={t.storiesLabel} infoTitle={storiesInfoTitle} infoBody={storiesInfoBody} className="mb-0" />
        </div>

        {/* All Posts option */}
        <button
          type="button"
          onClick={() => onFilterChange(null, null)}
          className={`
            w-full text-left px-3 py-2 rounded-nested
            text-sm font-medium transition-colors
            ${
              isAllPostsActive
                ? 'bg-[var(--bg-surface-nested)] text-primary border border-[var(--border-emphasis)]'
                : 'text-secondary hover:text-primary hover:bg-[var(--bg-surface-hover)]'
            }
          `}
        >
          {t.allPostsLabel}
        </button>

        {/* Story chain list */}
        <div className="space-y-2">
          {chains.map((chain) => {
            const isActive = activeFilterType === 'chain' && activeFilterId === chain.id;
            const bounties = chainBountyMap[chain.id] ?? [];
            const bounty = bounties[0]; // Use first bounty for display
            const hasBounty = bounties.length > 0;

            return (
              <div
                key={chain.id}
                role="button"
                tabIndex={0}
                onClick={() => onFilterChange('chain', chain.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onFilterChange('chain', chain.id);
                  }
                }}
                className={`
                  w-full text-left px-3 py-2.5 rounded-nested
                  transition-colors group cursor-pointer
                  ${
                    isActive
                      ? 'bg-[var(--bg-surface-nested)] border border-[var(--border-emphasis)]'
                      : 'hover:bg-[var(--bg-surface-hover)]'
                  }
                `}
                style={hasBounty ? {
                  borderLeft: '3px solid var(--color-firefly-gold)',
                  backgroundColor: isActive ? undefined : 'rgba(232, 185, 49, 0.08)',
                } : undefined}
              >
                {/* Bounty badge row */}
                {hasBounty && bounty !== undefined && (
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="px-2 py-0.5 rounded-full font-semibold text-xs"
                      style={{ backgroundColor: 'rgba(232, 185, 49, 0.25)', color: 'var(--color-firefly-gold)' }}
                    >
                      Earn {formatPUSDCompact(bounty.fundingAmount)}
                    </span>
                    {/* Illuminate button for bounty stories */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onIlluminateChain(chain.id);
                      }}
                      className="
                        shrink-0 p-1 rounded
                        text-[var(--fg-accent)] animate-firefly-pulse
                        opacity-100 md:opacity-0 md:group-hover:opacity-100
                        transition-opacity duration-150
                        hover:bg-[var(--bg-surface-hover)]
                        focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--fg-accent)]
                      "
                      aria-label={`Illuminate signal for ${chain.title}`}
                    >
                      <FireflySymbol size={14} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {/* Status dot */}
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getStatusColor(chain.status) }}
                  />
                  <span
                    className={`
                      text-sm truncate flex-1
                      ${isActive ? 'text-primary font-medium' : 'text-secondary group-hover:text-primary'}
                    `}
                  >
                    {chain.title}
                  </span>
                  <span className="text-xs text-tertiary shrink-0">
                    {chain.postCount}
                  </span>
                  {/* Illuminate button for non-bounty stories */}
                  {!hasBounty && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onIlluminateChain(chain.id);
                      }}
                      className="
                        shrink-0 p-1 rounded
                        text-[var(--fg-accent)] animate-firefly-pulse
                        opacity-100 md:opacity-0 md:group-hover:opacity-100
                        transition-opacity duration-150
                        hover:bg-[var(--bg-surface-hover)]
                        focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--fg-accent)]
                      "
                      aria-label={`Illuminate signal for ${chain.title}`}
                    >
                      <FireflySymbol size={14} />
                    </button>
                  )}
                </div>
                {chain.location != null && (
                  <span className="text-xs text-tertiary block truncate ml-4 mt-0.5">
                    {chain.location}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Bounties Section - questions without stories yet */}
      {orphanBounties.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <SectionHeader title={t.openBountiesLabel} infoTitle={openBountiesInfoTitle} infoBody={openBountiesInfoBody} />

          <div className="space-y-2">
            {orphanBounties.map((bounty) => {
              const isActive = activeFilterType === 'bounty' && activeFilterId === bounty.id;
              return (
                <div
                  key={bounty.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onFilterChange('bounty', bounty.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onFilterChange('bounty', bounty.id);
                    }
                  }}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-nested
                    transition-colors group cursor-pointer
                    ${
                      isActive
                        ? 'bg-[var(--bg-surface-nested)] border border-[var(--border-emphasis)]'
                        : 'hover:bg-[var(--bg-surface-hover)]'
                    }
                  `}
                  style={{
                    borderLeft: '3px solid var(--color-firefly-gold)',
                    backgroundColor: isActive ? undefined : 'rgba(232, 185, 49, 0.08)',
                  }}
                >
                  {/* Bounty badge row */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="px-2 py-0.5 rounded-full font-semibold text-xs"
                      style={{ backgroundColor: 'rgba(232, 185, 49, 0.25)', color: 'var(--color-firefly-gold)' }}
                    >
                      Earn {formatPUSDCompact(bounty.fundingAmount)}
                    </span>
                    {/* Illuminate button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onIlluminateBounty(bounty.id);
                      }}
                      className="
                        shrink-0 p-1 rounded
                        text-[var(--fg-accent)] animate-firefly-pulse
                        opacity-100 md:opacity-0 md:group-hover:opacity-100
                        transition-opacity duration-150
                        hover:bg-[var(--bg-surface-hover)]
                        focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--fg-accent)]
                      "
                      aria-label={`Illuminate signal for bounty: ${bounty.title}`}
                    >
                      <FireflySymbol size={14} />
                    </button>
                  </div>
                  {/* Title */}
                  <p
                    className={`
                      text-sm truncate
                      ${isActive ? 'text-primary font-medium' : 'text-secondary group-hover:text-primary'}
                    `}
                  >
                    {bounty.title}
                  </p>
                  {bounty.location != null && (
                    <span className="text-xs text-tertiary block truncate mt-0.5">
                      {bounty.location}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
