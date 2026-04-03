'use client';

/**
 * BountyFilters — Horizontal filter bar for the bounties page.
 *
 * Compact design with status chips and topic dropdown.
 */

import { useState, useRef, useEffect, type ReactElement, type ReactNode } from 'react';
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
    topicsLabel: string;
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
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showInfo = infoTitle !== undefined && infoBody !== undefined;
  const isFiltered = activeStatus !== null || activeTopic !== null;

  const statusOptions: { value: BountyStatus | null; label: string; color?: string }[] = [
    { value: null, label: t.all },
    { value: 'open', label: t.statusOpen, color: 'var(--fg-success)' },
    { value: 'fulfilled', label: t.statusFulfilled, color: 'var(--color-firefly-gold)' },
    { value: 'expired', label: t.statusExpired, color: 'var(--fg-tertiary)' },
    { value: 'cancelled', label: t.statusCancelled, color: 'var(--fg-error)' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isTopicDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTopicDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTopicDropdownOpen]);

  // Close on escape
  useEffect(() => {
    if (!isTopicDropdownOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsTopicDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isTopicDropdownOpen]);

  const handleTopicSelect = (topic: string): void => {
    onTopicChange(activeTopic === topic ? null : topic);
    setIsTopicDropdownOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div
        className="
          flex flex-wrap items-center gap-3
          p-3 rounded-lg
          bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]
        "
      >
        {/* Status filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
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
          <div className="w-px h-6 bg-[var(--border-default)]" />
        )}

        {/* Topic dropdown */}
        {topics.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsTopicDropdownOpen(!isTopicDropdownOpen)}
              className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                text-sm font-medium transition-all duration-150
                ${
                  activeTopic !== null
                    ? 'bg-[var(--color-firefly-gold)] text-[var(--bg-base)] shadow-sm'
                    : 'text-secondary hover:text-primary bg-[var(--bg-surface-nested)] hover:bg-[var(--bg-surface-hover)]'
                }
              `}
              aria-expanded={isTopicDropdownOpen}
              aria-haspopup="listbox"
            >
              <span>
                {activeTopic !== null
                  ? topicTranslations[activeTopic] ?? activeTopic
                  : t.topicsLabel}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${isTopicDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isTopicDropdownOpen && (
              <div
                className="
                  absolute top-full left-0 mt-2 z-50
                  min-w-[200px] max-h-[300px] overflow-y-auto
                  bg-[var(--bg-surface-container)] border border-[var(--border-default)]
                  rounded-lg shadow-3
                "
                role="listbox"
              >
                {topics.map((topic) => {
                  const isSelected = activeTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleTopicSelect(topic)}
                      className={`
                        w-full text-left px-4 py-2.5 text-sm
                        transition-colors
                        ${
                          isSelected
                            ? 'bg-[var(--color-firefly-gold)]/10 text-[var(--color-firefly-gold)] font-medium'
                            : 'text-secondary hover:text-primary hover:bg-[var(--bg-surface-hover)]'
                        }
                      `}
                    >
                      {topicTranslations[topic] ?? topic}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Clear topic button (when topic is selected) */}
        {activeTopic !== null && (
          <button
            type="button"
            onClick={() => onTopicChange(null)}
            className="p-1.5 rounded-full text-secondary hover:text-primary hover:bg-[var(--bg-surface-hover)] transition-colors"
            aria-label="Clear topic filter"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Info button */}
        {showInfo && (
          <InfoPopover title={infoTitle} position="bottom" triggerLabel={t.whatsThis}>
            {infoBody}
          </InfoPopover>
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
