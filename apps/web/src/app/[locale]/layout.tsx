import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ToastProvider, ErrorBoundary } from '@cocuyo/ui';
import { AppFooter } from '@/components/AppFooter';
import { SignerProvider } from '@/lib/context/SignerContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { IlluminateProvider } from '@/components/IlluminateProvider';
import { IlluminateModal } from '@/components/IlluminateModal';
import { CreateBountyProvider } from '@/components/CreateBountyProvider';
import { CreateBountyModal } from '@/components/CreateBountyModal';
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
            <ErrorBoundary>
              <ToastProvider>
                <SignerProvider>
                  <IlluminateProvider>
                    <CreateBountyProvider>
                      <AppNavbar />
                      <div className="pt-16 min-h-screen">{children}</div>
                      <AppFooter />
                      <IlluminateModal />
                      <CreateBountyModal />
                    </CreateBountyProvider>
                  </IlluminateProvider>
                </SignerProvider>
              </ToastProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
