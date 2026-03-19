import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Footer } from '@cocuyo/ui';
import { TriangleProvider } from '@/components/TriangleProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { IlluminateProvider } from '@/components/IlluminateProvider';
import { IlluminateModal } from '@/components/IlluminateModal';
import { AppNavbar } from '@/components/AppNavbar';

export const metadata: Metadata = {
  title: 'Firefly Network — Lights in the Dark',
  icons: {
    icon: '/favicon.svg',
  },
  description:
    'A surveillance-resistant network for collective intelligence. Anonymous but human. Verified but private. Distributed but connected.',
  keywords: [
    'collective intelligence',
    'surveillance resistance',
    'decentralized',
    'Polkadot',
    'Web3',
    'anonymous',
    'verification',
  ],
  authors: [{ name: 'Firefly Network' }],
  openGraph: {
    title: 'Firefly Network — Lights in the Dark',
    description:
      'A surveillance-resistant network for collective intelligence.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Firefly Network — Lights in the Dark',
    description:
      'A surveillance-resistant network for collective intelligence.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-main text-primary">
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
      </body>
    </html>
  );
}
