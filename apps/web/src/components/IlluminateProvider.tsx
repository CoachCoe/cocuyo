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
import type { ChainId, BountyId, ClaimId } from '@cocuyo/types';

/** Evidence type for claim submissions */
export type EvidenceType = 'support' | 'contradict';

export interface IlluminateModalOptions {
  /** Pre-select a story chain to link the signal to */
  chainId?: ChainId;
  /** Pre-select a bounty to contribute to */
  bountyId?: BountyId;
  /** Claim ID to submit evidence for */
  claimId?: ClaimId;
  /** Whether the evidence supports or contradicts the claim */
  evidenceType?: EvidenceType;
}

export interface IlluminateContextValue {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Pre-selected chain ID (if opening from a chain page) */
  preSelectedChainId: ChainId | null;
  /** Pre-selected bounty ID (if opening from a bounty page) */
  preSelectedBountyId: BountyId | null;
  /** Claim ID to submit evidence for (if opening from a claim page) */
  evidenceClaimId: ClaimId | null;
  /** Whether the evidence supports or contradicts the claim */
  evidenceType: EvidenceType | null;
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
  const [evidenceClaimId, setEvidenceClaimId] = useState<ClaimId | null>(null);
  const [evidenceType, setEvidenceType] = useState<EvidenceType | null>(null);

  const openModal = useCallback((options?: IlluminateModalOptions): void => {
    setPreSelectedChainId(options?.chainId ?? null);
    setPreSelectedBountyId(options?.bountyId ?? null);
    setEvidenceClaimId(options?.claimId ?? null);
    setEvidenceType(options?.evidenceType ?? null);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsOpen(false);
    // Clear pre-selections after a brief delay (for animation)
    setTimeout(() => {
      setPreSelectedChainId(null);
      setPreSelectedBountyId(null);
      setEvidenceClaimId(null);
      setEvidenceType(null);
    }, 200);
  }, []);

  const value = useMemo(
    (): IlluminateContextValue => ({
      isOpen,
      preSelectedChainId,
      preSelectedBountyId,
      evidenceClaimId,
      evidenceType,
      openModal,
      closeModal,
    }),
    [isOpen, preSelectedChainId, preSelectedBountyId, evidenceClaimId, evidenceType, openModal, closeModal]
  );

  return (
    <IlluminateContext.Provider value={value}>
      {children}
    </IlluminateContext.Provider>
  );
}
