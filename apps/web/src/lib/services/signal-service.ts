/**
 * Signal Service implementation with real Bulletin storage.
 *
 * Note: This service is named "Signal" for backwards compatibility.
 * In the new UX model, "Signal" has been renamed to "Post" in user-facing contexts.
 *
 * This service provides:
 * - Bulletin Chain storage for posts (writes)
 * - Session cache for immediate feedback
 * - Empty results for queries until indexing is implemented
 *
 * Posts are stored on Bulletin Chain and can be fetched by CID.
 */

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
import { ok, err, createPostId, emptyCorroborationSummary } from '@cocuyo/types';
import {
  setConnectedWallet as setWallet,
  getConnectedWallet,
  getConnectedCredential,
  generatePseudonym,
  paginate,
  filterByTopic,
  filterByString,
  uploadToBulletin,
  fetchFromBulletin,
} from './service-utils';
import { seedPosts } from '@/lib/seed-data';

export type Locale = 'en' | 'es';

// Session cache for user-created posts (initialized with seed data)
const userPosts: Post[] = [...seedPosts.values()];

// Re-export for backwards compatibility
export { setWallet as setConnectedWallet };

/**
 * SignalServiceImpl - now works with Post types.
 * The name is kept for backwards compatibility.
 */
export class SignalServiceImpl implements PostService {
  async getPost(id: PostId, _locale: Locale = 'en'): Promise<Post | null> {
    // Check user posts first
    const userPost = userPosts.find((p) => p.id === id);
    if (userPost) return userPost;

    // Try fetching from Bulletin Chain
    return fetchFromBulletin<Post>(id);
  }

  getChainPosts(chainId: ChainId, _locale: Locale = 'en'): Promise<readonly Post[]> {
    // Return only user-created posts for this chain
    // Full chain queries require indexing
    const userChainPosts = userPosts.filter((p) => p.chainLinks.includes(chainId));
    return Promise.resolve(userChainPosts);
  }

  getRecentPosts(params: {
    topic?: string;
    location?: string;
    status?: PostStatus;
    pagination: PaginationParams;
    locale?: Locale;
  }): Promise<PaginatedResult<PostPreview>> {
    // Return only user-created posts
    // Full queries require indexing
    let filtered = [...userPosts];

    // Filter by topic and location using shared utilities
    filtered = filterByTopic(filtered, (p) => [...p.context.topics], params.topic);
    filtered = filterByString(filtered, (p) => p.context.locationName, params.location);

    // Sort by creation time (newest first)
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

    // Apply pagination using shared utility
    return Promise.resolve(paginate(previews, params.pagination));
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

    // Filter by topic and location using shared utilities
    filtered = filterByTopic(filtered, (p) => [...p.context.topics], params.topic);
    filtered = filterByString(filtered, (p) => p.context.locationName, params.location);

    // Sort by creation time (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    // Apply pagination using shared utility
    return Promise.resolve(paginate(filtered, params.pagination));
  }

  async illuminate(post: NewPost): Promise<Result<PostId, string>> {
    const connectedAddress = getConnectedWallet();
    const dimCredential = getConnectedCredential();

    if (connectedAddress === null || dimCredential === null) {
      return err('Wallet not connected. Please connect your wallet to illuminate.');
    }

    const now = Date.now();

    // Build full post with author info
    const fullPost: Post = {
      id: '' as PostId, // Will be replaced with CID
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
  }
}

// Export a singleton instance
export const signalService = new SignalServiceImpl();

// Legacy alias for backward compatibility
export { SignalServiceImpl as MockSignalService };
