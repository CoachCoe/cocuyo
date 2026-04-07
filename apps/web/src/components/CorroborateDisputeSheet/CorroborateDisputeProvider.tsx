'use client';

/**
 * CorroborateDisputeProvider — Context for managing the corroborate/dispute sheet.
 *
 * Tracks which post is being corroborated/disputed and the mode.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  type ReactElement,
} from 'react';
import type { Post, BountyId, PUSDAmount } from '@cocuyo/types';

/** Bounty info for display in the sheet */
export interface SheetBountyInfo {
  readonly id: BountyId;
  readonly title: string;
  readonly fundingAmount: PUSDAmount;
}

/** Mode of the sheet */
export type CorroborateDisputeMode = 'corroborate' | 'dispute';

/** Options for opening the sheet */
export interface OpenSheetOptions {
  post: Post;
  mode: CorroborateDisputeMode;
  bounty?: SheetBountyInfo;
}

interface CorroborateDisputeContextValue {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** The post being corroborated/disputed */
  post: Post | null;
  /** The mode (corroborate or dispute) */
  mode: CorroborateDisputeMode;
  /** Optional bounty info */
  bounty: SheetBountyInfo | null;
  /** Open the sheet */
  openSheet: (options: OpenSheetOptions) => void;
  /** Close the sheet */
  closeSheet: () => void;
}

const CorroborateDisputeContext = createContext<CorroborateDisputeContextValue | null>(null);

interface CorroborateDisputeProviderProps {
  children: ReactNode;
}

export function CorroborateDisputeProvider({ children }: CorroborateDisputeProviderProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [mode, setMode] = useState<CorroborateDisputeMode>('corroborate');
  const [bounty, setBounty] = useState<SheetBountyInfo | null>(null);

  const openSheet = useCallback((options: OpenSheetOptions): void => {
    setPost(options.post);
    setMode(options.mode);
    setBounty(options.bounty ?? null);
    setIsOpen(true);
  }, []);

  const closeSheet = useCallback((): void => {
    setIsOpen(false);
    // Clear state after animation completes
    setTimeout(() => {
      setPost(null);
      setBounty(null);
    }, 200);
  }, []);

  const value = useMemo(
    (): CorroborateDisputeContextValue => ({
      isOpen,
      post,
      mode,
      bounty,
      openSheet,
      closeSheet,
    }),
    [isOpen, post, mode, bounty, openSheet, closeSheet]
  );

  return (
    <CorroborateDisputeContext.Provider value={value}>
      {children}
    </CorroborateDisputeContext.Provider>
  );
}

/**
 * Hook to access the corroborate/dispute sheet context.
 */
export function useCorroborateDispute(): CorroborateDisputeContextValue {
  const ctx = useContext(CorroborateDisputeContext);
  if (ctx === null) {
    throw new Error('useCorroborateDispute must be used within a CorroborateDisputeProvider');
  }
  return ctx;
}
