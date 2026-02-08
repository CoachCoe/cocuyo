'use client';

/**
 * AddSignalButton — Opens the Illuminate modal with chain pre-selected.
 */

import type { ReactElement } from 'react';
import { Button } from '@cocuyo/ui';
import type { ChainId } from '@cocuyo/types';
import { useIlluminate } from '@/hooks/useIlluminate';

interface AddSignalButtonProps {
  chainId: ChainId;
  variant?: 'illuminate' | 'primary';
  className?: string;
  children?: React.ReactNode;
}

export function AddSignalButton({
  chainId,
  variant = 'illuminate',
  className,
  children = 'Add Signal to Chain',
}: AddSignalButtonProps): ReactElement {
  const { openModal } = useIlluminate();

  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => openModal({ chainId })}
    >
      {children}
    </Button>
  );
}
