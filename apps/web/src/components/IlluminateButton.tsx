'use client';

/**
 * IlluminateButton — Opens the Illuminate modal.
 *
 * Used on pages that need a button to trigger the Illuminate flow.
 */

import type { ReactElement } from 'react';
import { Button } from '@cocuyo/ui';
import { useIlluminate } from '@/hooks/useIlluminate';

interface IlluminateButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function IlluminateButton({
  size = 'md',
  className,
  children = 'Illuminate',
}: IlluminateButtonProps): ReactElement {
  const { openModal } = useIlluminate();

  return (
    <Button
      variant="illuminate"
      size={size}
      className={className}
      onClick={() => openModal()}
    >
      {children}
    </Button>
  );
}
