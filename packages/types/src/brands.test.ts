import { describe, it, expect } from 'vitest';
import {
  createPostId,
  createChainId,
  createCorroborationId,
  createBountyId,
  createDIMCredential,
  createContentHash,
  createVerdictId,
  type PostId,
  type ChainId,
  type CorroborationId,
  type BountyId,
  type DIMCredential,
  type ContentHash,
  type VerdictId,
} from './brands';

describe('Branded Types', () => {
  describe('createPostId', () => {
    it('creates a PostId from a valid string', () => {
      const id = createPostId('post-123');
      expect(id).toBe('post-123');
    });

    it('creates a PostId from a hash-like string', () => {
      const hash = '0x1234567890abcdef1234567890abcdef12345678';
      const id = createPostId(hash);
      expect(id).toBe(hash);
    });

    it('preserves the branded type (compile-time check)', () => {
      const id: PostId = createPostId('post-test');
      // This would fail compilation if types are wrong
      expect(typeof id).toBe('string');
    });

    it('handles empty string', () => {
      const id = createPostId('');
      expect(id).toBe('');
    });
  });

  describe('createChainId', () => {
    it('creates a ChainId from a valid string', () => {
      const id = createChainId('chain-456');
      expect(id).toBe('chain-456');
    });

    it('preserves the branded type', () => {
      const id: ChainId = createChainId('chain-test');
      expect(typeof id).toBe('string');
    });
  });

  describe('createCorroborationId', () => {
    it('creates a CorroborationId from a valid string', () => {
      const id = createCorroborationId('corr-789');
      expect(id).toBe('corr-789');
    });

    it('preserves the branded type', () => {
      const id: CorroborationId = createCorroborationId('corr-test');
      expect(typeof id).toBe('string');
    });
  });

  describe('createBountyId', () => {
    it('creates a BountyId from a valid string', () => {
      const id = createBountyId('bounty-101');
      expect(id).toBe('bounty-101');
    });

    it('preserves the branded type', () => {
      const id: BountyId = createBountyId('bounty-test');
      expect(typeof id).toBe('string');
    });
  });

  describe('createVerdictId', () => {
    it('creates a VerdictId from a valid string', () => {
      const id = createVerdictId('verdict-202');
      expect(id).toBe('verdict-202');
    });

    it('preserves the branded type', () => {
      const id: VerdictId = createVerdictId('verdict-test');
      expect(typeof id).toBe('string');
    });
  });

  describe('createDIMCredential', () => {
    it('creates a DIMCredential from a valid string', () => {
      const cred = createDIMCredential('dim-credential-abc');
      expect(cred).toBe('dim-credential-abc');
    });

    it('handles substrate address format', () => {
      const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const cred = createDIMCredential(address);
      expect(cred).toBe(address);
    });

    it('preserves the branded type', () => {
      const cred: DIMCredential = createDIMCredential('dim-test');
      expect(typeof cred).toBe('string');
    });
  });

  describe('createContentHash', () => {
    it('creates a ContentHash from a valid string', () => {
      const hash = createContentHash('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
      expect(hash).toBe('QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG');
    });

    it('handles IPFS CID format', () => {
      const cid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';
      const hash = createContentHash(cid);
      expect(hash).toBe(cid);
    });

    it('preserves the branded type', () => {
      const hash: ContentHash = createContentHash('hash-test');
      expect(typeof hash).toBe('string');
    });
  });

  describe('Type safety', () => {
    it('different branded types are not interchangeable at compile time', () => {
      // This test documents the compile-time behavior
      // If branded types worked correctly, the following would be a compile error:
      // const postId: PostId = createChainId('chain-1');

      // At runtime, they're all strings, but TypeScript prevents mixing
      const postId = createPostId('post-1');
      const chainId = createChainId('chain-1');

      // They're different branded types but both strings at runtime
      expect(typeof postId).toBe('string');
      expect(typeof chainId).toBe('string');
      expect(postId).not.toBe(chainId);
    });
  });
});
