'use client';

/**
 * AddToStorySheet — Sheet for adding a post to a story chain.
 *
 * Two modes:
 * - Create new story with title and description
 * - Add to existing story from user's stories
 */

import { useEffect, useRef, useCallback, useState, type ReactElement } from 'react';
import type { ChainId } from '@cocuyo/types';
import { useAddToStory } from './AddToStoryProvider';
import { useAppState } from '@/components/AppStateProvider';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Mode = 'select' | 'create';

export function AddToStorySheet(): ReactElement | null {
  const { isOpen, postId, closeSheet } = useAddToStory();
  const { getPost, getAllStories, createStory, addPostToStory } = useAppState();
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Get data
  const post = postId !== null ? getPost(postId) : undefined;
  const stories = getAllStories();

  // Form state
  const [mode, setMode] = useState<Mode>('select');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen) {
      setMode(stories.length > 0 ? 'select' : 'create');
      setTitle('');
      setDescription('');
      setIsSubmitting(false);
    }
  }, [isOpen, stories.length]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeSheet();
      }
    },
    [closeSheet]
  );

  // Handle click outside
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget) {
        closeSheet();
      }
    },
    [closeSheet]
  );

  // Setup event listeners
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      const firstFocusable =
        sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable !== null && firstFocusable !== undefined) {
        firstFocusable.focus();
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';

        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
    return undefined;
  }, [isOpen, handleKeyDown]);

  // Handle creating a new story
  const handleCreateStory = useCallback((): void => {
    if (postId === null || title.trim().length === 0) return;

    setIsSubmitting(true);
    const result = createStory(title.trim(), description.trim(), postId);

    if (result !== null) {
      closeSheet();
    } else {
      setIsSubmitting(false);
    }
  }, [postId, title, description, createStory, closeSheet]);

  // Handle adding to existing story
  const handleAddToStory = useCallback(
    (chainId: ChainId): void => {
      if (postId === null) return;

      setIsSubmitting(true);
      const success = addPostToStory(chainId, postId);

      if (success) {
        closeSheet();
      } else {
        setIsSubmitting(false);
      }
    },
    [postId, addPostToStory, closeSheet]
  );

  if (!isOpen || post === undefined || postId === null) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-story-title"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm animate-backdrop-in"
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-surface-nested border border-DEFAULT rounded-t-container sm:rounded-container shadow-3 animate-slide-up sm:animate-scale-in"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-surface-nested border-b border-DEFAULT">
          <h2
            id="add-to-story-title"
            className="text-xl font-bold text-primary"
          >
            Add to Story
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            className="p-2 text-secondary hover:text-primary transition-colors rounded-nested hover:bg-surface-hover"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Post preview */}
          <div className="p-4 rounded-nested bg-surface-container border border-subtle">
            {post.content.title !== undefined && (
              <p className="text-sm font-medium text-primary mb-1">{post.content.title}</p>
            )}
            <p className="text-sm text-secondary line-clamp-2">
              {post.content.text}
            </p>
          </div>

          {/* Mode tabs */}
          {stories.length > 0 && (
            <div className="flex gap-2 border-b border-subtle">
              <button
                type="button"
                onClick={() => setMode('select')}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  mode === 'select'
                    ? 'border-[var(--fg-accent)] text-[var(--fg-accent)]'
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                Existing Stories
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  mode === 'create'
                    ? 'border-[var(--fg-accent)] text-[var(--fg-accent)]'
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                New Story
              </button>
            </div>
          )}

          {/* Select existing story */}
          {mode === 'select' && stories.length > 0 && (
            <div className="space-y-3">
              {stories.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => handleAddToStory(story.id)}
                  disabled={isSubmitting || story.postIds.includes(postId)}
                  className="w-full p-4 rounded-nested bg-surface-container border border-subtle text-left hover:border-[var(--fg-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="text-sm font-medium text-primary">{story.title}</p>
                  <p className="text-xs text-tertiary mt-1">
                    {story.stats.postCount} posts
                    {story.postIds.includes(postId) && ' • Already in this story'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Create new story form */}
          {mode === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Story Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your story a name..."
                  className="w-full px-4 py-3 rounded-nested bg-surface-container border border-DEFAULT text-primary placeholder:text-tertiary focus:outline-none focus:border-[var(--fg-accent)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Description
                  <span className="text-tertiary font-normal"> (optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this story about?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-nested bg-surface-container border border-DEFAULT text-primary placeholder:text-tertiary focus:outline-none focus:border-[var(--fg-accent)] transition-colors resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateStory}
                disabled={title.trim().length === 0 || isSubmitting}
                className="w-full py-3 px-6 rounded-nested font-medium bg-[var(--fg-accent)] text-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Story'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
