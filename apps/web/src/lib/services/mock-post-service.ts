/**
 * Mock implementation of the PostService with real Bulletin storage.
 *
 * This service provides:
 * - Mock data for demo content (reads)
 * - Real Bulletin Chain storage for new posts (writes)
 * - Session cache for immediate feedback
 */

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
import { ok, err, createPostId } from '@cocuyo/types';
import { getPosts, getPostPreviews, getPostById } from './mock-data-posts';
import type { Locale } from './mock-data-posts';
import {
  getConnectedWallet,
  getConnectedCredential,
  generatePseudonym,
  paginate,
  filterByTopic,
  uploadToBulletin,
  fetchFromBulletin,
} from './mock-service-utils';

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

export class MockPostService implements PostService {
  async getPost(id: PostId, locale: Locale = 'en'): Promise<Post | null> {
    // Check user posts first
    const userPost = userPosts.find((p) => p.id === id);
    if (userPost) return userPost;

    // Check mock data
    const mockPost = getPostById(id, locale);
    if (mockPost) return mockPost;

    // Try Bulletin Chain
    return fetchFromBulletin<Post>(id);
  }

  getRecentPosts(params: {
    topic?: string;
    status?: PostStatus;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<PostPreview>> {
    // Combine user posts with mock posts
    const userPreviews = userPosts.map(postToPreview);
    const mockPreviews = getPostPreviews(params.locale ?? 'en');
    let filtered = [...userPreviews, ...mockPreviews];

    // Filter by topic using shared utility
    filtered = filterByTopic(filtered, (p) => p.topics, params.topic);

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate using shared utility
    return Promise.resolve(paginate(filtered, params.pagination));
  }

  getPostsByChain(chainId: ChainId, locale: Locale = 'en'): Promise<readonly Post[]> {
    const mockPosts = getPosts(locale).filter(
      (p) => p.relatedChainId === chainId
    );
    const userChainPosts = userPosts.filter(
      (p) => p.relatedChainId === chainId
    );
    return Promise.resolve([...userChainPosts, ...mockPosts]);
  }

  async createPost(newPost: NewPost): Promise<Result<PostId, string>> {
    const connectedAddress = getConnectedWallet();
    const dimCredential = getConnectedCredential();

    if (connectedAddress === null || dimCredential === null) {
      return err('Wallet not connected. Please connect to create a post.');
    }

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
  }

  getAllPosts(params: {
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<PostPreview>> {
    const locale = params.locale;
    return this.getRecentPosts({
      pagination: params.pagination,
      ...(locale !== undefined && { locale }),
    });
  }
}

// Export a singleton instance
export const postService = new MockPostService();
