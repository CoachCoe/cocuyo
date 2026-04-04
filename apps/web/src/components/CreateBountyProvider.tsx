'use client';

/**
 * CreateBountyProvider — Context provider for the Create Bounty modal.
 *
 * Manages modal open/close state for bounty creation.
 */

import {
  createContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
  type ReactElement,
} from 'react';

export interface CreateBountyContextValue {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Open the create bounty modal */
  openModal: () => void;
  /** Close the create bounty modal */
  closeModal: () => void;
}

export const CreateBountyContext = createContext<CreateBountyContextValue | null>(null);

interface CreateBountyProviderProps {
  children: ReactNode;
}

export function CreateBountyProvider({ children }: CreateBountyProviderProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    (): CreateBountyContextValue => ({
      isOpen,
      openModal,
      closeModal,
    }),
    [isOpen, openModal, closeModal]
  );

  return (
    <CreateBountyContext.Provider value={value}>
      {children}
    </CreateBountyContext.Provider>
  );
}
