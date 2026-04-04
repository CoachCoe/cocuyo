'use client';

/**
 * useCreateBounty — Hook for accessing the Create Bounty modal context.
 *
 * Provides access to openModal() and closeModal() functions,
 * as well as current modal state.
 *
 * @example
 * const { openModal } = useCreateBounty();
 * openModal(); // Open from bounties page
 */

import { useContext } from 'react';
import {
  CreateBountyContext,
  type CreateBountyContextValue,
} from '@/components/CreateBountyProvider';

export function useCreateBounty(): CreateBountyContextValue {
  const context = useContext(CreateBountyContext);

  if (context === null) {
    throw new Error('useCreateBounty must be used within a CreateBountyProvider');
  }

  return context;
}
