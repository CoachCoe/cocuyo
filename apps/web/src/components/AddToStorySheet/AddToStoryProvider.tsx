'use client';

/**
 * AddToStoryProvider — Context for managing the add to story sheet.
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

interface AddToStoryContextValue {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** The post ID to add to a story */
  postId: PostId | null;
  /** Open the sheet for a specific post */
  openSheet: (postId: PostId) => void;
  /** Close the sheet */
  closeSheet: () => void;
}

const AddToStoryContext = createContext<AddToStoryContextValue | null>(null);

interface AddToStoryProviderProps {
  children: ReactNode;
}

export function AddToStoryProvider({ children }: AddToStoryProviderProps): ReactElement {
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
    clearTimeoutRef.current = setTimeout(() => {
      setPostId(null);
      clearTimeoutRef.current = null;
    }, 200);
  }, []);

  const value = useMemo(
    (): AddToStoryContextValue => ({
      isOpen,
      postId,
      openSheet,
      closeSheet,
    }),
    [isOpen, postId, openSheet, closeSheet]
  );

  return <AddToStoryContext.Provider value={value}>{children}</AddToStoryContext.Provider>;
}

/**
 * Hook to access the add to story sheet context.
 */
export function useAddToStory(): AddToStoryContextValue {
  const ctx = useContext(AddToStoryContext);
  if (ctx === null) {
    throw new Error('useAddToStory must be used within an AddToStoryProvider');
  }
  return ctx;
}
