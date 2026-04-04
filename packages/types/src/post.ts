/**
 * Post types — the primary communication unit in the Firefly Network.
 *
 * A post is a longer-form piece of content that may contain claims
 * (truth targets) that can be extracted and verified separately.
 * Posts can reference signals as supporting evidence.
 */

import type { ChainId, ClaimId, DIMCredential, PostId, SignalId } from './brands';
import type { FireflyAuthor } from './identity';
import type { MediaAttachment } from './signal';

/** Status of a post */
export type PostStatus =
  | 'draft'      // Not yet published
  | 'published'  // Live and visible
  | 'archived';  // Hidden but preserved

/** The content of a post */
export interface PostContent {
  /** Title of the post */
  readonly title: string;
  /** The main text content */
  readonly text: string;
  /** Attached media (images, up to 3) */
  readonly media?: readonly MediaAttachment[];
  /** External reference links */
  readonly links?: readonly string[];
}

/** Contextual metadata for a post */
export interface PostContext {
  /** Topic tags categorizing this post */
  readonly topics: readonly string[];
  /** Optional location name */
  readonly locationName?: string;
}

/**
 * A post — the primary communication unit for longer-form content.
 *
 * Every post:
 * - Is created by a verified human (via DIM)
 * - May contain claims that can be extracted for verification
 * - Can link to supporting signals as evidence
 * - Can be connected to a story chain
 */
export interface Post {
  /** Unique identifier */
  readonly id: PostId;
  /** CID on Bulletin Chain */
  readonly cid?: string;
  /** Author info (privacy-controlled) */
  readonly author: FireflyAuthor;
  /** The content of this post */
  readonly content: PostContent;
  /** Contextual metadata */
  readonly context: PostContext;
  /** DIM signature proving a verified human created this */
  readonly dimSignature: DIMCredential;
  /** Current status */
  readonly status: PostStatus;
  /** Claims extracted from this post */
  readonly extractedClaimIds: readonly ClaimId[];
  /** Signals linked as supporting evidence */
  readonly relatedSignalIds: readonly SignalId[];
  /** Story chain this post is linked to */
  readonly relatedChainId?: ChainId;
  /** When this post was created (Unix timestamp) */
  readonly createdAt: number;
  /** When this post was last updated (Unix timestamp) */
  readonly updatedAt: number;
}

/**
 * A lightweight preview of a post for list views.
 */
export interface PostPreview {
  readonly id: PostId;
  readonly title: string;
  readonly excerpt: string;
  readonly topics: readonly string[];
  readonly locationName?: string;
  readonly status: PostStatus;
  readonly claimCount: number;
  readonly signalCount: number;
  readonly createdAt: number;
}

/**
 * Input type for creating a new post.
 */
export interface NewPost {
  readonly content: PostContent;
  readonly context: PostContext;
  /** Optional: link to existing signals as evidence */
  readonly relatedSignalIds?: readonly SignalId[];
  /** Optional: link to a story chain */
  readonly relatedChainId?: ChainId;
}
