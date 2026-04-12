'use client';

/**
 * PostMapView — Display posts on an interactive map.
 *
 * Shows post markers colored by verification status:
 * - Gold: Verified/high corroboration
 * - Green: Corroborated
 * - Gray: Pending
 * - Red: Challenged
 *
 * Falls back to a message when map isn't available (Triangle).
 */

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { canMakeExternalRequests } from '@/lib/host/detect';
import type { Post, VerificationStatus } from '@cocuyo/types';
import type { MarkerData, MapLocation } from './BaseMap';

// Dynamic import with SSR disabled - Leaflet requires window
const BaseMap = dynamic(() => import('./BaseMap').then((m) => m.BaseMap), { ssr: false });

interface PostMapViewProps {
  posts: Post[];
  locale: string;
  selectedPostId?: string | null;
  onPostSelect?: (postId: string | null) => void;
  className?: string;
}

/**
 * Map verification status to marker color.
 */
function getMarkerColor(status: VerificationStatus, evidenceCount: number): MarkerData['color'] {
  if (status === 'disputed' || status === 'false') return 'red';
  if (status === 'verified' || evidenceCount >= 5) return 'gold';
  if (evidenceCount >= 2) return 'green';
  return 'gray';
}

/**
 * Extract coordinates from post context.
 * Returns null if post has no location.
 */
function getPostCoordinates(post: Post): MapLocation | null {
  const location = post.context.location;
  if (!location) return null;
  return { lat: location.latitude, lon: location.longitude };
}

/**
 * Loading state for the map.
 */
function MapLoader({ className }: { className?: string }): ReactNode {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-nested)] ${className}`}
    >
      <div className="flex flex-col items-center gap-2 text-[var(--fg-tertiary)]">
        <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm">Loading map...</span>
      </div>
    </div>
  );
}

/**
 * Fallback when map is unavailable.
 */
function MapUnavailable({ className }: { className?: string }): ReactNode {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-nested)] ${className}`}
    >
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <svg
          className="h-12 w-12 text-[var(--fg-tertiary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <div>
          <p className="font-medium text-[var(--fg-secondary)]">Map unavailable</p>
          <p className="mt-1 text-sm text-[var(--fg-tertiary)]">
            Interactive map requires network access
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Post popup content.
 */
function PostPopup({ post, locale }: { post: Post; locale: string }): ReactNode {
  return (
    <div className="min-w-[200px] max-w-[280px]">
      <p className="mb-2 line-clamp-3 text-sm text-[var(--fg-primary)]">
        {post.content.text.slice(0, 150)}
        {post.content.text.length > 150 ? '...' : ''}
      </p>

      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--fg-tertiary)]">
          {post.context.locationName ?? 'Unknown location'}
        </span>
        <Link
          href={`/${locale}/post/${post.id}`}
          className="text-[var(--color-firefly-gold)] hover:underline"
        >
          View post
        </Link>
      </div>
    </div>
  );
}

export function PostMapView({
  posts,
  locale,
  selectedPostId,
  onPostSelect,
  className = 'h-96',
}: PostMapViewProps): ReactNode {
  const [mapAvailable, setMapAvailable] = useState<boolean | null>(null);

  // Check map availability (requires network for tile loading)
  useEffect(() => {
    setMapAvailable(canMakeExternalRequests());
  }, []);

  // Filter posts that have coordinates
  const mappablePosts = posts.filter((p) => getPostCoordinates(p) !== null);

  // Convert posts to markers
  const markers: MarkerData[] = mappablePosts.map((post) => {
    const coords = getPostCoordinates(post);
    if (coords === null) {
      // This should never happen since we filtered above, but TypeScript needs assurance
      throw new Error('Unexpected null coordinates');
    }
    return {
      id: post.id,
      position: coords,
      color: getMarkerColor(post.verification.status, post.corroborations.evidenceCount),
      popup: <PostPopup post={post} locale={locale} />,
    };
  });

  // Calculate center from markers or default to world view
  const center: MapLocation =
    markers.length > 0
      ? {
          lat: markers.reduce((sum, m) => sum + m.position.lat, 0) / markers.length,
          lon: markers.reduce((sum, m) => sum + m.position.lon, 0) / markers.length,
        }
      : { lat: 20, lon: 0 };

  // Calculate zoom based on marker spread
  const zoom = markers.length > 0 ? 4 : 2;

  // Still checking availability
  if (mapAvailable === null) {
    return <MapLoader className={className} />;
  }

  // Map not available (inside Triangle)
  if (!mapAvailable) {
    return <MapUnavailable className={className} />;
  }

  // No mappable posts
  if (markers.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-nested)] ${className}`}
      >
        <p className="text-[var(--fg-tertiary)]">No posts with location data</p>
      </div>
    );
  }

  return (
    <BaseMap
      center={center}
      zoom={zoom}
      markers={markers}
      selectedMarkerId={selectedPostId ?? null}
      onMarkerClick={onPostSelect ? (id) => onPostSelect(id) : undefined}
      className={className}
    />
  );
}
