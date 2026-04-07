'use client';

/**
 * PostCard — Display component for a post preview.
 *
 * The post card shows key information at a glance:
 * - Title (optional, 2-line truncate)
 * - Excerpt from content
 * - Topics and location tags
 * - Corroboration and challenge counts
 */

import type { ReactElement } from 'react';
import type { PostPreview, PostId } from '@cocuyo/types';

export interface PostCardTranslations {
  corroborationWord: string;
  corroborationsWord: string;
  challengeWord: string;
  challengesWord: string;
  readMore: string;
}

export interface PostCardProps {
  /** The post preview to display */
  post: PostPreview;
  /** Callback when the card is clicked */
  onClick?: (postId: PostId) => void;
  /** Translation strings */
  translations?: PostCardTranslations;
  /** Topic slug to translated name map */
  topicTranslations?: Record<string, string>;
}

/**
 * Format count with proper pluralization.
 */
function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Format relative time.
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  // Handle both millisecond and second timestamps
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = now - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return minutes <= 1 ? 'just now' : `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  return new Date(ts).toLocaleDateString();
}

export function PostCard({
  post,
  onClick,
  translations: t,
  topicTranslations,
}: PostCardProps): ReactElement {
  const { id, title, excerpt, topics, locationName, corroborationCount, challengeCount, createdAt } = post;

  const handleClick = (): void => {
    onClick?.(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(id);
    }
  };

  return (
    <article
      className={`
        bg-[var(--bg-surface-nested)] border border-[var(--border-default)]
        rounded-container p-6 transition-all duration-200 ease-out
        ${onClick !== undefined ? 'cursor-pointer hover:border-[var(--color-firefly-gold)]/40 hover:shadow-[0_4px_20px_rgba(232,185,49,0.08)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none' : ''}
      `}
      onClick={onClick !== undefined ? handleClick : undefined}
      onKeyDown={onClick !== undefined ? handleKeyDown : undefined}
      tabIndex={onClick !== undefined ? 0 : undefined}
      role={onClick !== undefined ? 'button' : undefined}
      aria-label={title !== undefined ? `Post: ${title}` : 'Post'}
    >
      {/* Title - 2 line truncate (only shown if present) */}
      {title !== undefined && (
        <h3 className="text-lg font-medium text-[var(--fg-primary)] leading-snug mb-2 line-clamp-2">
          {title}
        </h3>
      )}

      {/* Excerpt - 3 line truncate */}
      <p className="text-sm text-[var(--fg-secondary)] leading-relaxed mb-4 line-clamp-3">
        {excerpt}
      </p>

      {/* Topics and location tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {topics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-container)] text-[var(--fg-secondary)]"
          >
            {topicTranslations?.[topic] ?? topic.replace(/-/g, ' ')}
          </span>
        ))}
        {locationName !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-container)] text-[var(--fg-tertiary)]">
            {locationName}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm border-t border-[var(--border-subtle)] pt-4">
        <div className="flex items-center gap-4 text-[var(--fg-secondary)]">
          <span className="flex items-center gap-1">
            <span className="text-[var(--fg-success)]" aria-hidden="true">&#9673;</span>
            {formatCount(corroborationCount, t?.corroborationWord ?? 'corroboration', t?.corroborationsWord ?? 'corroborations')}
          </span>
          {challengeCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-[var(--fg-error)]" aria-hidden="true">&#9651;</span>
              {formatCount(challengeCount, t?.challengeWord ?? 'challenge', t?.challengesWord ?? 'challenges')}
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--fg-tertiary)]">
          {formatRelativeTime(createdAt)}
        </span>
      </div>
    </article>
  );
}
