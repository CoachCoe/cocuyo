'use client';

/**
 * BountyFilters — Sidebar component for filtering bounties.
 *
 * Provides status and topic filters.
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
  /** Label for "All Bounties" */
  allBountiesLabel: string;
  /** Label for filters section */
  filtersLabel: string;
  /** Label for status filter */
  statusLabel: string;
  /** Label for topics filter */
  topicsLabel: string;
  /** Info popover title */
  infoTitle?: string | undefined;
  /** Info popover content */
  infoBody?: ReactNode | undefined;
}

const STATUS_OPTIONS: { value: BountyStatus; label: string; color: string }[] = [
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
  allBountiesLabel,
  filtersLabel,
  statusLabel,
  topicsLabel,
  infoTitle,
  infoBody,
}: BountyFiltersProps): ReactElement {
  const showInfo = infoTitle !== undefined && infoBody !== undefined;

  return (
    <div className="space-y-6">
      {/* Header with info */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide">
          {filtersLabel}
        </h2>
        {showInfo && (
          <InfoPopover title={infoTitle} position="bottom">
            {infoBody}
          </InfoPopover>
        )}
      </div>

      {/* All bounties option */}
      <button
        type="button"
        onClick={() => {
          onStatusChange(null);
          onTopicChange(null);
        }}
        className={`
          w-full text-left px-3 py-2 rounded-nested
          text-sm font-medium transition-colors
          ${
            activeStatus === null && activeTopic === null
              ? 'bg-[var(--bg-surface-nested)] text-primary border border-[var(--border-emphasis)]'
              : 'text-secondary hover:text-primary hover:bg-[var(--bg-surface-hover)]'
          }
        `}
      >
        {allBountiesLabel}
      </button>

      {/* Status filter - compact horizontal chips */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-tertiary uppercase tracking-wide px-1">
          {statusLabel}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((option) => {
            const isActive = activeStatus === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusChange(isActive ? null : option.value)}
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                  text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-[var(--bg-surface-nested)] text-primary border border-[var(--border-emphasis)]'
                      : 'text-secondary hover:text-primary hover:bg-[var(--bg-surface-hover)] border border-transparent'
                  }
                `}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: option.color }}
                />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic filter */}
      {topics.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-tertiary uppercase tracking-wide px-1">
            {topicsLabel}
          </h3>
          <div className="space-y-1">
            {topics.map((topic) => {
              const isActive = activeTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onTopicChange(isActive ? null : topic)}
                  className={`
                    w-full text-left px-3 py-2 rounded-nested
                    text-sm transition-colors capitalize
                    ${
                      isActive
                        ? 'bg-[var(--bg-surface-nested)] text-primary border border-[var(--border-emphasis)]'
                        : 'text-secondary hover:text-primary hover:bg-[var(--bg-surface-hover)]'
                    }
                  `}
                >
                  {topic.replace(/-/g, ' ')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
