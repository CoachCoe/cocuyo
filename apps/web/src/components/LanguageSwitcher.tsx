'use client';

/**
 * LanguageSwitcher — Toggle between available locales with flag icons.
 *
 * Uses next-intl's routing to switch locales while preserving the current path.
 */

import type { ReactElement } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

interface LocaleConfig {
  code: string;
  label: string;
  flag: string;
}

const localeConfigs: LocaleConfig[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇻🇪' },
];

export function LanguageSwitcher(): ReactElement {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string): void => {
    // Remove current locale prefix and add new one
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <div className="flex items-center gap-1">
      {localeConfigs.map((config) => {
        const isActive = locale === config.code;
        return (
          <button
            key={config.code}
            type="button"
            onClick={() => handleLocaleChange(config.code)}
            disabled={isActive}
            className={`
              flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors
              ${isActive
                ? 'bg-[var(--bg-surface-container)] text-[var(--fg-primary)] cursor-default'
                : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface-nested)]'
              }
            `}
            aria-label={`Switch to ${config.label}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <span aria-hidden="true">{config.flag}</span>
            <span className="uppercase text-xs font-medium">{config.code}</span>
          </button>
        );
      })}
    </div>
  );
}
