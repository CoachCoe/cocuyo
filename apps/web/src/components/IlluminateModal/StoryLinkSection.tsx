'use client';

/**
 * StoryLinkSection — Link post to existing or new story chains.
 *
 * Shows:
 * - Suggested chains based on topics (if any)
 * - "Browse all stories" expandable section
 * - "Create new story" inline form
 */

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useLocale } from 'next-intl';
import type { ChainId, ChainPreview } from '@cocuyo/types';
import { chainService } from '@/lib/services';

interface StoryLinkSectionProps {
  suggestedChains: ChainPreview[];
  selectedChains: ChainId[];
  onChainToggle: (chainId: ChainId) => void;
  onCreateStory: (title: string, description: string) => void;
  isLoadingSuggestions: boolean;
}

type Locale = 'en' | 'es';

export function StoryLinkSection({
  suggestedChains,
  selectedChains,
  onChainToggle,
  onCreateStory,
  isLoadingSuggestions,
}: StoryLinkSectionProps): ReactElement {
  const locale = useLocale() as Locale;
  const [showBrowseAll, setShowBrowseAll] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [allChains, setAllChains] = useState<ChainPreview[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  // New story form state
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDescription, setNewStoryDescription] = useState('');

  // Fetch all chains when "Browse all" is expanded
  useEffect(() => {
    if (showBrowseAll && allChains.length === 0) {
      setIsLoadingAll(true);
      chainService
        .getFeaturedChains(locale)
        .then((chains) => {
          setAllChains([...chains]);
        })
        .catch(() => {
          // Silently fail - user can retry
        })
        .finally(() => {
          setIsLoadingAll(false);
        });
    }
  }, [showBrowseAll, allChains.length, locale]);

  const handleCreateStory = useCallback(() => {
    if (newStoryTitle.trim().length === 0) return;
    onCreateStory(newStoryTitle.trim(), newStoryDescription.trim());
    setNewStoryTitle('');
    setNewStoryDescription('');
    setShowCreateNew(false);
  }, [newStoryTitle, newStoryDescription, onCreateStory]);

  // Combine suggested + all chains, removing duplicates
  const displayChains = showBrowseAll
    ? [...new Map([...suggestedChains, ...allChains].map((c) => [c.id, c])).values()]
    : suggestedChains;

  // Sort: selected first, then by corroboration count
  const sortedChains = [...displayChains].sort((a, b) => {
    const aSelected = selectedChains.includes(a.id);
    const bSelected = selectedChains.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return b.totalCorroborations - a.totalCorroborations;
  });

  const hasSelectedChains = selectedChains.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-primary">
            Link to Story
            {hasSelectedChains && (
              <span className="ml-2 text-xs text-[var(--fg-accent)]">
                ({selectedChains.length} selected)
              </span>
            )}
          </h3>
          <p className="text-xs text-tertiary mt-0.5">
            Connect your post to an ongoing story chain
          </p>
        </div>
      </div>

      {/* Loading suggestions indicator */}
      {isLoadingSuggestions && suggestedChains.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-tertiary">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Finding related stories...
        </div>
      )}

      {/* Chain list */}
      {sortedChains.length > 0 && (
        <div className="space-y-2">
          {sortedChains.slice(0, showBrowseAll ? 20 : 5).map((chain) => {
            const isSelected = selectedChains.includes(chain.id);
            return (
              <label
                key={chain.id}
                className={`
                  flex items-start gap-3 p-3 rounded-nested border cursor-pointer transition-all
                  ${isSelected
                    ? 'bg-surface-nested border-[var(--fg-accent)]/50'
                    : 'bg-surface-nested border-DEFAULT hover:border-emphasis'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onChainToggle(chain.id)}
                  className="mt-0.5 w-4 h-4 rounded border-emphasis bg-surface-muted text-[var(--fg-accent)] focus:ring-[var(--fg-accent)] focus:ring-offset-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-primary truncate block">
                    {chain.title}
                  </span>
                  <div className="flex items-center gap-3 mt-1 text-xs text-tertiary">
                    <span>{chain.postCount} posts</span>
                    <span className="text-[var(--fg-success)]">
                      {chain.totalCorroborations} corroborations
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* Browse all / Create new buttons */}
      <div className="flex flex-wrap gap-2">
        {!showBrowseAll && (
          <button
            type="button"
            onClick={() => setShowBrowseAll(true)}
            className="text-sm text-[var(--fg-accent)] hover:underline"
          >
            {isLoadingAll ? 'Loading...' : 'Browse all stories →'}
          </button>
        )}
        {showBrowseAll && sortedChains.length > 5 && (
          <button
            type="button"
            onClick={() => setShowBrowseAll(false)}
            className="text-sm text-secondary hover:text-primary"
          >
            Show less
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowCreateNew(!showCreateNew)}
          className="text-sm text-[var(--fg-accent)] hover:underline"
        >
          {showCreateNew ? 'Cancel' : '+ Create new story'}
        </button>
      </div>

      {/* Create new story inline form */}
      {showCreateNew && (
        <div className="p-4 bg-surface-nested border border-DEFAULT rounded-nested space-y-3">
          <div>
            <label htmlFor="new-story-title" className="block text-xs font-medium text-secondary mb-1">
              Story Title
            </label>
            <input
              id="new-story-title"
              type="text"
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
              placeholder="Give your story a name..."
              className="w-full px-3 py-2 bg-surface-muted border border-DEFAULT rounded-nested text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-[var(--fg-accent)] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="new-story-desc" className="block text-xs font-medium text-secondary mb-1">
              Description <span className="text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              id="new-story-desc"
              value={newStoryDescription}
              onChange={(e) => setNewStoryDescription(e.target.value)}
              placeholder="What is this story about?"
              rows={2}
              className="w-full px-3 py-2 bg-surface-muted border border-DEFAULT rounded-nested text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-[var(--fg-accent)] transition-colors resize-none"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateStory}
            disabled={newStoryTitle.trim().length === 0}
            className="w-full py-2 px-4 rounded-nested text-sm font-medium bg-[var(--fg-accent)] text-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            Create & Link Story
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoadingSuggestions && sortedChains.length === 0 && !showCreateNew && (
        <p className="text-sm text-tertiary">
          No stories found. Add topics to see suggestions, or create a new story.
        </p>
      )}
    </div>
  );
}
