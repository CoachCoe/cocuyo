/**
 * Web3Modal configuration for wallet connection.
 *
 * Supports MetaMask, WalletConnect, Coinbase Wallet, and 270+ wallets.
 * Configured for Polkadot ecosystem chains.
 */

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// WalletConnect project ID - get one free at https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo-project-id';

/**
 * Supported chains for the Firefly Network.
 * Currently supporting Polkadot ecosystem chains.
 */
const chains = [
  {
    chainId: 420420420,
    name: 'Polkadot Asset Hub',
    currency: 'DOT',
    explorerUrl: 'https://assethub-polkadot.subscan.io',
    rpcUrl: 'https://polkadot-asset-hub-rpc.polkadot.io',
  },
  {
    chainId: 420420421,
    name: 'Westend Asset Hub',
    currency: 'WND',
    explorerUrl: 'https://assethub-westend.subscan.io',
    rpcUrl: 'https://westend-asset-hub-rpc.polkadot.io',
  },
  {
    chainId: 420420417,
    name: 'Polkadot Hub TestNet',
    currency: 'DOT',
    explorerUrl: '',
    rpcUrl: 'https://testnet-rpc.polkadot.io',
  },
];

// Metadata for Web3Modal
const metadata = {
  name: 'Firefly Network',
  description: 'A surveillance-resistant network for collective intelligence',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://fireflynetwork.org',
  icons: ['/firefly-icon.png'],
};

// Create modal configuration
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  auth: {
    email: false,
    socials: [],
    showWallets: false,
    walletFeatures: false,
  },
  defaultChainId: 420420420, // Polkadot Asset Hub
});

// Initialize Web3Modal
createWeb3Modal({
  ethersConfig,
  chains,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  enableSwaps: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-z-index': 9999,
    '--w3m-accent': '#E8B931', // Firefly gold
  },
});
