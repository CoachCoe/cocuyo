'use client';

/**
 * PostActions — Action buttons for post detail page.
 *
 * Provides Extract Claim and Illuminate FAB buttons.
 * Shows different states based on wallet connection.
 */

import { useState, type ReactElement } from 'react';
import type { PostId } from '@cocuyo/types';
import { useSigner } from '@/hooks';
import { useToast } from '@cocuyo/ui';
import { IlluminateFAB } from '@/components/IlluminateFAB';

export interface PostActionsProps {
  postId: PostId;
  postTitle: string;
  translations: {
    extractClaim: string;
    signInToExtract: string;
    claimExtracted: string;
  };
}

export function PostActions({
  postId: _postId,
  postTitle: _postTitle,
  translations: t,
}: PostActionsProps): ReactElement {
  const { isConnected } = useSigner();
  const { addToast } = useToast();
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractClaim = async (): Promise<void> => {
    if (!isConnected) {
      addToast(t.signInToExtract, 'warning');
      return;
    }

    setIsExtracting(true);

    // Simulate extraction (would integrate with claim service)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addToast(t.claimExtracted, 'success');
    setIsExtracting(false);
  };

  return (
    <>
      {/* Extract Claim button */}
      <div className="flex justify-center mb-8">
        <button
          type="button"
          onClick={() => { void handleExtractClaim(); }}
          disabled={isExtracting}
          className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-full
            font-medium text-sm transition-all duration-200
            ${isConnected
              ? 'bg-[var(--color-firefly-gold)] text-[var(--bg-primary)] hover:shadow-[0_4px_20px_rgba(232,185,49,0.4)] hover:scale-105 active:scale-100'
              : 'bg-[var(--bg-surface-nested)] text-[var(--fg-secondary)] border border-[var(--border-default)]'
            }
            ${isExtracting ? 'opacity-70 cursor-wait' : ''}
          `}
        >
          {isExtracting ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Extracting...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
