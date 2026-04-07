/**
 * Tests for useFireflyReputation hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFireflyReputation } from './useFireflyReputation';
import { DEFAULT_TOPICS } from '@/lib/contracts/abis';

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
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

describe('useFireflyReputation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with contract address', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(result.current.contractAddress).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should accept network option', () => {
      const { result } = renderHook(() => useFireflyReputation({ network: 'localhost' }));

      expect(result.current.contractAddress).toBe('0x1234567890123456789012345678901234567890');
    });
  });

  describe('toCredentialHash', () => {
    it('should convert string to bytes32 hash', () => {
      const { result } = renderHook(() => useFireflyReputation());

      const hash = result.current.toCredentialHash('test-credential');

      expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('should return bytes32 hex string as-is', () => {
      const { result } = renderHook(() => useFireflyReputation());
      const existingHash = '0x' + 'a'.repeat(64);

      const hash = result.current.toCredentialHash(existingHash);

      expect(hash).toBe(existingHash);
    });
  });

  describe('toTopicHash', () => {
    it('should convert topic name to bytes32 hash', () => {
      const { result } = renderHook(() => useFireflyReputation());

      const hash = result.current.toTopicHash('economy');

      expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
    });
  });

  describe('DEFAULT_TOPICS', () => {
    it('should export DEFAULT_TOPICS array', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(result.current.DEFAULT_TOPICS).toBe(DEFAULT_TOPICS);
      expect(result.current.DEFAULT_TOPICS).toContain('economy');
      expect(result.current.DEFAULT_TOPICS).toContain('health');
      expect(result.current.DEFAULT_TOPICS).toContain('politics');
      expect(result.current.DEFAULT_TOPICS).toContain('infrastructure');
      expect(result.current.DEFAULT_TOPICS).toContain('human-rights');
      expect(result.current.DEFAULT_TOPICS).toContain('environment');
      expect(result.current.DEFAULT_TOPICS).toContain('security');
      expect(result.current.DEFAULT_TOPICS).toContain('education');
    });
  });

  describe('read methods', () => {
    it('should have getScore method', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(typeof result.current.getScore).toBe('function');
    });

    it('should have getTopicScore method', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(typeof result.current.getTopicScore).toBe('function');
    });

    it('should have getScores method', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(typeof result.current.getScores).toBe('function');
    });

    it('should have getAllDefaultScores method', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(typeof result.current.getAllDefaultScores).toBe('function');
    });

    it('should have getTopics method', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(typeof result.current.getTopics).toBe('function');
    });

    it('should have getTopicCount method', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(typeof result.current.getTopicCount).toBe('function');
    });

    it('should have isTopicRegistered method', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(typeof result.current.isTopicRegistered).toBe('function');
    });

    it('should have isUpdater method', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(typeof result.current.isUpdater).toBe('function');
    });

    it('should have getConstants method', () => {
      const { result } = renderHook(() => useFireflyReputation());

      expect(typeof result.current.getConstants).toBe('function');
    });
  });
});
