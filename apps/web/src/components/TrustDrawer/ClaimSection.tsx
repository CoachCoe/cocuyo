'use client';

/**
 * ClaimSection — Display claims extracted from a post in the TrustDrawer.
 *
 * Shows existing claims and provides a button to open the ExtractClaimSheet
 * for adding new claims.
 */

import type { ReactElement } from 'react';
import type { Claim, Verdict, PostId } from '@cocuyo/types';
import { useExtractClaim } from '@/components/ExtractClaimSheet';

interface ClaimSectionProps {
  claims: Claim[];
  /** Verdicts for the claims (currently displayed inline via claim.verdict) */
  verdicts: Verdict[];
  postId: PostId;
}

// Note: verdicts prop is kept for future use when we want to show verdicts
// from multiple sources. Currently we display claim.verdict inline.

/** Map claim status to display info */
const STATUS_DISPLAY: Record<Claim['status'], { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'var(--fg-tertiary)' },
  under_review: { label: 'Under Review', color: 'var(--fg-secondary)' },
  verified: { label: 'Verified', color: 'var(--fg-success)' },
  disputed: { label: 'Disputed', color: 'var(--fg-warning)' },
  false: { label: 'False', color: 'var(--fg-error)' },
  unverifiable: { label: 'Unverifiable', color: 'var(--fg-tertiary)' },
};

export function ClaimSection({ claims, verdicts: _verdicts, postId }: ClaimSectionProps): ReactElement {
  const { openSheet } = useExtractClaim();

  const handleExtractClaim = (): void => {
    openSheet(postId);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-primary flex items-center gap-2">
          <span>Claims ({claims.length})</span>
        </h3>
        <button
          type="button"
          onClick={handleExtractClaim}
          className="text-xs text-[var(--fg-accent)] hover:underline"
        >
          + Extract claim
        </button>
      </div>

      {/* Claims list */}
      {claims.length > 0 ? (
        <div className="space-y-3">
          {claims.map((claim) => {
            const status = STATUS_DISPLAY[claim.status];
            const verdict = claim.verdict;

            return (
              <div
                key={claim.id}
                className="p-4 rounded-nested bg-surface-container border border-subtle"
              >
                <p className="text-sm text-primary mb-2">{claim.statement}</p>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${status.color} 15%, transparent)`,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </span>
                  {claim.evidence.length > 0 && (
                    <span className="text-xs text-tertiary">
                      {claim.evidence.length} evidence
                    </span>
                  )}
                </div>

                {/* Verdict reasoning */}
                {verdict !== undefined && (
                  <div className="mt-3 pt-3 border-t border-subtle">
                    <p className="text-xs text-tertiary mb-1">Verdict reasoning:</p>
                    <p className="text-sm text-secondary">{verdict.reasoning}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-tertiary">
          No claims extracted yet. Extract a claim to enable fact-checking.
        </p>
      )}
    </section>
  );
}
