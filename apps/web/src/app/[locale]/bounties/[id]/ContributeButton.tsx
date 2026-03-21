'use client';

/**
 * ContributeButton — Opens the Illuminate modal with bounty pre-selected.
 */

import type { ReactElement } from 'react';
import { Button } from '@cocuyo/ui';
import type { BountyId } from '@cocuyo/types';
import { useIlluminate } from '@/hooks/useIlluminate';

interface ContributeButtonProps {
  bountyId: BountyId;
  variant?: 'illuminate' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function ContributeButton({
  bountyId,
  variant = 'illuminate',
  size = 'md',
  className,
  children = 'Contribute Signal',
}: ContributeButtonProps): ReactElement {
  const { openModal } = useIlluminate();

  const handleClick = (): void => {
    openModal({ bountyId });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
