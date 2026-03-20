/**
 * Footer — Site footer with navigation links and Polkadot attribution.
 *
 * The footer includes:
 * - Wordmark and tagline
 * - Navigation columns (Network, Resources, Community)
 * - "Built on Polkadot" attribution (with Polkadot pink)
 * - Copyright
 */

import type { ReactElement } from 'react';
import { FireflySymbol } from '../FireflySymbol';

export interface FooterProps {
  /** Copyright year */
  year?: number;
}

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Network',
    links: [
      { href: '/explore', label: 'Explore' },
      { href: '/bounties', label: 'Bounties' },
      { href: '/chains', label: 'Story Chains' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: 'https://rebbit.notion.site/Efecto-Cocuyo-Independent-Media-2fdee372c52c80c29adad1bcaa70da99', label: 'Inspiration', external: true },
      { href: '/about', label: 'About' },
      { href: '/contributing', label: 'Contributing' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: 'https://github.com/CoachCoe/cocuyo', label: 'GitHub', external: true },
      { href: 'https://polkadot.com', label: 'Polkadot', external: true },
      { href: 'https://web3.foundation', label: 'Web3 Foundation', external: true },
    ],
  },
];

export function Footer({ year = new Date().getFullYear() }: FooterProps): ReactElement {
  return (
    <footer
      className="bg-[var(--bg-surface-main)] border-t border-[var(--border-default)] pt-20 pb-10"
      role="contentinfo"
    >
      <div className="container-wide">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Wordmark and tagline */}
          <div className="md:col-span-1">
            <a
              href="/"
              className="flex items-center gap-2 text-[var(--fg-primary)] hover:text-[var(--fg-primary)] mb-3"
            >
              <FireflySymbol size={20} color="gold" />
              <span className="font-semibold text-lg tracking-tight">
                FIREFLY NETWORK
              </span>
            </a>
            <p className="text-[var(--fg-secondary)] text-sm italic">
              Lights in the dark.
            </p>
          </div>

          {/* Navigation columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-medium text-sm text-[var(--fg-primary)] mb-4">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
                      {...(link.external === true && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      })}
                    >
                      {link.label}
                      {link.external === true && (
                        <span className="sr-only"> (opens in new tab)</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="border-t border-[var(--border-default)] pt-8 flex justify-center">
          <p className="text-sm text-[var(--fg-tertiary)]">
            &copy; {year} Parity Technologies
          </p>
        </div>
      </div>
    </footer>
  );
}
