'use client';

/**
 * Connect Button component.
 *
 * Shows identity status and provides navigation to onboarding or profile.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTriangleAccount } from '@/hooks/useTriangleAccount';
import { useIdentity } from '@/hooks/useIdentity';

export function ConnectButton(): ReactNode {
  const { isConnected, isInHost } = useTriangleAccount();
  const { status, profile } = useIdentity();

  // Not in Triangle host - show guidance
  if (!isInHost) {
    return (
      <span className="px-4 py-2 text-sm text-[var(--fg-secondary)]">
        Open in Triangle
      </span>
    );
  }

  // In host but not connected
  if (!isConnected) {
    return (
      <span className="px-4 py-2 text-sm text-[var(--fg-secondary)]">
        Sign in to Triangle
      </span>
    );
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
      <Link
        href="/onboarding"
        className="px-4 py-2 text-sm font-medium border border-[var(--color-firefly-gold)] text-[var(--color-firefly-gold)] rounded-[var(--radius-nested)] hover:bg-[var(--color-firefly-gold)]/10 transition-colors"
      >
        Complete Setup
      </Link>
    );
  }

  // Fully set up - show profile
  if (profile) {
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
