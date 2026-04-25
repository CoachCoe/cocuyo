/**
 * Frontend helper for claim extraction.
 *
 * Calls the Cloudflare Worker to extract verifiable claims from text using AI.
 * The OpenAI API key is kept secure on the edge worker - never exposed to browsers.
 */

import type { ExtractedClaim, ExtractClaimsResponse, ExtractClaimsError } from './types';

// Cloudflare Worker endpoint for claim extraction
// Set via NEXT_PUBLIC_CLAIM_EXTRACTOR_URL environment variable
const CLAIM_EXTRACTOR_URL =
  process.env.NEXT_PUBLIC_CLAIM_EXTRACTOR_URL ?? 'https://claim-extractor.cocuyo.workers.dev';

/**
 * Extract verifiable claims from text using AI.
 *
 * @param text - The text to extract claims from
 * @returns Array of extracted claims, or empty array if none found
 * @throws Error if the API call fails
 *
 * @example
 * ```ts
 * const claims = await extractClaims("Gas prices have tripled since 2020");
 * // [{ claim: "Gas prices have tripled since 2020", checkable: true, ... }]
 * ```
 */
export async function extractClaims(text: string): Promise<ExtractedClaim[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const response = await fetch(`${CLAIM_EXTRACTOR_URL}/extract-claims`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text.trim() }),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as Partial<ExtractClaimsError>;
    throw new Error(error.error ?? `Claim extraction failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  // Validate response shape at runtime
  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as { claims?: unknown }).claims)
  ) {
    throw new Error('Invalid claim extraction response');
  }

  return (data as ExtractClaimsResponse).claims;
}

/** Result of extractBestClaim - distinguishes between no claims and errors */
export type ExtractBestClaimResult =
  | { ok: true; claim: string }
  | { ok: true; claim: null; reason: 'no_claims' }
  | { ok: false; reason: 'ai_error'; error: string };

/**
 * Extract claims and return the best single claim for quick extraction.
 *
 * Used by the "Extract Claim" button for one-click extraction.
 * Returns the first checkable claim, or the first claim if none are checkable.
 *
 * @param text - The text to extract claims from
 * @returns Result object with the claim or error reason
 */
export async function extractBestClaim(text: string): Promise<ExtractBestClaimResult> {
  try {
    const claims = await extractClaims(text);

    if (claims.length === 0) {
      return { ok: true, claim: null, reason: 'no_claims' };
    }

    // Prefer checkable claims
    const checkable = claims.find((c) => c.checkable);
    if (checkable) {
      return { ok: true, claim: checkable.claim };
    }

    // Fall back to first claim
    const firstClaim = claims[0]?.claim;
    if (firstClaim !== undefined && firstClaim !== '') {
      return { ok: true, claim: firstClaim };
    }

    return { ok: true, claim: null, reason: 'no_claims' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI extraction failed';
    return { ok: false, reason: 'ai_error', error: message };
  }
}
