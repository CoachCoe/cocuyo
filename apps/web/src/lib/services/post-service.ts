/**
 * Post Service implementation with Bulletin storage.
 *
 * This service provides:
 * - Bulletin Chain storage for posts (writes)
 * - Session cache for immediate feedback
 * - Empty results for queries until indexing is implemented
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
import { ok, err, createPostId, emptyCorroborationSummary } from '@cocuyo/types';
import {
  getConnectedWallet,
  getConnectedCredential,
  generatePseudonym,
  paginate,
  filterByTopic,
  uploadToBulletin,
  fetchFromBulletin,
} from './service-utils';

export type Locale = 'en' | 'es';

// Session cache for user-created posts
const userPosts: Post[] = [];

function postToPreview(post: Post): PostPreview {
  return {
    id: post.id,
    ...(post.content.title !== undefined && { title: post.content.title }),
    excerpt: post.content.text.slice(0, 200) + (post.content.text.length > 200 ? '...' : ''),
    topics: [...post.context.topics],
    ...(post.context.locationName !== undefined && { locationName: post.context.locationName }),
    corroborationCount: post.corroborations.witnessCount + post.corroborations.expertiseCount,
    challengeCount: post.corroborations.challengeCount,
    status: post.status,
    createdAt: post.createdAt,
  };
}

export class PostServiceImpl implements PostService {
  async getPost(id: PostId, _locale: Locale = 'en'): Promise<Post | null> {
    // Check user posts first
    const userPost = userPosts.find((p) => p.id === id);
    if (userPost) return userPost;

    // Try Bulletin Chain
    return fetchFromBulletin<Post>(id);
  }

  getRecentPosts(params: {
    topic?: string;
    location?: string;
    status?: PostStatus;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<PostPreview>> {
    // Return only user-created posts
    let filtered = userPosts.map(postToPreview);

    // Filter by topic using shared utility
    filtered = filterByTopic(filtered, (p) => [...p.topics], params.topic);

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate using shared utility
    return Promise.resolve(paginate(filtered, params.pagination));
  }

  getRecentPostsForDisplay(params: {
    topic?: string;
    location?: string;
    status?: PostStatus;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<Post>> {
    // Return full post objects for display components
    let filtered = [...userPosts];

    // Filter by topic using shared utility
    filtered = filterByTopic(filtered, (p) => [...p.context.topics], params.topic);

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Paginate using shared utility
    return Promise.resolve(paginate(filtered, params.pagination));
  }

  getChainPosts(chainId: ChainId, _locale: Locale = 'en'): Promise<readonly Post[]> {
    // Return only user-created posts for this chain
    const userChainPosts = userPosts.filter(
      (p) => p.chainLinks.includes(chainId)
    );
    return Promise.resolve(userChainPosts);
  }

  async illuminate(newPost: NewPost): Promise<Result<PostId, string>> {
    const connectedAddress = getConnectedWallet();
    const dimCredential = getConnectedCredential();

    if (connectedAddress === null || dimCredential === null) {
      return err('Wallet not connected. Please connect to illuminate.');
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
        ...(newPost.content.title !== undefined && { title: newPost.content.title }),
        text: newPost.content.text,
        ...(newPost.content.links && { links: newPost.content.links }),
        ...(newPost.content.media && { media: newPost.content.media }),
      },
      context: {
        topics: [...newPost.context.topics],
        ...(newPost.context.locationName !== undefined && { locationName: newPost.context.locationName }),
        ...(newPost.context.location !== undefined && { location: newPost.context.location }),
        ...(newPost.context.timeframe !== undefined && { timeframe: newPost.context.timeframe }),
      },
      dimSignature: dimCredential,
      status: 'published',
      chainLinks: newPost.chainLinks ?? [],
      corroborations: emptyCorroborationSummary(),
      verification: { status: 'unverified' },
      createdAt: now,
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

  /**
   * @deprecated Use illuminate instead
   */
  createPost(newPost: NewPost): Promise<Result<PostId, string>> {
    return this.illuminate(newPost);
  }
}

// Export a singleton instance
export const postService = new PostServiceImpl();

// Legacy alias for backward compatibility
export { PostServiceImpl as MockPostService };
