'use client';

/**
 * BaseMap — Core Leaflet map wrapper with dark theme.
 *
 * Provides:
 * - OpenStreetMap tiles
 * - Custom marker icons (firefly gold, verified green, challenged red)
 * - Click handling
 * - Fly-to animation
 * - Current location detection
 *
 * Must be lazy-loaded to avoid SSR issues with Leaflet.
 */

import { useEffect, type ReactNode } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue in Next.js
// Use inline SVG to avoid external network requests (required for Triangle sandbox)
if (typeof window !== 'undefined') {
  // @ts-expect-error - Leaflet icon fix for webpack
  delete L.Icon.Default.prototype._getIconUrl;

  // Default blue marker as inline SVG (no external requests)
  const defaultMarkerSvg = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#2563eb" stroke="#1d4ed8" stroke-width="2"
        d="M12.5 0C5.5 0 0 5.5 0 12.5c0 8 12.5 28.5 12.5 28.5S25 20.5 25 12.5C25 5.5 19.5 0 12.5 0z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `;
  const defaultIconUrl = `data:image/svg+xml;base64,${btoa(defaultMarkerSvg)}`;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: defaultIconUrl,
    iconUrl: defaultIconUrl,
    shadowUrl: '', // No shadow needed for SVG icons
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

export interface MapLocation {
  lat: number;
  lon: number;
}

export interface MarkerData {
  id: string;
  position: MapLocation;
  color: 'gold' | 'green' | 'red' | 'gray';
  popup?: ReactNode;
}

interface BaseMapProps {
  center?: MapLocation;
  zoom?: number;
  markers?: MarkerData[];
  selectedMarkerId?: string | null;
  onMarkerClick?: ((id: string) => void) | undefined;
  onClick?: ((location: MapLocation) => void) | undefined;
  showUserLocation?: boolean;
  userLocation?: MapLocation | null;
  radiusMeters?: number;
  className?: string;
  children?: ReactNode;
}

/**
 * Create a colored SVG marker icon.
 */
function createMarkerIcon(fillColor: string, strokeColor: string): L.Icon {
  const svg = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"
        d="M12.5 0C5.5 0 0 5.5 0 12.5c0 8 12.5 28.5 12.5 28.5S25 20.5 25 12.5C25 5.5 19.5 0 12.5 0z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

const markerIcons = {
  gold: createMarkerIcon('#E8B931', '#C49A1C'),
  green: createMarkerIcon('#4ADE80', '#22c55e'),
  red: createMarkerIcon('#ef4444', '#dc2626'),
  gray: createMarkerIcon('#666666', '#444444'),
};

/**
 * Internal component to handle map click events.
 */
function MapClickHandler({
  onClick,
}: {
  onClick?: (location: MapLocation) => void;
}): null {
  useMapEvents({
    click(e) {
      onClick?.({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Internal component to fly to a location.
 */
function FlyToLocation({ location }: { location: MapLocation | null }): null {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lon], 14, { duration: 1.5 });
    }
  }, [location, map]);

  return null;
}

/**
 * Base map component with dark theme styling.
 */
export function BaseMap({
  center = { lat: 20, lon: 0 }, // Default world view
  zoom = 2,
  markers = [],
  selectedMarkerId,
  onMarkerClick,
  onClick,
  showUserLocation = false,
  userLocation,
  radiusMeters,
  className = '',
  children,
}: BaseMapProps): ReactNode {
  const selectedMarker = markers.find((m) => m.id === selectedMarkerId);

  return (
    <div className={`rounded-lg overflow-hidden border border-[var(--border-default)] ${className}`}>
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={zoom}
        className="h-full w-full"
        style={{ background: 'var(--bg-surface-nested)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map click handler */}
        {onClick && <MapClickHandler onClick={onClick} />}

        {/* Fly to selected marker */}
        {selectedMarker && (
          <FlyToLocation location={selectedMarker.position} />
        )}

        {/* User location marker */}
        {showUserLocation && userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lon]}
              icon={markerIcons.gold}
            >
              <Popup>Your location</Popup>
            </Marker>
            {radiusMeters !== undefined && radiusMeters > 0 && (
              <Circle
                center={[userLocation.lat, userLocation.lon]}
                radius={radiusMeters}
                pathOptions={{
                  color: '#E8B931',
                  fillColor: '#E8B931',
                  fillOpacity: 0.1,
                }}
              />
            )}
          </>
        )}

        {/* Data markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lon]}
            icon={markerIcons[marker.color]}
            eventHandlers={{
              click: () => onMarkerClick?.(marker.id),
            }}
          >
            {marker.popup !== undefined && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}

        {/* Selected marker radius */}
        {selectedMarker !== undefined && radiusMeters !== undefined && radiusMeters > 0 && (
          <Circle
            center={[selectedMarker.position.lat, selectedMarker.position.lon]}
            radius={radiusMeters}
            pathOptions={{
              color: markerIcons[selectedMarker.color] === markerIcons.gold ? '#E8B931' : '#4ADE80',
              fillOpacity: 0.1,
            }}
          />
        )}

        {children}
      </MapContainer>
    </div>
  );
}
