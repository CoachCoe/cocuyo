import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

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
  return children;
}
