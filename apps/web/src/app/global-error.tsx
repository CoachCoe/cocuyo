/**
 * Global error page.
 *
 * Displayed when an error occurs in the root layout.
 * Must be a client component and include its own html/body tags.
 */

'use client';

import { useEffect, type ReactElement } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): ReactElement {
  useEffect(() => {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
          <div className="w-20 h-20 mb-8 rounded-full bg-zinc-900 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
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
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            We encountered an unexpected error. This has been noted and
            we&apos;re working on it.
          </p>
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
