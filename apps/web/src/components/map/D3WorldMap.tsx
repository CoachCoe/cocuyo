'use client';

/**
 * SVG world map using D3 with bundled TopoJSON data.
 * Zero HTTP requests at runtime — works in Triangle sandbox.
 */

import { useRef, useEffect, useState, useMemo, type ReactElement } from 'react';
import * as d3 from 'd3';
import { geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { FeatureCollection } from 'geojson';
import worldData from 'world-atlas/countries-110m.json';
import {
  createProjection,
  renderCountries,
  renderSelectedPoint,
  renderMarkers,
  setupZoom,
  handleMapClick,
  type MapMarker,
} from './mapRenderer';

export type { MapMarker };

interface WorldTopology extends Topology {
  objects: { countries: GeometryCollection; land: GeometryCollection };
}

export interface D3WorldMapProps {
  markers?: MapMarker[];
  selectedPoint?: { lat: number; lon: number } | null;
  radiusKm?: number;
  interactive?: boolean;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lon: number) => void;
}

const ZOOM_DURATION = 300;

export function D3WorldMap({
  markers = [],
  onMarkerClick,
  onMapClick,
  selectedPoint,
  radiusKm = 50,
  interactive = true,
  className = '',
}: D3WorldMapProps): ReactElement {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Convert TopoJSON to GeoJSON once
  const countries = useMemo((): FeatureCollection => {
    const topology = worldData as unknown as WorldTopology;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    return feature(topology as any, topology.objects.countries as any) as unknown as FeatureCollection;
  }, []);

  // Resize observer
  useEffect(() => {
    const parent = svgRef.current?.parentElement;
    if (parent == null) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry == null) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setDimensions({ width, height });
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // D3 rendering
  useEffect(() => {
    const svgEl = svgRef.current;
    const gEl = gRef.current;
    if (svgEl == null || gEl == null) return;

    const svg = d3.select(svgEl);
    const g = d3.select(gEl);
    const { width, height } = dimensions;

    const projection = createProjection(width, height);
    const pathGenerator = geoPath().projection(projection);

    // Clear and redraw
    g.selectAll('*').remove();

    renderCountries(g, countries, pathGenerator, interactive);

    if (selectedPoint != null) {
      renderSelectedPoint(g, projection, selectedPoint, radiusKm);
    }

    renderMarkers(g, projection, markers, onMarkerClick);

    if (onMapClick != null && interactive) {
      svg.on('click', (event: MouseEvent) => handleMapClick(projection, gEl, event, onMapClick));
    }

    if (interactive) {
      setupZoom(svg, g);
    }
  }, [dimensions, countries, markers, selectedPoint, radiusKm, interactive, onMarkerClick, onMapClick]);

  const handleZoom = (scale: number): void => {
    const svgEl = svgRef.current;
    if (svgEl == null) return;
    const svg = d3.select(svgEl);
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([1, 8]);
    svg
      .transition()
      .duration(ZOOM_DURATION)
      .call((transition) => zoom.scaleBy(transition, scale));
  };

  return (
    <div className={`relative h-full w-full bg-surface-main ${className}`}>
      <svg
        ref={svgRef}
        className="h-full w-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <style>{`
            .pulse-ring { animation: pulse 2s ease-out infinite; }
            @keyframes pulse {
              0% { r: 6; opacity: 1; }
              100% { r: 20; opacity: 0; }
            }
          `}</style>
        </defs>
        <g ref={gRef} />
      </svg>

      {interactive && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleZoom(1.5)}
            className="h-8 w-8 rounded-small border border-DEFAULT bg-surface-container text-secondary transition-colors hover:bg-surface-nested"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleZoom(0.67)}
            className="h-8 w-8 rounded-small border border-DEFAULT bg-surface-container text-secondary transition-colors hover:bg-surface-nested"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}
