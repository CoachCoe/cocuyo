/**
 * FireflySymbol — The firefly icon used throughout the UI.
 *
 * Uses the four-pointed star character (✦) as the primary symbol,
 * representing illumination and the firefly metaphor.
 */

import type { CSSProperties, ReactElement } from 'react';

export interface FireflySymbolProps {
  /** Size of the symbol in pixels or CSS unit */
  size?: number | string;
  /** Color of the symbol. Defaults to firefly gold */
  color?: 'gold' | 'white' | 'inherit';
  /** Additional CSS class */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
}

const colorMap = {
  gold: 'var(--color-accent)',
  white: 'var(--color-text-primary)',
  inherit: 'inherit',
} as const;

export function FireflySymbol({
  size = 16,
  color = 'gold',
  className = '',
  'aria-label': ariaLabel = 'Firefly',
}: FireflySymbolProps): ReactElement {
  const style: CSSProperties = {
    fontSize: typeof size === 'number' ? `${String(size)}px` : size,
    color: colorMap[color],
    lineHeight: 1,
  };

  return (
    <span
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      ✦
    </span>
  );
}
