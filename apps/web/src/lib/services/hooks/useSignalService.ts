'use client';

/**
 * Signal service hook.
 *
 * Note: Named "Signal" for backwards compatibility.
 * In the new UX model, "Signal" is now "Post" in user-facing contexts.
 *
 * Provides post operations with integrated wallet state from useSigner().
 * Handles both mock and chain implementations based on NEXT_PUBLIC_USE_CHAIN.
 */

import { useCallback, useRef } from 'react';
import type {
  PostService,
  Post,
  PostId,
  PostPreview,
  PostStatus,
  ChainId,
  PaginationParams,
  PaginatedResult,
  Result,
  NewPost,
} from '@cocuyo/types';
import { ok, err, createPostId, createDIMCredential, emptyCorroborationSummary } from '@cocuyo/types';
import { useSigner } from '@/lib/context/SignerContext';
import { getBulletinClient } from '@/lib/chain/client';
import {
  generatePseudonym,
  paginate,
  filterByTopic,
  filterByString,
  uploadToBulletin,
  fetchFromBulletin,
} from '../service-utils';

export type Locale = 'en' | 'es';

const USE_CHAIN = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

// Session cache for user-created posts (shared across hook instances)
const userPosts: Post[] = [];

/**
 * Hook providing post service operations.
 *
 * All write operations use wallet state from useSigner().
 * Read operations work without wallet connection.
 */
export function useSignalService(): PostService {
  const { selectedAccount, isConnected } = useSigner();

  // Use ref to avoid stale closures in callbacks
  const accountRef = useRef(selectedAccount);
  accountRef.current = selectedAccount;

  const connectedRef = useRef(isConnected);
  connectedRef.current = isConnected;

  const getPost = useCallback(
    async (id: PostId, _locale = 'en'): Promise<Post | null> => {
      // Check user posts first
      const userPost = userPosts.find((p) => p.id === id);
      if (userPost) return userPost;

      if (USE_CHAIN) {
        try {
          const bulletin = await getBulletinClient();
          return await bulletin.fetchJson<Post>(id);
        } catch {
          return null;
        }
      }

      // Try fetching from Bulletin Chain as fallback
      return fetchFromBulletin<Post>(id);
    },
    []
  );

  const getChainPosts = useCallback(
    async (chainId: ChainId, _locale = 'en'): Promise<readonly Post[]> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return [];
      }

      // Return user-created posts for this chain
      const userChainPosts = userPosts.filter((p) => p.chainLinks.includes(chainId));
      return userChainPosts;
    },
    []
  );

  const getRecentPosts = useCallback(
    async (params: {
      topic?: string;
      location?: string;
      status?: PostStatus;
      pagination: PaginationParams;
      locale?: string;
    }): Promise<PaginatedResult<PostPreview>> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return { items: [], total: 0, hasMore: false };
      }

      // Return user-created posts only
      let filtered = [...userPosts];

      filtered = filterByTopic(filtered, (p) => [...p.context.topics], params.topic);
      filtered = filterByString(filtered, (p) => p.context.locationName, params.location);
      filtered.sort((a, b) => b.createdAt - a.createdAt);

      // Convert to previews
      const previews: PostPreview[] = filtered.map((post) => ({
        id: post.id,
        ...(post.content.title !== undefined && { title: post.content.title }),
        excerpt: post.content.text.slice(0, 200),
        topics: [...post.context.topics],
        ...(post.context.locationName !== undefined && { locationName: post.context.locationName }),
        status: post.status,
        corroborationCount: post.corroborations.witnessCount + post.corroborations.expertiseCount,
        challengeCount: post.corroborations.challengeCount,
        createdAt: post.createdAt,
      }));

      return paginate(previews, params.pagination);
    },
    []
  );

  const getRecentPostsForDisplay = useCallback(
    (params: {
      topic?: string;
      location?: string;
      status?: PostStatus;
      pagination: PaginationParams;
      locale?: string;
    }): Promise<PaginatedResult<Post>> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return Promise.resolve({ items: [], total: 0, hasMore: false });
      }

      // Return full post objects for display components
      let filtered = [...userPosts];

      filtered = filterByTopic(filtered, (p) => [...p.context.topics], params.topic);
      filtered = filterByString(filtered, (p) => p.context.locationName, params.location);
      filtered.sort((a, b) => b.createdAt - a.createdAt);

      return Promise.resolve(paginate(filtered, params.pagination));
    },
    []
  );

  const illuminate = useCallback(
    async (post: NewPost): Promise<Result<PostId, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return err('Wallet not connected. Please connect your wallet to illuminate.');
      }

      if (USE_CHAIN) {
        // Chain implementation requires DIM signing infrastructure
        return err(
          'On-chain illumination requires DIM signing infrastructure. ' +
          'Use mock mode (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
        );
      }

      // Session-cached implementation
      const connectedAddress = account.address;
      const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
      const now = Date.now();

      const fullPost: Post = {
        id: '' as PostId,
        author: {
          id: connectedAddress,
          credentialHash: dimCredential,
          pseudonym: generatePseudonym(connectedAddress),
          disclosureLevel: 'anonymous',
        },
        content: {
          ...(post.content.title !== undefined && { title: post.content.title }),
          text: post.content.text,
          ...(post.content.links && { links: post.content.links }),
          ...(post.content.media && { media: post.content.media }),
        },
        context: {
          topics: [...post.context.topics],
          ...(post.context.locationName !== undefined && { locationName: post.context.locationName }),
          ...(post.context.location !== undefined && { location: post.context.location }),
          ...(post.context.timeframe !== undefined && { timeframe: post.context.timeframe }),
        },
        dimSignature: dimCredential,
        status: 'published',
        corroborations: emptyCorroborationSummary(),
        verification: {
          status: 'unverified',
        },
        chainLinks: post.chainLinks ?? [],
        createdAt: now,
      };

      // Upload to Bulletin Chain (with local fallback)
      const uploadResult = await uploadToBulletin(fullPost);
      if (!uploadResult.ok) {
        return err(uploadResult.error);
      }

      // Update with CID
      const postWithId: Post = {
        ...fullPost,
        id: createPostId(uploadResult.value.cid),
      };

      // Add to session cache
      userPosts.unshift(postWithId);

      return ok(postWithId.id);
    },
    []
  );

  return {
    getPost,
    getChainPosts,
    getRecentPosts,
    getRecentPostsForDisplay,
    illuminate,
  };
}
