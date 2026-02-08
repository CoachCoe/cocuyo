'use client';

/**
 * IlluminateProvider — Context provider for the Illuminate modal.
 *
 * Manages modal open/close state and pre-selected chain/bounty IDs.
 * Used by components throughout the app to trigger the Illuminate flow.
 */

import {
  createContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  type ReactElement,
} from 'react';
import type { ChainId, BountyId } from '@cocuyo/types';

export interface IlluminateModalOptions {
  /** Pre-select a story chain to link the signal to */
  chainId?: ChainId;
  /** Pre-select a bounty to contribute to */
  bountyId?: BountyId;
}

export interface IlluminateContextValue {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Pre-selected chain ID (if opening from a chain page) */
  preSelectedChainId: ChainId | null;
  /** Pre-selected bounty ID (if opening from a bounty page) */
  preSelectedBountyId: BountyId | null;
  /** Open the illuminate modal */
  openModal: (options?: IlluminateModalOptions) => void;
  /** Close the illuminate modal */
  closeModal: () => void;
}

export const IlluminateContext = createContext<IlluminateContextValue | null>(null);

interface IlluminateProviderProps {
  children: ReactNode;
}

export function IlluminateProvider({ children }: IlluminateProviderProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [preSelectedChainId, setPreSelectedChainId] = useState<ChainId | null>(null);
  const [preSelectedBountyId, setPreSelectedBountyId] = useState<BountyId | null>(null);

  const openModal = useCallback((options?: IlluminateModalOptions): void => {
    setPreSelectedChainId(options?.chainId ?? null);
    setPreSelectedBountyId(options?.bountyId ?? null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsOpen(false);
    // Clear pre-selections after a brief delay (for animation)
    setTimeout(() => {
      setPreSelectedChainId(null);
      setPreSelectedBountyId(null);
    }, 200);
  }, []);

  const value = useMemo(
    (): IlluminateContextValue => ({
      isOpen,
      preSelectedChainId,
      preSelectedBountyId,
      openModal,
      closeModal,
    }),
    [isOpen, preSelectedChainId, preSelectedBountyId, openModal, closeModal]
  );

  return (
    <IlluminateContext.Provider value={value}>
      {children}
    </IlluminateContext.Provider>
  );
}
