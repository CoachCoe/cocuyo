import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Footer } from '@cocuyo/ui';
import { TriangleProvider } from '@/components/TriangleProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { IlluminateProvider } from '@/components/IlluminateProvider';
import { IlluminateModal } from '@/components/IlluminateModal';
import { AppNavbar } from '@/components/AppNavbar';
import { routing } from '../../../i18n/routing';

// Generate static params for all locales
export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps): Promise<ReactNode> {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-surface-main text-primary">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <TriangleProvider>
              <IlluminateProvider>
                <AppNavbar />
                <div className="pt-16 min-h-screen">
                  {children}
                </div>
                <Footer />
                <IlluminateModal />
              </IlluminateProvider>
            </TriangleProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
