/**
 * D3 map rendering utilities for Firefly Network.
 * SVG-based world map with bundled TopoJSON data.
 */

import * as d3 from 'd3';
import { geoNaturalEarth1, type GeoProjection, type GeoPath } from 'd3-geo';
import type { FeatureCollection } from 'geojson';

// Firefly-themed colors
const COLORS = {
  countryFill: '#0a0a0a',
  countryHover: '#141414',
  countryStroke: '#222222',
  markerPrimary: '#E8B931', // Firefly gold
  markerHighlight: '#f5d060',
  markerCorroborated: '#4ADE80',
  markerChallenged: '#F87171',
  markerStroke: '#000000',
  labelText: '#a0a0a0',
  radiusFill: 'rgba(232, 185, 49, 0.15)',
} as const;

const KM_PER_DEGREE = 111;

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  label?: string | undefined;
  highlighted?: boolean | undefined;
  status?: 'pending' | 'corroborated' | 'challenged' | undefined;
}

interface SelectedPoint {
  lat: number;
  lon: number;
}

export function createProjection(width: number, height: number): GeoProjection {
  return geoNaturalEarth1()
    .scale(width / 5.5)
    .translate([width / 2, height / 2]);
}

export function renderCountries(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  countries: FeatureCollection,
  pathGenerator: GeoPath,
  interactive: boolean
): void {
  g.append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('d', (d) => pathGenerator(d) ?? '')
    .attr('fill', COLORS.countryFill)
    .attr('stroke', COLORS.countryStroke)
    .attr('stroke-width', 0.5)
    .style('cursor', interactive ? 'pointer' : 'default')
    .on('mouseover', function () {
      if (interactive) d3.select(this).attr('fill', COLORS.countryHover);
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', COLORS.countryFill);
    });
}

export function renderSelectedPoint(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  projection: GeoProjection,
  selectedPoint: SelectedPoint,
  radiusKm: number
): void {
  const center = projection([selectedPoint.lon, selectedPoint.lat]);
  if (center == null) return;

  const radiusDeg = radiusKm / KM_PER_DEGREE;
  const edge = projection([selectedPoint.lon + radiusDeg, selectedPoint.lat]);
  const radiusPx = edge != null ? Math.abs(edge[0] - center[0]) : 20;

  // Radius circle
  g.append('circle')
    .attr('cx', center[0])
    .attr('cy', center[1])
    .attr('r', radiusPx)
    .attr('fill', COLORS.radiusFill)
    .attr('stroke', COLORS.markerPrimary)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4,2');

  // Center point
  g.append('circle')
    .attr('cx', center[0])
    .attr('cy', center[1])
    .attr('r', 6)
    .attr('fill', COLORS.markerPrimary)
    .attr('stroke', COLORS.markerStroke)
    .attr('stroke-width', 2);
}

function getMarkerColor(marker: MapMarker): string {
  if (marker.status === 'corroborated') return COLORS.markerCorroborated;
  if (marker.status === 'challenged') return COLORS.markerChallenged;
  if (marker.highlighted === true) return COLORS.markerHighlight;
  return COLORS.markerPrimary;
}

export function renderMarkers(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  projection: GeoProjection,
  markers: MapMarker[],
  onMarkerClick?: (marker: MapMarker) => void
): void {
  const markerGroup = g.append('g').attr('class', 'markers');

  markers.forEach((marker) => {
    const pos = projection([marker.lon, marker.lat]);
    if (pos == null) return;

    const color = getMarkerColor(marker);

    const markerG = markerGroup
      .append('g')
      .attr('transform', `translate(${pos[0]}, ${pos[1]})`)
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent) => {
        event.stopPropagation();
        if (onMarkerClick != null) {
          onMarkerClick(marker);
        }
      });

    // Pulse ring
    markerG
      .append('circle')
      .attr('r', 12)
      .attr('fill', 'rgba(232, 185, 49, 0.3)')
      .attr('class', 'pulse-ring');

    // Main marker
    markerG
      .append('circle')
      .attr('r', marker.highlighted === true ? 8 : 6)
      .attr('fill', color)
      .attr('stroke', COLORS.markerStroke)
      .attr('stroke-width', 2);

    // Label
    if (marker.label != null && marker.label !== '') {
      markerG
        .append('text')
        .attr('y', -14)
        .attr('text-anchor', 'middle')
        .attr('fill', COLORS.labelText)
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .text(marker.label);
    }
  });
}

export function setupZoom(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  g: d3.Selection<SVGGElement, unknown, null, undefined>
): d3.ZoomBehavior<SVGSVGElement, unknown> {
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 8])
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      g.attr('transform', event.transform.toString());
    });

  svg.call(zoom);
  svg.on('dblclick.zoom', () => {
    svg
      .transition()
      .duration(500)
      .call((transition) => zoom.transform(transition, d3.zoomIdentity));
  });

  return zoom;
}

export function handleMapClick(
  projection: GeoProjection,
  gEl: SVGGElement,
  event: MouseEvent,
  onMapClick: (lat: number, lon: number) => void
): void {
  const [mx, my] = d3.pointer(event, gEl);
  const coords = projection.invert?.([mx, my]);
  if (coords != null) onMapClick(coords[1], coords[0]);
}
