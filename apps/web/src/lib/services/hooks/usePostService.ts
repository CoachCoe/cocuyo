'use client';

/**
 * Post service hook.
 *
 * Provides post operations with integrated wallet state from useSigner().
 * Handles both mock and chain implementations based on NEXT_PUBLIC_USE_CHAIN.
 */

import { useCallback, useRef } from 'react';
import type {
  PostService,
  Post,
  PostPreview,
  PostId,
  PostStatus,
  ChainId,
  PaginationParams,
  PaginatedResult,
  Result,
  NewPost,
} from '@cocuyo/types';
import { ok, err, createPostId, createDIMCredential } from '@cocuyo/types';
import { useSigner } from '@/lib/context/SignerContext';
import { getBulletinClient } from '@/lib/chain/client';
import { getPosts, getPostPreviews, getPostById } from '../mock-data-posts';
import type { Locale } from '../mock-data-posts';
import {
  generatePseudonym,
  paginate,
  filterByTopic,
  uploadToBulletin,
  fetchFromBulletin,
} from '../mock-service-utils';

const USE_CHAIN = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

// Session cache for user-created posts
const userPosts: Post[] = [];

function postToPreview(post: Post): PostPreview {
  return {
    id: post.id,
    title: post.content.title,
    excerpt: post.content.text.slice(0, 200) + (post.content.text.length > 200 ? '...' : ''),
    topics: post.context.topics,
    ...(post.context.locationName !== undefined && { locationName: post.context.locationName }),
    claimCount: post.extractedClaimIds.length,
    signalCount: post.relatedSignalIds.length,
    status: post.status,
    createdAt: post.createdAt,
  };
}

/**
 * Hook providing post service operations.
 *
 * Write operations use wallet state from useSigner().
 * Read operations work without wallet connection.
 */
export function usePostService(): PostService {
  const { selectedAccount, isConnected } = useSigner();

  const accountRef = useRef(selectedAccount);
  accountRef.current = selectedAccount;

  const connectedRef = useRef(isConnected);
  connectedRef.current = isConnected;

  const getPost = useCallback(
    async (id: PostId, locale = 'en'): Promise<Post | null> => {
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

      // Mock implementation
      const mockPost = getPostById(id, locale as Locale);
      if (mockPost) return mockPost;

      // Try Bulletin Chain as fallback
      return fetchFromBulletin<Post>(id);
    },
    []
  );

  const getRecentPosts = useCallback(
    async (params: {
      topic?: string;
      status?: PostStatus;
      pagination: PaginationParams;
      locale?: string;
    }): Promise<PaginatedResult<PostPreview>> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return { items: [], total: 0, hasMore: false };
      }

      // Mock implementation
      const userPreviews = userPosts.map(postToPreview);
      const mockPreviews = getPostPreviews((params.locale ?? 'en') as Locale);
      let filtered = [...userPreviews, ...mockPreviews];

      // Filter by topic
      filtered = filterByTopic(filtered, (p) => p.topics, params.topic);

      // Filter by status
      if (params.status) {
        filtered = filtered.filter((p) => p.status === params.status);
      }

      // Sort by creation time (newest first)
      filtered.sort((a, b) => b.createdAt - a.createdAt);

      return paginate(filtered, params.pagination);
    },
    []
  );

  const getPostsByChain = useCallback(
    async (chainId: ChainId, locale = 'en'): Promise<readonly Post[]> => {
      if (USE_CHAIN) {
        // Chain implementation - requires indexing
        return [];
      }

      // Mock implementation
      const mockPosts = getPosts(locale as Locale).filter(
        (p) => p.relatedChainId === chainId
      );
      const userChainPosts = userPosts.filter(
        (p) => p.relatedChainId === chainId
      );
      return [...userChainPosts, ...mockPosts];
    },
    []
  );

  const createPost = useCallback(
    async (newPost: NewPost): Promise<Result<PostId, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return err('Wallet not connected. Please connect to create a post.');
      }

      if (USE_CHAIN) {
        return err(
          'On-chain post creation requires DIM signing infrastructure. ' +
          'Use mock mode (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
        );
      }

      // Mock implementation
      const connectedAddress = account.address;
      const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
      const now = Date.now();

      const post: Post = {
        id: '' as PostId,
        author: {
          id: connectedAddress,
          credentialHash: dimCredential,
          pseudonym: generatePseudonym(connectedAddress),
          disclosureLevel: 'anonymous',
        },
        content: {
          title: newPost.content.title,
          text: newPost.content.text,
          ...(newPost.content.links && { links: newPost.content.links }),
        },
        context: {
          topics: newPost.context.topics,
          ...(newPost.context.locationName !== undefined && { locationName: newPost.context.locationName }),
        },
        dimSignature: dimCredential,
        extractedClaimIds: [],
        relatedSignalIds: newPost.relatedSignalIds ?? [],
        ...(newPost.relatedChainId !== undefined && { relatedChainId: newPost.relatedChainId }),
        status: 'published',
        createdAt: now,
        updatedAt: now,
      };

      // Upload to Bulletin Chain (with local fallback)
      const uploadResult = await uploadToBulletin(post);
      if (!uploadResult.ok) {
        return err(uploadResult.error);
      }

      const postWithId: Post = { ...post, id: createPostId(uploadResult.value.cid) };
      userPosts.unshift(postWithId);
      return ok(postWithId.id);
    },
    []
  );

  return {
    getPost,
    getRecentPosts,
    getPostsByChain,
    createPost,
  };
}
