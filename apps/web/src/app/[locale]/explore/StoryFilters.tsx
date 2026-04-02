'use client';

/**
 * StoryFilters — Sidebar component for filtering signals by story chain.
 *
 * Shows "All Signals" as default plus list of story chains.
 * Clicking a story filters the signal feed to that story's signals.
 */

import type { ReactElement } from 'react';
import type { ChainPreview, ChainId } from '@cocuyo/types';
import { FireflySymbol } from '@cocuyo/ui';
import { SectionHeader } from './SectionHeader';

export interface StoryFiltersProps {
  /** Available story chains */
  chains: readonly ChainPreview[];
  /** Currently active filter (null = all signals) */
  activeFilter: ChainId | null;
  /** Callback when filter changes */
  onFilterChange: (chainId: ChainId | null) => void;
  /** Callback when illuminate button is clicked on a story */
  onIlluminate: (chainId: ChainId) => void;
  /** Label for "All Signals" */
  allSignalsLabel: string;
  /** Label for the section header */
  sectionLabel: string;
  /** Info popover content */
  infoTitle?: string | undefined;
  infoBody?: React.ReactNode | undefined;
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

export function StoryFilters({
  chains,
  activeFilter,
  onFilterChange,
  onIlluminate,
  allSignalsLabel,
  sectionLabel,
  infoTitle,
  infoBody,
}: StoryFiltersProps): ReactElement {
  return (
    <div className="space-y-4">
      <SectionHeader title={sectionLabel} infoTitle={infoTitle} infoBody={infoBody} />

      {/* All Signals option */}
      <button
        type="button"
        onClick={() => onFilterChange(null)}
        className={`
          w-full text-left px-3 py-2 rounded-nested
          text-sm font-medium transition-colors
          ${
            activeFilter === null
              ? 'bg-[var(--bg-surface-nested)] text-primary border border-[var(--border-emphasis)]'
              : 'text-secondary hover:text-primary hover:bg-[var(--bg-surface-hover)]'
          }
        `}
      >
        {allSignalsLabel}
      </button>

      {/* Story chain list */}
      <div className="space-y-1">
        {chains.map((chain) => {
          const isActive = activeFilter === chain.id;
          return (
            <div
              key={chain.id}
              role="button"
              tabIndex={0}
              onClick={() => onFilterChange(chain.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onFilterChange(chain.id);
                }
              }}
              className={`
                w-full text-left px-3 py-2 rounded-nested
                transition-colors group cursor-pointer
                ${
                  isActive
                    ? 'bg-[var(--bg-surface-nested)] border border-[var(--border-emphasis)]'
                    : 'hover:bg-[var(--bg-surface-hover)]'
                }
              `}
            >
              <div className="flex items-center gap-2">
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
                <span className="text-xs text-tertiary shrink-0 mr-1">
                  {chain.signalCount}
                </span>
                {/* Illuminate button - visible on hover (desktop) or always (mobile) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onIlluminate(chain.id);
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
              {chain.location != null && (
                <span className="text-xs text-tertiary ml-4 block truncate">
                  {chain.location}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
