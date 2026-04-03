'use client';

/**
 * BountyFilters — Horizontal filter bar for the bounties page.
 *
 * Clean, compact design with status chips and topic pills.
 */

import type { ReactElement, ReactNode } from 'react';
import type { BountyStatus } from '@cocuyo/types';
import { InfoPopover } from '@cocuyo/ui';

export interface BountyFiltersProps {
  /** Available topics */
  topics: readonly string[];
  /** Topic slug to translated name map */
  topicTranslations: Record<string, string>;
  /** Currently active status filter */
  activeStatus: BountyStatus | null;
  /** Currently active topic filter */
  activeTopic: string | null;
  /** Callback when status filter changes */
  onStatusChange: (status: BountyStatus | null) => void;
  /** Callback when topic filter changes */
  onTopicChange: (topic: string | null) => void;
  /** Total bounty count */
  totalCount: number;
  /** Filtered bounty count */
  filteredCount: number;
  /** Translation strings */
  translations: {
    all: string;
    statusOpen: string;
    statusFulfilled: string;
    statusExpired: string;
    statusCancelled: string;
    bountyWord: string;
    bountiesWord: string;
    ofWord: string;
    clearFilters: string;
    whatsThis: string;
  };
  /** Info popover title */
  infoTitle?: string | undefined;
  /** Info popover content */
  infoBody?: ReactNode | undefined;
}

export function BountyFilters({
  topics,
  topicTranslations,
  activeStatus,
  activeTopic,
  onStatusChange,
  onTopicChange,
  totalCount,
  filteredCount,
  translations: t,
  infoTitle,
  infoBody,
}: BountyFiltersProps): ReactElement {
  const showInfo = infoTitle !== undefined && infoBody !== undefined;
  const isFiltered = activeStatus !== null || activeTopic !== null;

  const statusOptions: { value: BountyStatus | null; label: string; color?: string }[] = [
    { value: null, label: t.all },
    { value: 'open', label: t.statusOpen, color: 'var(--fg-success)' },
    { value: 'fulfilled', label: t.statusFulfilled, color: 'var(--color-firefly-gold)' },
    { value: 'expired', label: t.statusExpired, color: 'var(--fg-tertiary)' },
    { value: 'cancelled', label: t.statusCancelled, color: 'var(--fg-error)' },
  ];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div
        className="
          flex flex-col sm:flex-row sm:items-center gap-4
          p-4 rounded-lg
          bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]
        "
      >
        {/* Status filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusOptions.map((option) => {
            const isActive = activeStatus === option.value;
            return (
              <button
                key={option.value ?? 'all'}
                type="button"
                onClick={() => onStatusChange(option.value)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  text-sm font-medium transition-all duration-150
                  ${
                    isActive
                      ? 'bg-[var(--bg-surface-inverse)] text-[var(--fg-inverse)] shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-[var(--bg-surface-hover)]'
                  }
                `}
              >
                {option.color !== undefined && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        {topics.length > 0 && (
          <div className="hidden sm:block w-px h-6 bg-[var(--border-default)]" />
        )}

        {/* Topic filters */}
        {topics.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {topics.map((topic) => {
              const isActive = activeTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onTopicChange(isActive ? null : topic)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all duration-150 capitalize
                    ${
                      isActive
                        ? 'bg-[var(--color-firefly-gold)] text-[var(--bg-base)] font-medium shadow-sm'
                        : 'text-secondary hover:text-primary bg-[var(--bg-surface-nested)] hover:bg-[var(--bg-surface-hover)]'
                    }
                  `}
                >
                  {topicTranslations[topic] ?? topic.replace(/-/g, ' ')}
                </button>
              );
            })}
          </div>
        )}

        {/* Info button */}
        {showInfo && (
          <div className="hidden sm:block ml-auto">
            <InfoPopover title={infoTitle} position="bottom" triggerLabel={t.whatsThis}>
              {infoBody}
            </InfoPopover>
          </div>
        )}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-secondary">
          {isFiltered ? (
            <>
              <span className="text-primary font-medium">{filteredCount}</span>
              {' '}{t.ofWord}{' '}{totalCount}{' '}{totalCount === 1 ? t.bountyWord : t.bountiesWord}
            </>
          ) : (
            <>
              <span className="text-primary font-medium">{totalCount}</span>
              {' '}{totalCount === 1 ? t.bountyWord : t.bountiesWord}
            </>
          )}
        </p>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              onStatusChange(null);
              onTopicChange(null);
            }}
            className="text-[var(--color-firefly-gold)] hover:underline font-medium"
          >
            {t.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}
