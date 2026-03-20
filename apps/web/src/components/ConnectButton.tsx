'use client';

/**
 * Connect Button component.
 *
 * Shows identity status and provides navigation to onboarding or profile.
 */

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useTriangleAccount } from '@/hooks/useTriangleAccount';
import { useIdentity } from '@/hooks/useIdentity';

export function ConnectButton(): ReactNode {
  const { isConnected, isInHost } = useTriangleAccount();
  const { status, profile } = useIdentity();
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Not in Triangle host - show nothing (standalone mode)
  // In host but not connected - show nothing (Triangle handles sign-in UI)
  if (!isInHost || !isConnected) {
    return null;
  }

  // Loading state
  if (status === 'loading') {
    return (
      <span className="px-4 py-2 text-sm text-[var(--fg-tertiary)]">
        Loading...
      </span>
    );
  }

  // Needs to complete onboarding
  if (status === 'no-credential' || status === 'no-profile') {
    return (
      <>
        <button
          onClick={() => setShowComingSoon(true)}
          className="px-4 py-2 text-sm font-medium border border-[var(--color-firefly-gold)] text-[var(--color-firefly-gold)] rounded-[var(--radius-nested)] hover:bg-[var(--color-firefly-gold)]/10 transition-colors"
        >
          Complete Setup
        </button>

        {/* Coming Soon Modal */}
        {showComingSoon && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setShowComingSoon(false)}
          >
            <div
              className="max-w-md w-full mx-4 p-6 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-[var(--radius-container)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[var(--color-firefly-gold-glow)]">
                  <svg
                    className="w-6 h-6 text-[var(--color-firefly-gold)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m0 0v2m0-2h2m-2 0H10m5-6a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-[var(--fg-primary)] mb-2">
                  Coming Soon
                </h3>

                <p className="text-[var(--fg-secondary)] text-sm mb-4">
                  Identity verification will be available once DIM (Decentralized
                  Identity Module) integration is complete. This ensures every
                  participant is a verified human while preserving full anonymity.
                </p>

                <div className="p-3 bg-[var(--bg-surface-nested)] rounded-[var(--radius-nested)] mb-6 text-left">
                  <p className="text-xs text-[var(--fg-tertiary)] mb-2">
                    What you'll be able to do:
                  </p>
                  <ul className="text-sm text-[var(--fg-secondary)] space-y-1">
                    <li>• Verify your humanity (anonymously)</li>
                    <li>• Create a pseudonymous identity</li>
                    <li>• Illuminate signals to the network</li>
                    <li>• Corroborate or challenge observations</li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowComingSoon(false)}
                  className="w-full px-4 py-2.5 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-medium rounded-[var(--radius-nested)] hover:brightness-110 transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fully set up - show profile
  if (profile != null) {
    const initial = profile.pseudonym.charAt(0).toUpperCase();

    return (
      <Link
        href="/profile"
        className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-nested)] hover:bg-[var(--bg-surface-nested)] transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-nested)] border border-[var(--border-default)] flex items-center justify-center text-sm font-medium text-[var(--fg-primary)]">
          {initial}
        </div>
        <span className="text-sm font-medium text-[var(--fg-primary)]">
          {profile.pseudonym}
        </span>
      </Link>
    );
  }

  return null;
}
