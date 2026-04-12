'use client';

/**
 * PostActions — Action buttons for post detail page.
 *
 * Provides Extract Claim and Illuminate FAB buttons.
 * Shows different states based on wallet connection.
 */

import { useState, type ReactElement } from 'react';
import { useLocale } from 'next-intl';
import type { Post } from '@cocuyo/types';
import { useSigner } from '@/hooks';
import { useToast } from '@cocuyo/ui';
import { IlluminateFAB } from '@/components/IlluminateFAB';
import { useCorroborateDispute } from '@/components/CorroborateDisputeSheet';
import { useTrustDrawer } from '@/components/TrustDrawer';
import { useAddToStory } from '@/components/AddToStorySheet';
import { useAppState } from '@/components/AppStateProvider';

export interface PostActionsProps {
  post: Post;
  translations: {
    extractClaim: string;
    extracting: string;
    signInToExtract: string;
    claimExtracted: string;
    corroborate: string;
    dispute: string;
    viewTrust: string;
    addToStory: string;
  };
}

export function PostActions({ post, translations: t }: PostActionsProps): ReactElement {
  const { isConnected } = useSigner();
  const { extractClaim } = useAppState();
  const { addToast } = useToast();
  const locale = useLocale();
  const [isExtracting, setIsExtracting] = useState(false);
  const { openSheet: openCorroborateSheet } = useCorroborateDispute();
  const { openDrawer: openTrustDrawer } = useTrustDrawer();
  const { openSheet: openAddToStorySheet } = useAddToStory();

  // Suppress unused locale warning - kept for future i18n routing
  void locale;

  const handleCorroborate = (): void => {
    if (!isConnected) {
      addToast(t.signInToExtract, 'warning');
      return;
    }
    openCorroborateSheet({ post, mode: 'corroborate' });
  };

  const handleDispute = (): void => {
    if (!isConnected) {
      addToast(t.signInToExtract, 'warning');
      return;
    }
    openCorroborateSheet({ post, mode: 'dispute' });
  };

  const handleViewTrust = (): void => {
    openTrustDrawer(post.id);
  };

  const handleAddToStory = (): void => {
    openAddToStorySheet(post.id);
  };

  const handleExtractClaim = async (): Promise<void> => {
    if (!isConnected) {
      addToast(t.signInToExtract, 'warning');
      return;
    }

    setIsExtracting(true);

    try {
      // Extract claim and upload to Bulletin Chain
      const statement = post.content.title ?? post.content.text.slice(0, 200);
      const claim = await extractClaim(post.id, statement);

      if (claim !== null) {
        addToast(t.claimExtracted, 'success');
        // Open trust drawer to show the extracted claim
        openTrustDrawer(post.id);
      } else {
        addToast(t.signInToExtract, 'error');
      }
    } catch {
      addToast(t.signInToExtract, 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <>
      {/* Primary action buttons */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {/* Corroborate */}
        <button
          type="button"
          onClick={handleCorroborate}
          className="border-[var(--fg-success)]/30 hover:bg-[var(--fg-success)]/10 inline-flex items-center gap-2 rounded-nested border px-4 py-2.5 text-sm font-medium text-[var(--fg-success)] transition-colors"
        >
          <span aria-hidden="true">&#9673;</span>
          <span>{t.corroborate}</span>
        </button>

        {/* Dispute */}
        <button
          type="button"
          onClick={handleDispute}
          className="border-[var(--fg-error)]/30 hover:bg-[var(--fg-error)]/10 inline-flex items-center gap-2 rounded-nested border px-4 py-2.5 text-sm font-medium text-[var(--fg-error)] transition-colors"
        >
          <span aria-hidden="true">&#9651;</span>
          <span>{t.dispute}</span>
        </button>

        {/* View Trust */}
        <button
          type="button"
          onClick={handleViewTrust}
          className="inline-flex items-center gap-2 rounded-nested border border-[var(--border-default)] px-4 py-2.5 text-sm font-medium text-[var(--fg-secondary)] transition-colors hover:border-[var(--fg-accent)] hover:text-[var(--fg-accent)]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>{t.viewTrust}</span>
        </button>

        {/* Add to Story */}
        <button
          type="button"
          onClick={handleAddToStory}
          className="inline-flex items-center gap-2 rounded-nested border border-[var(--border-default)] px-4 py-2.5 text-sm font-medium text-[var(--fg-secondary)] transition-colors hover:border-[var(--fg-accent)] hover:text-[var(--fg-accent)]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span>{t.addToStory}</span>
        </button>

        {/* Extract Claim */}
        <button
          type="button"
          onClick={() => {
            void handleExtractClaim();
          }}
          disabled={isExtracting}
          className={`inline-flex items-center gap-2 rounded-nested border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            isConnected
              ? 'border-[var(--color-firefly-gold)]/30 hover:bg-[var(--color-firefly-gold)]/10 text-[var(--color-firefly-gold)]'
              : 'border-[var(--border-default)] text-[var(--fg-secondary)]'
          } ${isExtracting ? 'cursor-wait opacity-70' : ''} `}
        >
          {isExtracting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>{t.extracting}</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span>{t.extractClaim}</span>
            </>
          )}
        </button>
      </div>

      {/* Floating action button */}
      <IlluminateFAB />
    </>
  );
}
