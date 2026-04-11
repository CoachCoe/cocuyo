'use client';

/**
 * TrustDrawer — Detailed verification information for a post.
 *
 * Responsive: bottom sheet on mobile, side drawer on desktop.
 * Shows claims, evidence, verdicts, and campaign information.
 */

import { useEffect, useRef, useCallback, type ReactElement } from 'react';
import type { Verdict } from '@cocuyo/types';
import { formatPUSDCompact } from '@cocuyo/types';
import { useTrustDrawer } from './TrustDrawerProvider';
import { useAppState } from '@/components/AppStateProvider';
import { ClaimSection } from './ClaimSection';
import { EvidenceSection } from './EvidenceSection';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function TrustDrawer(): ReactElement | null {
  const { isOpen, postId, closeDrawer } = useTrustDrawer();
  const { getPost, getPostClaims, getPostCorroborations, getPostCampaigns, claimVerdicts, verdicts } = useAppState();
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Get data for the post
  const post = postId !== null ? getPost(postId) : undefined;
  const claims = postId !== null ? getPostClaims(postId) : [];
  const corroborations = postId !== null ? getPostCorroborations(postId) : [];
  const campaigns = postId !== null ? getPostCampaigns(postId) : [];

  // Get verdicts for claims
  const claimVerdictsData = claims.map((claim) => {
    const verdictId = claimVerdicts.get(claim.id);
    return verdictId !== undefined && verdictId !== null ? verdicts.get(verdictId) : undefined;
  }).filter((v): v is Verdict => v !== undefined);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeDrawer();
        return;
      }

      // Focus trap
      if (event.key === 'Tab' && drawerRef.current !== null) {
        const focusableElements =
          drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (focusableElements.length === 0) return;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [closeDrawer]
  );

  // Handle click outside
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget) {
        closeDrawer();
      }
    },
    [closeDrawer]
  );

  // Setup event listeners
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      const firstFocusable =
        drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable !== null && firstFocusable !== undefined) {
        firstFocusable.focus();
      } else {
        drawerRef.current?.focus();
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

  if (!isOpen || post === undefined) {
    return null;
  }

  // Split corroborations into supporting and challenging
  const supporting = corroborations.filter((c) => c.type !== 'challenge');
  const challenging = corroborations.filter((c) => c.type === 'challenge');

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trust-drawer-title"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm animate-backdrop-in"
        aria-hidden="true"
      />

      {/* Drawer - full screen bottom sheet on mobile, side drawer on desktop */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-md h-full overflow-y-auto bg-surface-nested border-l border-DEFAULT shadow-3 animate-slide-in-right"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-surface-nested border-b border-DEFAULT">
          <h2
            id="trust-drawer-title"
            className="text-xl font-bold text-primary"
          >
            Trust & Verification
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 text-secondary hover:text-primary transition-colors rounded-nested hover:bg-surface-hover"
            aria-label="Close drawer"
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
          {/* Post summary */}
          <div className="p-4 rounded-nested bg-surface-container border border-subtle">
            {post.content.title !== undefined && (
              <h3 className="font-medium text-primary mb-2">{post.content.title}</h3>
            )}
            <p className="text-sm text-secondary line-clamp-3">
              {post.content.text}
            </p>
            <p className="text-xs text-tertiary mt-2">
              by {post.author.pseudonym}
            </p>
          </div>

          {/* Campaigns */}
          {campaigns.length > 0 && (
            <section>
              <h3 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                <span className="text-[var(--color-firefly-gold)]">💰</span>
                Active Campaigns
              </h3>
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-4 rounded-nested bg-[var(--color-firefly-gold)]/10 border border-[var(--color-firefly-gold)]/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--color-firefly-gold)]">
                        {campaign.title}
                      </span>
                      <span className="text-sm font-bold text-[var(--color-firefly-gold)]">
                        {formatPUSDCompact(campaign.fundingAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-secondary">{campaign.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Claims */}
          <ClaimSection claims={claims} verdicts={claimVerdictsData} postId={post.id} />

          {/* Evidence - Supporting */}
          {supporting.length > 0 && (
            <EvidenceSection
              title="Corroborating Evidence"
              type="supporting"
              corroborations={supporting}
            />
          )}

          {/* Evidence - Challenging */}
          {challenging.length > 0 && (
            <EvidenceSection
              title="Challenging Evidence"
              type="challenging"
              corroborations={challenging}
            />
          )}

          {/* Empty state */}
          {claims.length === 0 && corroborations.length === 0 && campaigns.length === 0 && (
            <div className="text-center py-8">
              <p className="text-secondary text-sm">
                No verification activity yet
              </p>
              <p className="text-tertiary text-xs mt-1">
                Be the first to corroborate or dispute this post
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
