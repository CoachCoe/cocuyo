'use client';

/**
 * ExploreFilters — Sidebar component for filtering signals.
 *
 * Unified stories view:
 * - "All Signals" as default
 * - Stories section: chains with campaign indicators for funded investigations
 * - Open Campaigns section: campaigns without stories yet (open questions)
 */

import type { ReactElement, ReactNode } from 'react';
import type { ChainPreview, ChainId, CampaignPreview, CampaignId } from '@cocuyo/types';
import { formatPUSDCompact } from '@cocuyo/types';
import { FireflySymbol } from '@cocuyo/ui';
import { SectionHeader } from './SectionHeader';

/** Filter type for the explore view */
export type ExploreFilterType = 'chain' | 'campaign' | null;

export interface ExploreFiltersProps {
  /** Available story chains */
  chains: readonly ChainPreview[];
  /** Mapping of chain ID to campaigns (for chains with funding) */
  chainCampaignMap: Record<string, CampaignPreview[]>;
  /** Orphan campaigns - open questions without stories yet */
  orphanCampaigns: readonly CampaignPreview[];
  /** Currently active filter type */
  activeFilterType: ExploreFilterType;
  /** Currently active filter ID (chain or campaign) */
  activeFilterId: string | null;
  /** Callback when filter changes */
  onFilterChange: (type: ExploreFilterType, id: string | null) => void;
  /** Callback when illuminate button is clicked on a story */
  onIlluminateChain: (chainId: ChainId) => void;
  /** Callback when illuminate button is clicked on a campaign */
  onIlluminateCampaign: (campaignId: CampaignId) => void;
  /** Translation strings */
  translations: {
    allPostsLabel: string;
    storiesLabel: string;
    openCampaignsLabel: string;
  };
  /** Info popover content for stories */
  storiesInfoTitle?: string;
  storiesInfoBody?: ReactNode;
  /** Info popover content for open campaigns */
  openCampaignsInfoTitle?: string;
  openCampaignsInfoBody?: ReactNode;
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
  chainCampaignMap,
  orphanCampaigns,
  activeFilterType,
  activeFilterId,
  onFilterChange,
  onIlluminateChain,
  onIlluminateCampaign,
  translations: t,
  storiesInfoTitle,
  storiesInfoBody,
  openCampaignsInfoTitle,
  openCampaignsInfoBody,
}: ExploreFiltersProps): ReactElement {
  const isAllPostsActive = activeFilterType === null;

  return (
    <div className="space-y-6">
      {/* Stories Section */}
      <div className="space-y-4">
        <div className="flex min-h-[40px] items-center">
          <SectionHeader
            title={t.storiesLabel}
            infoTitle={storiesInfoTitle}
            infoBody={storiesInfoBody}
            className="mb-0"
          />
        </div>

        {/* All Posts option */}
        <button
          type="button"
          onClick={() => onFilterChange(null, null)}
          className={`w-full rounded-nested px-3 py-2 text-left text-sm font-medium transition-colors ${
            isAllPostsActive
              ? 'border border-[var(--border-emphasis)] bg-[var(--bg-surface-nested)] text-primary'
              : 'text-secondary hover:bg-[var(--bg-surface-hover)] hover:text-primary'
          } `}
        >
          {t.allPostsLabel}
        </button>

        {/* Story chain list */}
        <div className="space-y-2">
          {chains.map((chain) => {
            const isActive = activeFilterType === 'chain' && activeFilterId === chain.id;
            const campaigns = chainCampaignMap[chain.id] ?? [];
            const campaign = campaigns[0]; // Use first campaign for display
            const hasCampaign = campaigns.length > 0;

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
                className={`group w-full cursor-pointer rounded-nested px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? 'border border-[var(--border-emphasis)] bg-[var(--bg-surface-nested)]'
                    : 'hover:bg-[var(--bg-surface-hover)]'
                } `}
                style={
                  hasCampaign
                    ? {
                        borderLeft: '3px solid var(--color-firefly-gold)',
                        backgroundColor: isActive ? undefined : 'rgba(232, 185, 49, 0.08)',
                      }
                    : undefined
                }
              >
                {/* Campaign badge row */}
                {hasCampaign && campaign !== undefined && (
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(232, 185, 49, 0.25)',
                        color: 'var(--color-firefly-gold)',
                      }}
                    >
                      Earn {formatPUSDCompact(campaign.fundingAmount)}
                    </span>
                    {/* Illuminate button for campaign stories */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onIlluminateChain(chain.id);
                      }}
                      className="animate-firefly-pulse shrink-0 rounded p-1 text-[var(--fg-accent)] opacity-100 transition-opacity duration-150 hover:bg-[var(--bg-surface-hover)] focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--fg-accent)] md:opacity-0 md:group-hover:opacity-100"
                      aria-label={`Illuminate signal for ${chain.title}`}
                    >
                      <FireflySymbol size={14} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {/* Status dot */}
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: getStatusColor(chain.status) }}
                  />
                  <span
                    className={`flex-1 truncate text-sm ${isActive ? 'font-medium text-primary' : 'text-secondary group-hover:text-primary'} `}
                  >
                    {chain.title}
                  </span>
                  <span className="shrink-0 text-xs text-tertiary">{chain.postCount}</span>
                  {/* Illuminate button for non-campaign stories */}
                  {!hasCampaign && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onIlluminateChain(chain.id);
                      }}
                      className="animate-firefly-pulse shrink-0 rounded p-1 text-[var(--fg-accent)] opacity-100 transition-opacity duration-150 hover:bg-[var(--bg-surface-hover)] focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--fg-accent)] md:opacity-0 md:group-hover:opacity-100"
                      aria-label={`Illuminate signal for ${chain.title}`}
                    >
                      <FireflySymbol size={14} />
                    </button>
                  )}
                </div>
                {chain.location != null && (
                  <span className="ml-4 mt-0.5 block truncate text-xs text-tertiary">
                    {chain.location}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Open Campaigns Section - questions without stories yet */}
      {orphanCampaigns.length > 0 && (
        <div className="space-y-4 border-t border-[var(--border-subtle)] pt-4">
          <SectionHeader
            title={t.openCampaignsLabel}
            infoTitle={openCampaignsInfoTitle}
            infoBody={openCampaignsInfoBody}
          />

          <div className="space-y-2">
            {orphanCampaigns.map((campaign) => {
              const isActive = activeFilterType === 'campaign' && activeFilterId === campaign.id;
              return (
                <div
                  key={campaign.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onFilterChange('campaign', campaign.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onFilterChange('campaign', campaign.id);
                    }
                  }}
                  className={`group w-full cursor-pointer rounded-nested px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? 'border border-[var(--border-emphasis)] bg-[var(--bg-surface-nested)]'
                      : 'hover:bg-[var(--bg-surface-hover)]'
                  } `}
                  style={{
                    borderLeft: '3px solid var(--color-firefly-gold)',
                    backgroundColor: isActive ? undefined : 'rgba(232, 185, 49, 0.08)',
                  }}
                >
                  {/* Campaign badge row */}
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(232, 185, 49, 0.25)',
                        color: 'var(--color-firefly-gold)',
                      }}
                    >
                      Earn {formatPUSDCompact(campaign.fundingAmount)}
                    </span>
                    {/* Illuminate button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onIlluminateCampaign(campaign.id);
                      }}
                      className="animate-firefly-pulse shrink-0 rounded p-1 text-[var(--fg-accent)] opacity-100 transition-opacity duration-150 hover:bg-[var(--bg-surface-hover)] focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--fg-accent)] md:opacity-0 md:group-hover:opacity-100"
                      aria-label={`Illuminate signal for campaign: ${campaign.title}`}
                    >
                      <FireflySymbol size={14} />
                    </button>
                  </div>
                  {/* Title */}
                  <p
                    className={`truncate text-sm ${isActive ? 'font-medium text-primary' : 'text-secondary group-hover:text-primary'} `}
                  >
                    {campaign.title}
                  </p>
                  {campaign.location != null && (
                    <span className="mt-0.5 block truncate text-xs text-tertiary">
                      {campaign.location}
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
