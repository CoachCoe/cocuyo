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
  /** Currently active status filter */
  activeStatus: BountyStatus | null;
  /** Currently active topic filter */
  activeTopic: string | null;
  /** Callback when status filter changes */
  onStatusChange: (status: BountyStatus | null) => void;
  /** Callback when topic filter changes */
  onTopicChange: (topic: string | null) => void;
  /** Label for "All" status */
  allLabel: string;
  /** Label for status filter */
  statusLabel: string;
  /** Label for topics filter */
  topicsLabel: string;
  /** Total bounty count */
  totalCount: number;
  /** Filtered bounty count */
  filteredCount: number;
  /** Info popover title */
  infoTitle?: string | undefined;
  /** Info popover content */
  infoBody?: ReactNode | undefined;
}

const STATUS_OPTIONS: { value: BountyStatus | null; label: string; color?: string }[] = [
  { value: null, label: 'All' },
  { value: 'open', label: 'Open', color: 'var(--fg-success)' },
  { value: 'fulfilled', label: 'Fulfilled', color: 'var(--color-firefly-gold)' },
  { value: 'expired', label: 'Expired', color: 'var(--fg-tertiary)' },
  { value: 'cancelled', label: 'Cancelled', color: 'var(--fg-error)' },
];

export function BountyFilters({
  topics,
  activeStatus,
  activeTopic,
  onStatusChange,
  onTopicChange,
  allLabel,
  statusLabel: _statusLabel,
  topicsLabel: _topicsLabel,
  totalCount,
  filteredCount,
  infoTitle,
  infoBody,
}: BountyFiltersProps): ReactElement {
  const showInfo = infoTitle !== undefined && infoBody !== undefined;
  const isFiltered = activeStatus !== null || activeTopic !== null;

  // Update "All" label with the provided translation
  const statusOptions = STATUS_OPTIONS.map((opt) =>
    opt.value === null ? { ...opt, label: allLabel } : opt
  );

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
                  {topic.replace(/-/g, ' ')}
                </button>
              );
            })}
          </div>
        )}

        {/* Info button */}
        {showInfo && (
          <div className="hidden sm:block ml-auto">
            <InfoPopover title={infoTitle} position="bottom">
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
              {' of '}
              <span>{totalCount}</span>
              {' bounties'}
            </>
          ) : (
            <>
              <span className="text-primary font-medium">{totalCount}</span>
              {' bounties'}
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
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
