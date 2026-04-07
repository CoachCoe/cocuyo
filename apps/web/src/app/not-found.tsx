/**
 * 404 Not Found page.
 *
 * Displayed when a route doesn't exist.
 */

import type { ReactElement } from 'react';
import Link from 'next/link';
import { Button } from '@cocuyo/ui';

export default function NotFound(): ReactElement {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg-default)] text-[var(--fg-primary)]">
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <div className="w-20 h-20 mb-8 rounded-full bg-[var(--bg-surface-container)] flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[var(--fg-tertiary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-[var(--fg-primary)] mb-4">
            404
          </h1>
          <h2 className="text-xl font-semibold text-[var(--fg-primary)] mb-2">
            Page not found
          </h2>
          <p className="text-[var(--fg-secondary)] mb-8 max-w-md">
            The signal you&apos;re looking for has faded into the dark. It may
            have been moved or no longer exists.
          </p>
          <Link href="/">
            <Button variant="primary">Return home</Button>
          </Link>
        </div>
      </body>
    </html>
  );
}
