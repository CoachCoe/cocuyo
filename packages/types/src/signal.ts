/**
 * Signal types — the fundamental unit of information in the Firefly Network.
 *
 * A signal is not a "post." It is an observation, a piece of evidence,
 * a witness account, or a data point contributed by a verified human.
 */

import type { ChainId, ContentHash, DIMCredential, SignalId } from './brands';
import type { CorroborationSummary } from './corroboration';

/** Geographic coordinate for location context */
export interface GeoCoordinate {
  readonly latitude: number;
  readonly longitude: number;
  /** Optional accuracy radius in meters */
  readonly accuracy?: number;
}

/** Time range for when an observed event occurred */
export interface TimeRange {
  /** Start of the observed timeframe (Unix timestamp) */
  readonly start: number;
  /** End of the observed timeframe (Unix timestamp) */
  readonly end?: number;
}

/** Media attachment reference */
export interface MediaAttachment {
  /** Content hash pointing to Bulletin Chain storage */
  readonly hash: ContentHash;
  /** MIME type of the attachment */
  readonly mimeType: string;
  /** Human-readable description for accessibility */
  readonly altText?: string;
  /** File size in bytes */
  readonly size: number;
}

/** The content of a signal */
export interface SignalContent {
  /** The text content of the signal */
  readonly text: string;
  /** Attached media (images, documents) */
  readonly media?: readonly MediaAttachment[];
  /** External reference links */
  readonly links?: readonly string[];
}

/** Contextual metadata for a signal */
export interface SignalContext {
  /** Topic tags categorizing this signal */
  readonly topics: readonly string[];
  /** Optional geographic context */
  readonly location?: GeoCoordinate;
  /** Optional location name (human-readable, not for identification) */
  readonly locationName?: string;
  /** When the observed event occurred (not when the signal was created) */
  readonly timeframe?: TimeRange;
}

/**
 * A signal — the fundamental unit of information in the network.
 *
 * Every signal:
 * - Is created by a verified human (via DIM)
 * - Can be linked to story chains
 * - Carries a corroboration summary
 * - Has no visible author identity
 */
export interface Signal {
  /** Unique identifier (deterministic hash of content + signature) */
  readonly id: SignalId;
  /** The content of this signal */
  readonly content: SignalContent;
  /** Contextual metadata */
  readonly context: SignalContext;
  /** DIM signature proving a verified human created this */
  readonly dimSignature: DIMCredential;
  /** Story chains this signal is linked to */
  readonly chainLinks: readonly ChainId[];
  /** Summary of corroborations received */
  readonly corroborations: CorroborationSummary;
  /** When this signal was illuminated (Unix timestamp) */
  readonly createdAt: number;
}

/**
 * Input type for creating a new signal.
 * The id, dimSignature, corroborations, and createdAt are set by the system.
 */
export interface NewSignal {
  readonly content: SignalContent;
  readonly context: SignalContext;
  /** Optional: link to existing chains */
  readonly chainLinks?: readonly ChainId[];
}
