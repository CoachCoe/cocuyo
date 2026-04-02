/**
 * Search Page — Full-text search across signals.
 */

'use client';

import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { VerificationBadge } from '@cocuyo/ui';
import { getSignals } from '@/lib/services/mock-data';
import type { Signal } from '@cocuyo/types';

const ALL_TOPICS = [
  'environmental',
  'water-quality',
  'local-government',
  'public-records',
  'development',
  'expertise',
  'health',
  'education',
] as const;

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = now - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function highlightMatch(text: string, query: string): ReactNode {
  if (query.trim() === '') return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[var(--color-firefly-gold)]/30 text-[var(--fg-primary)]">{part}</mark>
    ) : (
      part
    )
  );
}

export default function SearchPage(): ReactNode {
  const [query, setQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Note: Search page is client-side, so we use 'en' locale for now
  // A proper implementation would get locale from context/params
  const allSignals = useMemo(() => getSignals('en'), []);

  const results = useMemo((): Signal[] => {
    let filtered = allSignals;

    // Filter by query
    if (query.trim() !== '') {
      const q = query.toLowerCase();
      filtered = filtered.filter((signal) =>
        signal.content.text.toLowerCase().includes(q) ||
        signal.author.pseudonym.toLowerCase().includes(q) ||
        (signal.context.locationName?.toLowerCase().includes(q) ?? false)
      );
    }

    // Filter by topics
    if (selectedTopics.length > 0) {
      filtered = filtered.filter((signal) =>
        signal.context.topics.some((t) => selectedTopics.includes(t))
      );
    }

    return filtered;
  }, [query, selectedTopics, allSignals]);

  const toggleTopic = (topic: string): void => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((t) => t !== topic);
      }
      return [...prev, topic];
    });
  };

  const clearFilters = (): void => {
    setQuery('');
    setSelectedTopics([]);
  };

  const hasFilters = query.trim() !== '' || selectedTopics.length > 0;

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--fg-primary)] mb-6">Search Signals</h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search signals, authors, locations..."
            className="w-full px-3 py-2.5 pl-10 sm:px-4 sm:py-3 sm:pl-11 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)] text-base"
          />
          <svg
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--fg-tertiary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Topic Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[var(--fg-secondary)]">Filter by topic</h2>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-xs text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)]">
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => toggleTopic(topic)}
                className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                  selectedTopics.includes(topic)
                    ? 'bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)]'
                    : 'bg-[var(--bg-surface-nested)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
                }`}
              >
                {topic.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <p className="text-sm text-[var(--fg-tertiary)]">
            {results.length} {results.length === 1 ? 'result' : 'results'}
            {hasFilters && ' matching your filters'}
          </p>

          {results.length === 0 ? (
            <div className="p-8 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container text-center">
              <p className="text-[var(--fg-secondary)]">No signals found.</p>
              {hasFilters && (
                <button type="button" onClick={clearFilters} className="mt-2 text-sm text-[var(--color-firefly-gold)] hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            results.map((signal) => (
              <Link
                key={signal.id}
                href={`/signal/${signal.id}`}
                className="block p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container hover:border-[var(--border-emphasis)] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-container)] border border-[var(--border-default)] flex items-center justify-center text-sm font-medium text-[var(--fg-primary)]">
                      {signal.author.pseudonym.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-[var(--fg-primary)]">
                        {query.trim() !== '' ? highlightMatch(signal.author.pseudonym, query) : signal.author.pseudonym}
                      </span>
                      {signal.context.locationName !== undefined && (
                        <span className="text-sm text-[var(--fg-tertiary)]">
                          {' '}&middot; {query.trim() !== '' ? highlightMatch(signal.context.locationName, query) : signal.context.locationName}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--fg-tertiary)]">{formatRelativeTime(signal.createdAt)}</span>
                </div>

                <p className="text-[var(--fg-primary)] mb-3 line-clamp-2">
                  {query.trim() !== '' ? highlightMatch(signal.content.text, query) : signal.content.text}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {signal.context.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                          selectedTopics.includes(topic)
                            ? 'bg-[var(--color-firefly-gold)]/20 text-[var(--color-firefly-gold)]'
                            : 'bg-[var(--bg-surface-container)] text-[var(--fg-tertiary)]'
                        }`}
                      >
                        {topic.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                  <VerificationBadge status={signal.verification.status} size="sm" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
