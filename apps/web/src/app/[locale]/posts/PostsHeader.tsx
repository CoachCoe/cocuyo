'use client';

/**
 * PostsHeader — Header for the posts page.
 */

import type { ReactElement } from 'react';

export interface PostsHeaderProps {
  title: string;
  description: string;
}

export function PostsHeader({ title, description }: PostsHeaderProps): ReactElement {
  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      <div className="container-wide py-8">
        <h1 className="text-2xl font-display font-medium text-[var(--fg-primary)] mb-2">
          {title}
        </h1>
        <p className="text-[var(--fg-secondary)] text-sm max-w-2xl">
          {description}
        </p>
      </div>
    </header>
  );
}
