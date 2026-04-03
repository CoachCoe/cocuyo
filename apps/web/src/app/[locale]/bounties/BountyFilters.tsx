'use client';

/**
 * BountyFilters — Filter bar for the bounties page.
 *
 * Features:
 * - Search input for titles/descriptions
 * - Status dropdown (defaults to Open)
 * - Topic dropdown with multi-select
 */

import { useState, useRef, useEffect, type ReactElement } from 'react';
import type { BountyStatus } from '@cocuyo/types';

export interface BountyFiltersProps {
  /** Available topics */
  topics: readonly string[];
  /** Topic slug to translated name map */
  topicTranslations: Record<string, string>;
  /** Currently active status filter */
  activeStatus: BountyStatus | null;
  /** Currently active topic filters (multi-select) */
  activeTopics: readonly string[];
  /** Current search query */
  searchQuery: string;
  /** Callback when status filter changes */
  onStatusChange: (status: BountyStatus | null) => void;
  /** Callback when topic filters change */
  onTopicsChange: (topics: readonly string[]) => void;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Total bounty count */
  totalCount: number;
  /** Filtered bounty count */
  filteredCount: number;
  /** Translation strings */
  translations: {
    all: string;
    statusLabel: string;
    statusOpen: string;
    statusFulfilled: string;
    statusExpired: string;
    statusCancelled: string;
    bountyWord: string;
    bountiesWord: string;
    ofWord: string;
    clearFilters: string;
    filterByTopic: string;
    searchPlaceholder: string;
    topicSelected: string;
    topicsSelected: string;
  };
}

export function BountyFilters({
  topics,
  topicTranslations,
  activeStatus,
  activeTopics,
  searchQuery,
  onStatusChange,
  onTopicsChange,
  onSearchChange,
  totalCount,
  filteredCount,
  translations: t,
}: BountyFiltersProps): ReactElement {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const topicDropdownRef = useRef<HTMLDivElement>(null);
  const isFiltered = activeStatus !== null || activeTopics.length > 0 || searchQuery.length > 0;

  const statusOptions: { value: BountyStatus | null; label: string; color?: string }[] = [
    { value: null, label: t.all },
    { value: 'open', label: t.statusOpen, color: 'var(--fg-success)' },
    { value: 'fulfilled', label: t.statusFulfilled, color: 'var(--color-firefly-gold)' },
    { value: 'expired', label: t.statusExpired, color: 'var(--fg-tertiary)' },
    { value: 'cancelled', label: t.statusCancelled, color: 'var(--fg-error)' },
  ];

  // Always defined since statusOptions[0] always exists
  const currentStatusOption = statusOptions.find((o) => o.value === activeStatus) ?? statusOptions[0]!;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(event.target as Node)) {
        setIsTopicDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsStatusDropdownOpen(false);
        setIsTopicDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStatusSelect = (status: BountyStatus | null): void => {
    onStatusChange(status);
    setIsStatusDropdownOpen(false);
  };

  const handleTopicToggle = (topic: string): void => {
    if (activeTopics.includes(topic)) {
      onTopicsChange(activeTopics.filter((t) => t !== topic));
    } else {
      onTopicsChange([...activeTopics, topic]);
    }
  };

  const getTopicButtonLabel = (): string => {
    if (activeTopics.length === 0) {
      return t.filterByTopic;
    }
    if (activeTopics.length === 1) {
      const topic = activeTopics[0];
      return topic !== undefined ? (topicTranslations[topic] ?? topic) : t.filterByTopic;
    }
    return `${activeTopics.length} ${t.topicsSelected}`;
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div
        className="
          flex flex-col sm:flex-row sm:items-center gap-3
          p-3 rounded-lg
          bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)]
        "
      >
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="
              w-full pl-9 pr-3 py-2 rounded-lg
              text-sm text-primary placeholder:text-tertiary
              bg-[var(--bg-surface-nested)] border border-[var(--border-subtle)]
              focus:outline-none focus:border-[var(--border-emphasis)] focus:ring-1 focus:ring-[var(--border-emphasis)]
              transition-colors
            "
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-tertiary hover:text-secondary rounded"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-[var(--border-default)]" />

        {/* Topic dropdown */}
        {topics.length > 0 && (
          <div ref={topicDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsTopicDropdownOpen(!isTopicDropdownOpen)}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-lg
                text-sm font-medium transition-all duration-150
                border min-w-[160px]
                ${
                  activeTopics.length > 0
                    ? 'bg-[var(--color-firefly-gold)]/10 border-[var(--color-firefly-gold)]/30 text-[var(--color-firefly-gold)]'
                    : 'bg-[var(--bg-surface-nested)] border-[var(--border-subtle)] text-secondary hover:border-[var(--border-emphasis)]'
                }
              `}
              aria-expanded={isTopicDropdownOpen}
              aria-haspopup="listbox"
            >
              <span>{getTopicButtonLabel()}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isTopicDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Topic dropdown menu - multi-select */}
            {isTopicDropdownOpen && (
              <div
                className="
                  absolute top-full left-0 mt-1 z-50
                  min-w-[220px] max-h-[300px] overflow-y-auto
                  bg-[var(--bg-surface-container)] border border-[var(--border-default)]
                  rounded-lg shadow-3
                "
                role="listbox"
                aria-multiselectable="true"
              >
                {/* Clear all topics button */}
                {activeTopics.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onTopicsChange([])}
                    className="w-full text-left px-3 py-2 text-xs text-tertiary hover:text-secondary border-b border-[var(--border-subtle)]"
                  >
                    Clear all
                  </button>
                )}
                {topics.map((topic) => {
                  const isSelected = activeTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleTopicToggle(topic)}
                      className={`
                        w-full text-left px-3 py-2.5 text-sm
                        flex items-center gap-2 transition-colors
                        ${
                          isSelected
                            ? 'bg-[var(--color-firefly-gold)]/10 text-[var(--color-firefly-gold)]'
                            : 'text-secondary hover:text-primary hover:bg-[var(--bg-surface-hover)]'
                        }
                      `}
                    >
                      {/* Checkbox indicator */}
                      <span
                        className={`
                          w-4 h-4 rounded border flex items-center justify-center shrink-0
                          ${
                            isSelected
                              ? 'bg-[var(--color-firefly-gold)] border-[var(--color-firefly-gold)]'
                              : 'border-[var(--border-emphasis)]'
                          }
                        `}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {topicTranslations[topic] ?? topic}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Status dropdown */}
        <div ref={statusDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg
              text-sm font-medium transition-all duration-150
              bg-[var(--bg-surface-nested)] border border-[var(--border-subtle)]
              hover:border-[var(--border-emphasis)]
              ${activeStatus !== null ? 'text-primary' : 'text-secondary'}
            `}
            aria-expanded={isStatusDropdownOpen}
            aria-haspopup="listbox"
          >
            {currentStatusOption.color !== undefined && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: currentStatusOption.color }}
              />
            )}
            <span>{currentStatusOption.label}</span>
            <svg
              className={`w-4 h-4 text-tertiary transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Status dropdown menu */}
          {isStatusDropdownOpen && (
            <div
              className="
                absolute top-full left-0 mt-1 z-50
                min-w-[160px]
                bg-[var(--bg-surface-container)] border border-[var(--border-default)]
                rounded-lg shadow-3 overflow-hidden
              "
              role="listbox"
            >
              {statusOptions.map((option) => {
                const isSelected = activeStatus === option.value;
                return (
                  <button
                    key={option.value ?? 'all'}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleStatusSelect(option.value)}
                    className={`
                      w-full text-left px-3 py-2.5 text-sm
                      flex items-center gap-2 transition-colors
                      ${
                        isSelected
                          ? 'bg-[var(--bg-surface-hover)] text-primary font-medium'
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
          )}
        </div>
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
              onTopicsChange([]);
              onSearchChange('');
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
