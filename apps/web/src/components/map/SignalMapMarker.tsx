'use client';

/**
 * SignalMapMarker — Custom Leaflet marker for signals.
 *
 * Uses the Firefly gold accent color and shows signal details in a popup.
 */

import { useMemo, type ReactElement } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Signal } from '@cocuyo/types';

interface SignalMapMarkerProps {
  signal: Signal;
  onClick?: (signal: Signal) => void;
}

/**
 * Create a custom gold marker icon.
 */
function createSignalIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #E8B931;
        border: 2px solid #000;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(232, 185, 49, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: #000;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'signal-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

/**
 * Format relative time.
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function SignalMapMarker({
  signal,
  onClick,
}: SignalMapMarkerProps): ReactElement | null {
  const location = signal.context.location;

  // Memoize the icon to prevent recreation on each render
  const icon = useMemo(() => createSignalIcon(), []);

  if (location == null) {
    return null;
  }

  const totalCorroborations =
    signal.corroborations.witnessCount +
    signal.corroborations.evidenceCount +
    signal.corroborations.expertiseCount;

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(signal),
      }}
    >
      <Popup>
        <div
          className="min-w-[200px] max-w-[280px]"
          style={{
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Topics and metadata */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              marginBottom: '8px',
              fontSize: '11px',
              color: '#666',
            }}
          >
            {signal.context.topics.slice(0, 2).map((topic) => (
              <span
                key={topic}
                style={{
                  padding: '2px 6px',
                  backgroundColor: '#1A1A1A',
                  borderRadius: '4px',
                  color: '#A0A0A0',
                }}
              >
                {topic}
              </span>
            ))}
            {signal.context.locationName != null && (
              <span style={{ color: '#666' }}>
                {signal.context.locationName}
              </span>
            )}
          </div>

          {/* Signal content (truncated) */}
          <p
            style={{
              fontSize: '13px',
              lineHeight: '1.5',
              color: '#000',
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {signal.content.text}
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              color: '#666',
              marginBottom: '8px',
            }}
          >
            <span>
              <span style={{ color: '#4ADE80', fontWeight: 500 }}>
                {totalCorroborations}
              </span>{' '}
              corroboration{totalCorroborations !== 1 ? 's' : ''}
            </span>
            <span style={{ color: '#999' }}>
              {formatRelativeTime(signal.createdAt)}
            </span>
          </div>

          {/* Link to chain */}
          {signal.chainLinks.length > 0 && (
            <a
              href={`/chain/${signal.chainLinks[0]}`}
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#E8B931',
                textDecoration: 'none',
              }}
            >
              View Story Chain &rarr;
            </a>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
