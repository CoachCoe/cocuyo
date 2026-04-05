/**
 * Contract configuration for BountyEscrow and FireflyReputation.
 *
 * Addresses are configured per network. ABIs are imported from artifacts.
 */

// Network configurations
export const NETWORKS = {
  paseo: {
    chainId: 420420417,
    rpcUrl: 'https://services.polkadothub-rpc.com/testnet',
    name: 'Paseo Asset Hub',
  },
  localhost: {
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    name: 'Localhost',
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

// Contract addresses per network
// Updated when contracts are deployed
export const CONTRACT_ADDRESSES: Record<NetworkName, {
  bountyEscrow: string | null;
  fireflyReputation: string | null;
}> = {
  paseo: {
    // TODO: Update after successful Paseo deployment
    bountyEscrow: null,
    fireflyReputation: null,
  },
  localhost: {
    // From local hardhat deployment
    bountyEscrow: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    fireflyReputation: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  },
};

// Default network based on environment
export function getDefaultNetwork(): NetworkName {
  if (process.env.NEXT_PUBLIC_NETWORK === 'paseo') {
    return 'paseo';
  }
  return 'localhost';
}

// Get contract address for current network
export function getContractAddress(
  contract: 'bountyEscrow' | 'fireflyReputation',
  network?: NetworkName
): string | null {
  const net = network ?? getDefaultNetwork();
  return CONTRACT_ADDRESSES[net][contract];
}

// Get RPC URL for network
export function getRpcUrl(network?: NetworkName): string {
  const net = network ?? getDefaultNetwork();
  return NETWORKS[net].rpcUrl;
}
