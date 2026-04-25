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
  process.env.NEXT_PUBLIC_CLAIM_EXTRACTOR_URL ??
  'https://claim-extractor.cocuyo.workers.dev';

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
    const error = (await response.json().catch(() => ({}))) as ExtractClaimsError;
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

/**
 * Extract claims and return the best single claim for quick extraction.
 *
 * Used by the "Extract Claim" button for one-click extraction.
 * Returns the first checkable claim, or the first claim if none are checkable.
 *
 * @param text - The text to extract claims from
 * @returns The best claim statement, or null if none found
 */
export async function extractBestClaim(text: string): Promise<string | null> {
  try {
    const claims = await extractClaims(text);

    if (claims.length === 0) {
      return null;
    }

    // Prefer checkable claims
    const checkable = claims.find((c) => c.checkable);
    if (checkable) {
      return checkable.claim;
    }

    // Fall back to first claim
    return claims[0]?.claim ?? null;
  } catch {
    // If AI extraction fails, return null (caller can fall back to original behavior)
    return null;
  }
}
