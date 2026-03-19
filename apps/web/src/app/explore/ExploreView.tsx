'use client';

/**
 * ExploreView — Client component for the explore page.
 *
 * Map view has been removed as external tile servers are not permitted
 * in the Triangle sandbox environment.
 */

import type { ReactElement, ReactNode } from 'react';

interface ExploreViewProps {
  children: ReactNode; // The list view content (Active Story Chains + Recent Signals)
}

export function ExploreView({ children }: ExploreViewProps): ReactElement {
  return (
    <>
      {/* View Header */}
      <section className="py-6 border-b border-DEFAULT">
        <div className="container-wide">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-nested border border-emphasis bg-surface-nested text-primary">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              List View
            </div>
            <span className="text-sm text-tertiary">
              Map view available in future update
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      {children}
    </>
  );
}
