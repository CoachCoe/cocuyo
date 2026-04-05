/**
 * Tests for contract configuration.
 */

import { describe, it, expect, afterEach } from 'vitest';
import {
  NETWORKS,
  CONTRACT_ADDRESSES,
  getDefaultNetwork,
  getContractAddress,
  getRpcUrl,
} from './config';

describe('contract config', () => {
  describe('NETWORKS', () => {
    it('should have paseo network config', () => {
      expect(NETWORKS.paseo).toBeDefined();
      expect(NETWORKS.paseo.chainId).toBe(420420417);
      expect(NETWORKS.paseo.rpcUrl).toBe('https://services.polkadothub-rpc.com/testnet');
      expect(NETWORKS.paseo.name).toBe('Paseo Asset Hub');
    });

    it('should have localhost network config', () => {
      expect(NETWORKS.localhost).toBeDefined();
      expect(NETWORKS.localhost.chainId).toBe(31337);
      expect(NETWORKS.localhost.rpcUrl).toBe('http://127.0.0.1:8545');
      expect(NETWORKS.localhost.name).toBe('Localhost');
    });
  });

  describe('CONTRACT_ADDRESSES', () => {
    it('should have paseo addresses (null until deployed)', () => {
      expect(CONTRACT_ADDRESSES.paseo).toBeDefined();
      expect(CONTRACT_ADDRESSES.paseo.bountyEscrow).toBeNull();
      expect(CONTRACT_ADDRESSES.paseo.fireflyReputation).toBeNull();
    });

    it('should have localhost addresses', () => {
      expect(CONTRACT_ADDRESSES.localhost).toBeDefined();
      expect(CONTRACT_ADDRESSES.localhost.bountyEscrow).toBe(
        '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
      );
      expect(CONTRACT_ADDRESSES.localhost.fireflyReputation).toBe(
        '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
      );
    });
  });

  describe('getDefaultNetwork', () => {
    const originalEnv = process.env.NEXT_PUBLIC_NETWORK;

    afterEach(() => {
      process.env.NEXT_PUBLIC_NETWORK = originalEnv;
    });

    it('should return localhost by default', () => {
      delete process.env.NEXT_PUBLIC_NETWORK;
      expect(getDefaultNetwork()).toBe('localhost');
    });

    it('should return paseo when env is set', () => {
      process.env.NEXT_PUBLIC_NETWORK = 'paseo';
      expect(getDefaultNetwork()).toBe('paseo');
    });

    it('should return localhost for unknown env value', () => {
      process.env.NEXT_PUBLIC_NETWORK = 'unknown';
      expect(getDefaultNetwork()).toBe('localhost');
    });
  });

  describe('getContractAddress', () => {
    it('should return bountyEscrow address for localhost', () => {
      const address = getContractAddress('bountyEscrow', 'localhost');
      expect(address).toBe('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
    });

    it('should return fireflyReputation address for localhost', () => {
      const address = getContractAddress('fireflyReputation', 'localhost');
      expect(address).toBe('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9');
    });

    it('should return null for paseo (not deployed)', () => {
      expect(getContractAddress('bountyEscrow', 'paseo')).toBeNull();
      expect(getContractAddress('fireflyReputation', 'paseo')).toBeNull();
    });

    it('should use default network when not specified', () => {
      const address = getContractAddress('bountyEscrow');
      expect(address).toBe('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
    });
  });

  describe('getRpcUrl', () => {
    it('should return localhost RPC URL', () => {
      expect(getRpcUrl('localhost')).toBe('http://127.0.0.1:8545');
    });

    it('should return paseo RPC URL', () => {
      expect(getRpcUrl('paseo')).toBe('https://services.polkadothub-rpc.com/testnet');
    });

    it('should use default network when not specified', () => {
      expect(getRpcUrl()).toBe('http://127.0.0.1:8545');
    });
  });
});
