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
import { ok, err, createPostId, createDIMCredential } from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import { getPosts, getPostPreviews, getPostById } from './mock-data-posts';
import type { Locale } from './mock-data-posts';
import { getBulletinClient } from '../chain/client';

// Session cache for user-created posts
const userPosts: Post[] = [];

// Connected wallet (imported from signal service for consistency)
let connectedAddress: string | null = null;

export function setPostWallet(address: string | null): void {
  connectedAddress = address;
}

function generatePseudonym(address: string): string {
  const adjectives = [
    'Swift', 'Bright', 'Silent', 'Golden', 'Crystal',
    'Shadow', 'Thunder', 'Cosmic', 'Ember', 'Frost',
  ];
  const nouns = [
    'Firefly', 'Phoenix', 'Condor', 'Jaguar', 'Quetzal',
    'Orchid', 'Ceiba', 'Cacao', 'Ocelot', 'Toucan',
  ];

  const addrBytes = address.slice(2, 10);
  const adjIdx = parseInt(addrBytes.slice(0, 4), 16) % adjectives.length;
  const nounIdx = parseInt(addrBytes.slice(4, 8), 16) % nouns.length;

  return `${adjectives[adjIdx]} ${nouns[nounIdx]}`;
}

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
    try {
      const bulletin = await getBulletinClient();
      return await bulletin.fetchJson<Post>(id);
    } catch {
      return null;
    }
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

    // Filter by topic
    if (params.topic !== undefined) {
      const topicLower = params.topic.toLowerCase();
      filtered = filtered.filter((p) =>
        p.topics.some((t) => t.toLowerCase().includes(topicLower))
      );
    }

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate
    const total = filtered.length;
    const start = params.pagination.offset;
    const end = start + params.pagination.limit;
    const items = filtered.slice(start, end);

    return Promise.resolve({ items, total, hasMore: end < total });
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
    if (connectedAddress === null) {
      return err('Wallet not connected. Please connect to create a post.');
    }

    const now = Date.now();
    const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
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

    try {
      const bulletin = await getBulletinClient();
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(post));
      const result = await bulletin.upload(data);

      const postWithId: Post = { ...post, id: createPostId(result.cid) };
      userPosts.unshift(postWithId);
      return ok(postWithId.id);
    } catch {
      // Fallback to local CID
      const cid = calculateCIDFromJSON(post);
      const postWithId: Post = { ...post, id: createPostId(cid) };
      userPosts.unshift(postWithId);
      return ok(postWithId.id);
    }
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
