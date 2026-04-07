/**
 * Error page for the locale routes.
 *
 * Displayed when an unhandled error occurs.
 * Must be a client component to use useEffect for error logging.
 */

'use client';

import { useEffect, type ReactElement } from 'react';
import { Button } from '@cocuyo/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps): ReactElement {
  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 mb-8 rounded-full bg-[var(--bg-surface-container)] flex items-center justify-center">
        <svg
          className="w-10 h-10 text-[var(--fg-error)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-[var(--fg-primary)] mb-2">
        Something went wrong
      </h1>
      <p className="text-[var(--fg-secondary)] mb-8 max-w-md">
        We encountered an unexpected error. This has been noted and we&apos;re
        working on it.
      </p>
      <Button variant="primary" onClick={reset}>
        Try again
      </Button>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 text-left w-full max-w-lg">
          <summary className="cursor-pointer text-sm text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)]">
            Error details
          </summary>
          <pre className="mt-2 p-4 bg-[var(--bg-surface-container)] rounded-nested text-xs text-[var(--fg-error)] overflow-x-auto">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
