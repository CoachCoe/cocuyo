/**
 * Zod validators for runtime type validation.
 *
 * These validators ensure data fetched from external sources (Bulletin Chain)
 * conforms to expected types before being used in the application.
 */

import { z } from 'zod';
import {
  createChainId,
  createPostId,
  createDIMCredential,
  createContentHash,
  createCollectiveId,
} from './brands';
import type {
  StoryChain,
  Post,
  ChainPreview,
  PostPreview,
} from './index';

// ============================================================
// Brand validators (transform strings to branded types)
// ============================================================

const ChainIdSchema = z.string().transform(createChainId);
const PostIdSchema = z.string().transform(createPostId);
const DIMCredentialSchema = z.string().transform(createDIMCredential);
const ContentHashSchema = z.string().transform(createContentHash);
const CollectiveIdSchema = z.string().transform(createCollectiveId);

// ============================================================
// Enum validators
// ============================================================

const ChainStatusSchema = z.enum(['emerging', 'active', 'established', 'contested']);

const PostStatusSchema = z.enum(['published', 'archived']);

const DisclosureLevelSchema = z.enum(['anonymous', 'partial', 'public']);

const VerificationStatusSchema = z.enum([
  'unverified',
  'pending',
  'in_review',
  'verified',
  'disputed',
  'false',
  'synthetic',
]);

// ============================================================
// Chain validators
// ============================================================

const ChainStatsSchema = z.object({
  postCount: z.number(),
  corroborationCount: z.number(),
  challengeCount: z.number(),
  contributorCount: z.number(),
});

export const StoryChainSchema = z.object({
  id: ChainIdSchema,
  title: z.string(),
  description: z.string(),
  topics: z.array(z.string()),
  location: z.string().optional(),
  status: ChainStatusSchema,
  postIds: z.array(PostIdSchema),
  stats: ChainStatsSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const ChainPreviewSchema = z.object({
  id: ChainIdSchema,
  title: z.string(),
  topics: z.array(z.string()),
  location: z.string().optional(),
  status: ChainStatusSchema,
  postCount: z.number(),
  corroborationCount: z.number(),
  updatedAt: z.number(),
});

// ============================================================
// Post validators
// ============================================================

const GeoCoordinateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
});

const TimeRangeSchema = z.object({
  start: z.number(),
  end: z.number().optional(),
});

const MediaAttachmentSchema = z.object({
  hash: ContentHashSchema,
  mimeType: z.string(),
  altText: z.string().optional(),
  size: z.number(),
});

const PostContentSchema = z.object({
  title: z.string().optional(),
  text: z.string(),
  media: z.array(MediaAttachmentSchema).optional(),
  links: z.array(z.string()).optional(),
});

const PostContextSchema = z.object({
  topics: z.array(z.string()),
  location: GeoCoordinateSchema.optional(),
  locationName: z.string().optional(),
  timeframe: TimeRangeSchema.optional(),
});

const CorroborationSummarySchema = z.object({
  witnessCount: z.number(),
  evidenceCount: z.number(),
  expertiseCount: z.number(),
  challengeCount: z.number(),
});

const PostVerificationSchema = z.object({
  status: VerificationStatusSchema,
  verifiedBy: CollectiveIdSchema.optional(),
  verdictCid: z.string().optional(),
  verifiedAt: z.number().optional(),
});

const FireflyAuthorSchema = z.object({
  id: z.string(),
  credentialHash: DIMCredentialSchema,
  pseudonym: z.string(),
  disclosureLevel: DisclosureLevelSchema,
  displayName: z.string().optional(),
  location: z.string().optional(),
  reputation: z.number().optional(),
});

export const PostSchema = z.object({
  id: PostIdSchema,
  cid: z.string().optional(),
  author: FireflyAuthorSchema,
  content: PostContentSchema,
  context: PostContextSchema,
  dimSignature: DIMCredentialSchema,
  status: PostStatusSchema,
  chainLinks: z.array(ChainIdSchema),
  corroborations: CorroborationSummarySchema,
  verification: PostVerificationSchema,
  createdAt: z.number(),
});

export const PostPreviewSchema = z.object({
  id: PostIdSchema,
  title: z.string().optional(),
  excerpt: z.string(),
  topics: z.array(z.string()),
  locationName: z.string().optional(),
  status: PostStatusSchema,
  corroborationCount: z.number(),
  challengeCount: z.number(),
  createdAt: z.number(),
});

// ============================================================
// Validation helpers
// ============================================================

// NOTE ON CASTS: The `as Type` casts below are safe because:
// 1. The zod schemas validate all required fields with correct types
// 2. The .transform() calls convert strings to branded types (ChainId, PostId, etc.)
// 3. The only difference is zod's optional() returns `T | undefined` while
//    TypeScript's optional properties with exactOptionalPropertyTypes require `?: T`
// 4. Tests in validators.test.ts verify schema output matches expected types

/**
 * Validate and parse data as a StoryChain.
 * Throws ZodError if validation fails.
 */
export function parseStoryChain(data: unknown): StoryChain {
  return StoryChainSchema.parse(data) as StoryChain;
}

/**
 * Safely validate data as a StoryChain.
 * Returns null if validation fails.
 */
export function safeParseStoryChain(data: unknown): StoryChain | null {
  const result = StoryChainSchema.safeParse(data);
  return result.success ? (result.data as StoryChain) : null;
}

/**
 * Validate and parse data as a Post.
 * Throws ZodError if validation fails.
 */
export function parsePost(data: unknown): Post {
  return PostSchema.parse(data) as Post;
}

/**
 * Safely validate data as a Post.
 * Returns null if validation fails.
 */
export function safeParsePost(data: unknown): Post | null {
  const result = PostSchema.safeParse(data);
  return result.success ? (result.data as Post) : null;
}

/**
 * Validate and parse data as a ChainPreview.
 * Throws ZodError if validation fails.
 */
export function parseChainPreview(data: unknown): ChainPreview {
  return ChainPreviewSchema.parse(data) as ChainPreview;
}

/**
 * Safely validate data as a ChainPreview.
 * Returns null if validation fails.
 */
export function safeParseChainPreview(data: unknown): ChainPreview | null {
  const result = ChainPreviewSchema.safeParse(data);
  return result.success ? (result.data as ChainPreview) : null;
}

/**
 * Validate and parse data as a PostPreview.
 * Throws ZodError if validation fails.
 */
export function parsePostPreview(data: unknown): PostPreview {
  return PostPreviewSchema.parse(data) as PostPreview;
}

/**
 * Safely validate data as a PostPreview.
 * Returns null if validation fails.
 */
export function safeParsePostPreview(data: unknown): PostPreview | null {
  const result = PostPreviewSchema.safeParse(data);
  return result.success ? (result.data as PostPreview) : null;
}
