/**
 * Tests for useBountyEscrow hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBountyEscrow } from './useBountyEscrow';

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    ZeroAddress: '0x0000000000000000000000000000000000000000',
    JsonRpcProvider: vi.fn().mockImplementation(() => ({})),
    Contract: vi.fn().mockImplementation(() => ({
      getFunction: vi.fn().mockReturnValue(vi.fn()),
    })),
    keccak256: vi.fn().mockReturnValue('0x' + '1'.repeat(64)),
    toUtf8Bytes: vi.fn().mockReturnValue(new Uint8Array()),
  },
}));

// Mock config
vi.mock('@/lib/contracts/config', () => ({
  getContractAddress: vi.fn().mockReturnValue('0x1234567890123456789012345678901234567890'),
  getRpcUrl: vi.fn().mockReturnValue('http://localhost:8545'),
}));

describe('useBountyEscrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.contractAddress).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should accept network option', () => {
      const { result } = renderHook(() => useBountyEscrow({ network: 'localhost' }));

      expect(result.current.contractAddress).toBe('0x1234567890123456789012345678901234567890');
    });
  });

  describe('toBountyId', () => {
    it('should convert string to bytes32 hash', () => {
      const { result } = renderHook(() => useBountyEscrow());

      const id = result.current.toBountyId('test-bounty');

      expect(id).toMatch(/^0x[a-f0-9]{64}$/);
    });
  });

  describe('exports', () => {
    it('should export NATIVE_ASSET constant', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(result.current.NATIVE_ASSET).toBe('0x0000000000000000000000000000000000000000');
    });

    it('should export BountyStatus enum', () => {
      const { result } = renderHook(() => useBountyEscrow());

      // BountyStatus is re-exported from abis for convenience
      expect(result.current.BountyStatus).toBeDefined();
    });
  });

  describe('read methods', () => {
    it('should have getBounty method', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(typeof result.current.getBounty).toBe('function');
    });

    it('should have bountyExists method', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(typeof result.current.bountyExists).toBe('function');
    });

    it('should have isExpired method', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(typeof result.current.isExpired).toBe('function');
    });

    it('should have isPaused method', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(typeof result.current.isPaused).toBe('function');
    });
  });

  describe('write methods', () => {
    it('should have fundBounty method', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(typeof result.current.fundBounty).toBe('function');
    });

    it('should have releaseBounty method', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(typeof result.current.releaseBounty).toBe('function');
    });

    it('should have cancelBounty method', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(typeof result.current.cancelBounty).toBe('function');
    });

    it('should have claimExpired method', () => {
      const { result } = renderHook(() => useBountyEscrow());

      expect(typeof result.current.claimExpired).toBe('function');
    });
  });
});
