/**
 * AppKit (formerly Web3Modal) configuration for wallet connection.
 *
 * Supports MetaMask, WalletConnect, Coinbase Wallet, and 270+ wallets.
 * Configured for Polkadot ecosystem chains.
 */

import { createAppKit, type ChainAdapter } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';

// WalletConnect project ID - get one free at https://cloud.reown.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo-project-id';

/**
 * Supported chains for the Firefly Network.
 * Currently supporting Polkadot ecosystem chains.
 */
const polkadotAssetHub = {
  id: 420420420,
  name: 'Polkadot Asset Hub',
  nativeCurrency: { name: 'DOT', symbol: 'DOT', decimals: 10 },
  rpcUrls: {
    default: { http: ['https://polkadot-asset-hub-rpc.polkadot.io'] },
  },
  blockExplorers: {
    default: { name: 'Subscan', url: 'https://assethub-polkadot.subscan.io' },
  },
};

const westendAssetHub = {
  id: 420420421,
  name: 'Westend Asset Hub',
  nativeCurrency: { name: 'WND', symbol: 'WND', decimals: 12 },
  rpcUrls: {
    default: { http: ['https://westend-asset-hub-rpc.polkadot.io'] },
  },
  blockExplorers: {
    default: { name: 'Subscan', url: 'https://assethub-westend.subscan.io' },
  },
};

const polkadotTestnet = {
  id: 420420417,
  name: 'Polkadot Hub TestNet',
  nativeCurrency: { name: 'DOT', symbol: 'DOT', decimals: 10 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.polkadot.io'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: '' },
  },
};

// Metadata for AppKit
const metadata = {
  name: 'Firefly Network',
  description: 'A surveillance-resistant network for collective intelligence',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://fireflynetwork.org',
  icons: ['/firefly-icon.png'],
};

// Initialize AppKit
// Type assertion needed due to exactOptionalPropertyTypes in tsconfig
createAppKit({
  adapters: [new EthersAdapter() as ChainAdapter],
  networks: [polkadotAssetHub, westendAssetHub, polkadotTestnet],
  metadata,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-z-index': 9999,
    '--w3m-accent': '#E8B931', // Firefly gold
  },
  features: {
    analytics: false,
    onramp: false,
    swaps: false,
    email: false,
    socials: [],
  },
});
