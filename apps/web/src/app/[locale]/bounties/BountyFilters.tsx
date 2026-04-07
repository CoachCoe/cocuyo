'use client';

/**
 * BountyFilters — Filter bar for the bounties page.
 *
 * Uses shared filter components for consistent UX across the app.
 */

import { useMemo, type ReactElement } from 'react';
import type { BountyStatus } from '@cocuyo/types';
import { FilterDropdown, type FilterOption } from '@/components/FilterDropdown';
import { SearchInput } from '@/components/SearchInput';
import { ResultsSummary } from '@/components/ResultsSummary';

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
  const isFiltered = activeStatus !== null || activeTopics.length > 0 || searchQuery.length > 0;

  const statusOptions = useMemo<FilterOption<BountyStatus | null>[]>(() => [
    { value: null, label: t.all },
    { value: 'open', label: t.statusOpen, color: 'var(--fg-success)' },
    { value: 'fulfilled', label: t.statusFulfilled, color: 'var(--color-firefly-gold)' },
    { value: 'expired', label: t.statusExpired, color: 'var(--fg-tertiary)' },
    { value: 'cancelled', label: t.statusCancelled, color: 'var(--fg-error)' },
  ], [t]);

  const topicOptions = useMemo<FilterOption<string>[]>(() =>
    topics.map((topic) => ({
      value: topic,
      label: topicTranslations[topic] ?? topic,
    })),
  [topics, topicTranslations]);

  const handleClearAll = (): void => {
    onStatusChange(null);
    onTopicsChange([]);
    onSearchChange('');
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
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t.searchPlaceholder}
          className="flex-1 min-w-0"
        />

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-[var(--border-default)]" />

        {/* Topic dropdown */}
        {topics.length > 0 && (
          <FilterDropdown
            placeholder={t.filterByTopic}
            options={topicOptions}
            selected={activeTopics}
            mode="multi"
            onChange={(value) => onTopicsChange(value as readonly string[])}
            selectedLabel={t.topicsSelected}
          />
        )}

        {/* Status dropdown */}
        <FilterDropdown
          placeholder={t.all}
          options={statusOptions}
          selected={activeStatus}
          mode="single"
          onChange={(value) => onStatusChange(value as BountyStatus | null)}
        />
      </div>

      {/* Results summary */}
      <ResultsSummary
        isFiltered={isFiltered}
        filteredCount={filteredCount}
        totalCount={totalCount}
        singularWord={t.bountyWord}
        pluralWord={t.bountiesWord}
        ofWord={t.ofWord}
        clearLabel={t.clearFilters}
        onClear={handleClearAll}
      />
    </div>
  );
}
