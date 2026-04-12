'use client';

/**
 * ExtractClaimProvider — Context for managing the extract claim sheet.
 *
 * Tracks which post is having a claim extracted from it.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
  type ReactElement,
} from 'react';
import type { PostId } from '@cocuyo/types';

interface ExtractClaimContextValue {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** The post ID to extract a claim from */
  postId: PostId | null;
  /** Open the sheet */
  openSheet: (postId: PostId) => void;
  /** Close the sheet */
  closeSheet: () => void;
}

const ExtractClaimContext = createContext<ExtractClaimContextValue | null>(null);

interface ExtractClaimProviderProps {
  children: ReactNode;
}

export function ExtractClaimProvider({ children }: ExtractClaimProviderProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [postId, setPostId] = useState<PostId | null>(null);

  // Track timeout for cleanup
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current !== null) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  const openSheet = useCallback((id: PostId): void => {
    // Cancel any pending clear timeout when reopening
    if (clearTimeoutRef.current !== null) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    setPostId(id);
    setIsOpen(true);
  }, []);

  const closeSheet = useCallback((): void => {
    setIsOpen(false);
    // Clear state after animation completes
    clearTimeoutRef.current = setTimeout(() => {
      setPostId(null);
      clearTimeoutRef.current = null;
    }, 200);
  }, []);

  const value = useMemo(
    (): ExtractClaimContextValue => ({
      isOpen,
      postId,
      openSheet,
      closeSheet,
    }),
    [isOpen, postId, openSheet, closeSheet]
  );

  return <ExtractClaimContext.Provider value={value}>{children}</ExtractClaimContext.Provider>;
}

/**
 * Hook to access the extract claim sheet context.
 */
export function useExtractClaim(): ExtractClaimContextValue {
  const ctx = useContext(ExtractClaimContext);
  if (ctx === null) {
    throw new Error('useExtractClaim must be used within an ExtractClaimProvider');
  }
  return ctx;
}
