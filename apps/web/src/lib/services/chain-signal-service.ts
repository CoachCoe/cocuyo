/**
 * Chain-backed implementation of the PostService.
 *
 * Stores and retrieves posts from the Bulletin Chain using
 * @polkadot-apps/bulletin for data storage.
 *
 * NOTE: This is a partial implementation. Full functionality requires:
 * 1. Off-chain indexing for efficient queries
 * 2. Real DIM credential signing infrastructure
 *
 * Use PostServiceImpl for demos until signing infrastructure is ready.
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
import { err } from '@cocuyo/types';
import { getBulletinClient } from '../chain/client';

/**
 * Chain-backed post service.
 *
 * Provides real blockchain storage for posts via Bulletin Chain.
 * Query methods return empty results until indexing is implemented.
 */
export class ChainSignalService implements PostService {
  /**
   * Get a post by its CID.
   *
   * Fetches the post data from Bulletin Chain and parses it.
   * Returns null if the post doesn't exist or parsing fails.
   */
  async getPost(id: PostId, _locale?: string): Promise<Post | null> {
    try {
      const bulletin = await getBulletinClient();
      const stored = await bulletin.fetchJson<Post>(id);
      return stored;
    } catch {
      return null;
    }
  }

  /**
   * Get all posts in a chain.
   *
   * TODO: Implement chain index queries.
   * Returns empty array until indexing is available.
   */
  getChainPosts(_chainId: ChainId, _locale?: string): Promise<readonly Post[]> {
    return Promise.resolve([]);
  }

  /**
   * Get recent posts.
   *
   * TODO: Implement indexing for efficient queries.
   * Returns empty results until indexing is available.
   */
  getRecentPosts(_params: {
    topic?: string;
    location?: string;
    status?: PostStatus;
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<PostPreview>> {
    return Promise.resolve({
      items: [],
      total: 0,
      hasMore: false,
    });
  }

  /**
   * Get recent posts with full data for display components.
   *
   * TODO: Implement indexing for efficient queries.
   * Returns empty results until indexing is available.
   */
  getRecentPostsForDisplay(_params: {
    topic?: string;
    location?: string;
    status?: PostStatus;
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<Post>> {
    return Promise.resolve({
      items: [],
      total: 0,
      hasMore: false,
    });
  }

  /**
   * Get all posts (for /posts page).
   *
   * TODO: Implement indexing for efficient queries.
   * Returns empty results until indexing is available.
   *
   * Note: This method is an extended implementation detail, not part of
   * the core PostService interface. Used by the posts listing page.
   */
  getAllPosts(_params: {
    pagination: PaginationParams;
    locale?: string;
  }): Promise<PaginatedResult<PostPreview>> {
    return Promise.resolve({
      items: [],
      total: 0,
      hasMore: false,
    });
  }

  /**
   * Illuminate a new post.
   *
   * GUARD: This method requires real DIM signing infrastructure.
   * Currently returns an error indicating signing is not yet implemented.
   * Use PostServiceImpl for demos.
   *
   * When signing is implemented, this will:
   * 1. Sign the post content with the user's DIM credential
   * 2. Compute the CID from the signed content
   * 3. Upload to Bulletin Chain
   * 4. Return the CID as PostId
   */
  illuminate(_post: NewPost): Promise<Result<PostId, string>> {
    // GUARD: Real signing infrastructure required
    //
    // To implement this properly, we need:
    // 1. DIM credential from the connected wallet
    // 2. Ring VRF proof generation for anonymous signing
    // 3. CID computation before upload (not after)
    //
    // For now, return a clear error directing to PostServiceImpl for demos.
    return Promise.resolve(
      err(
        'On-chain illumination requires DIM signing infrastructure. ' +
          'Use PostServiceImpl (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
      )
    );
  }
}
