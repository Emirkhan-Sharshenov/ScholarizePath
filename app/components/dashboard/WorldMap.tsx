"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect, useLayoutEffect } from "react";
import MapGL, { Layer, NavigationControl, Source, type MapEvent, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre";
import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";
import { feature as topojsonFeature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import { Building2, Award } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import {
    CHOROPLETH_STEPS,
    COUNTRY_TO_REGION,
    REGIONS_DATA,
    remapToTopojsonNames,
    type MapStats,
} from "./mapData";


// Self-hosted instead of fetched from jsdelivr on every visitor's first load —
// removes a third-party runtime dependency (and its latency/outage risk) from
// the dashboard's critical path. Source: world-atlas@2 countries-50m.
const geoUrl = "/data/countries-50m.json";

// Camera targets for each region in the filter list. Hardcoded instead of
// computed from the countries' geometry: Europe includes Russia, whose bbox
// would otherwise stretch the view across half the planet.
const REGION_BOUNDS: Record<string, [[number, number], [number, number]]> = {
    "north-america": [[-168, 7], [-52, 72]],
    "south-america": [[-92, -56], [-32, 13]],
    europe: [[-25, 34], [45, 71]],
    asia: [[25, -11], [150, 55]],
    africa: [[-20, -36], [55, 38]],
    australia: [[110, -48], [180, 0]],
};

const WORLD_BOUNDS: [[number, number], [number, number]] = [[-168, -56], [180, 78]];

// No basemap tiles — just the self-hosted country polygons on a plain
// background, so the map keeps the site's flat blue look and needs no API key.
const MAP_STYLE: StyleSpecification = {
    version: 8,
    sources: {},
    layers: [{ id: "background", type: "background", paint: { "background-color": "#F8FAFD" } }],
};

// The same thresholds as CHOROPLETH_STEPS, as a MapLibre `step` expression.
const CHOROPLETH_FILL: ExpressionSpecification = [
    "step",
    ["get", "unis"],
    CHOROPLETH_STEPS[0].color,
    1, CHOROPLETH_STEPS[1].color,
    26, CHOROPLETH_STEPS[2].color,
    46, CHOROPLETH_STEPS[3].color,
    66, CHOROPLETH_STEPS[4].color,
    81, CHOROPLETH_STEPS[5].color,
];

const HOVER_FILL = "#0058BD";
const SELECTED_FILL = "#F5A524";
const NEUTRAL_FILL = "#E5E7EB";

interface CountryProperties {
    name: string;
    unis: number;
    scholarships: number;
    regionId: string;
    hasData: boolean;
}

export interface MapCountry {
    name: string;
    unis: number;
    scholarships: number;
}

interface WorldMapProps {
    selectedRegionId?: string | null;
    hoveredRegionId?: string | null;
    selectedCountryName?: string | null;
    onSelectCountry?: (country: MapCountry | null) => void;
    /** Total universities across all countries, once the live counts load. */
    onTotalChange?: (total: number) => void;
}

// Rings that cross the antimeridian (Russia's Chukotka, Fiji) jump from +180
// to -180 and MapLibre draws them as a band across the whole map. Shift the
// western half by +360° so the shape stays in one piece east of 180°.
function unwrapAntimeridian(geometry: Geometry): Geometry {
    const fixRing = (ring: Position[]): Position[] => {
        const lons = ring.map((p) => p[0]);
        if (Math.max(...lons) - Math.min(...lons) <= 180) return ring;
        return ring.map(([lon, lat]) => [lon < 0 ? lon + 360 : lon, lat]);
    };

    if (geometry.type === "Polygon") {
        return { ...geometry, coordinates: geometry.coordinates.map(fixRing) };
    }
    if (geometry.type === "MultiPolygon") {
        return { ...geometry, coordinates: geometry.coordinates.map((polygon) => polygon.map(fixRing)) };
    }
    return geometry;
}

// Loads the world-atlas TopoJSON once and converts it to the GeoJSON MapLibre
// expects. Antarctica is dropped: on a Mercator map it becomes a huge band
// along the bottom with no universities in it.
function useCountryShapes() {
    const [shapes, setShapes] = useState<Feature<Geometry, { name: string }>[] | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch(geoUrl)
            .then((res) => res.json())
            .then((topology: Topology) => {
                if (cancelled) return;
                const collection = topojsonFeature(
                    topology,
                    topology.objects.countries as GeometryCollection<{ name: string }>
                );
                setShapes(
                    collection.features
                        .filter((f) => f.properties.name !== "Antarctica")
                        .map((f) => ({ ...f, geometry: unwrapAntimeridian(f.geometry) }))
                );
            })
            .catch((err) => console.error("Failed to load country shapes:", err));

        return () => {
            cancelled = true;
        };
    }, []);

    return shapes;
}

export default function WorldMap({
    selectedRegionId,
    hoveredRegionId,
    selectedCountryName,
    onSelectCountry,
    onTotalChange,
}: WorldMapProps) {
    const [hoveredCountry, setHoveredCountry] = useState<MapCountry | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
    const [stats, setStats] = useState<MapStats | null>(null);
    const [statsError, setStatsError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    const mapRef = useRef<MapRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const shapes = useCountryShapes();

    const activeRegion = useMemo(
        () => REGIONS_DATA.find((r) => r.id === selectedRegionId),
        [selectedRegionId]
    );

    useEffect(() => {
        let cancelled = false;

        fetch("/api/dashboard/map-stats")
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                return res.json();
            })
            .then((data: MapStats) => {
                if (cancelled) return;
                onTotalChange?.(Object.values(data.universities).reduce((sum, n) => sum + n, 0));
                setStats({
                    universities: remapToTopojsonNames(data.universities),
                    scholarships: remapToTopojsonNames(data.scholarships),
                });
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("Failed to load map stats:", err);
                setStatsError(true);
            });

        return () => {
            cancelled = true;
        };
        // onTotalChange is a notification callback; re-fetching when its identity
        // changes would be wasteful.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [retryKey]);

    // Country polygons with the per-country counts baked into their properties,
    // so the fill color can be computed by MapLibre on the GPU.
    const countries = useMemo<FeatureCollection<Geometry, CountryProperties> | null>(() => {
        if (!shapes) return null;

        return {
            type: "FeatureCollection",
            features: shapes.map((shape, index) => {
                const name = shape.properties.name;
                const unis = stats?.universities[name] ?? 0;
                const scholarships = stats?.scholarships[name] ?? 0;

                return {
                    ...shape,
                    id: index,
                    properties: {
                        name,
                        unis,
                        scholarships,
                        regionId: COUNTRY_TO_REGION.get(name.toLowerCase()) ?? "",
                        hasData: unis > 0 || scholarships > 0,
                    },
                };
            }),
        };
    }, [shapes, stats]);

    const fillColor = useMemo<ExpressionSpecification>(() => {
        const baseColor: ExpressionSpecification | string = activeRegion
            ? ["case", ["==", ["get", "regionId"], activeRegion.id], activeRegion.hexColor, NEUTRAL_FILL]
            : CHOROPLETH_FILL;
        const hoverColor: ExpressionSpecification | string = activeRegion
            ? ["case", ["==", ["get", "regionId"], activeRegion.id], activeRegion.hexColor, "#CBD5E1"]
            : ["case", ["get", "hasData"], HOVER_FILL, "#CBD5E1"];

        return [
            "case",
            ["==", ["get", "name"], selectedCountryName ?? "__none__"], SELECTED_FILL,
            ["boolean", ["feature-state", "hover"], false], hoverColor,
            baseColor,
        ];
    }, [activeRegion, selectedCountryName]);

    // Fly to the region picked in the filter list, or back out to the whole world.
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const bounds = selectedRegionId ? REGION_BOUNDS[selectedRegionId] : WORLD_BOUNDS;
        if (bounds) map.fitBounds(bounds, { padding: 24, duration: 900 });
    }, [selectedRegionId]);

    // Keeps the tooltip inside the map card — flips to the other side of the
    // cursor near the right/bottom edges.
    useLayoutEffect(() => {
        const tooltipEl = tooltipRef.current;
        const container = containerRef.current;
        if (!tooltipEl || !container || !tooltipPos) return;

        const tw = tooltipEl.offsetWidth;
        const th = tooltipEl.offsetHeight;
        const { width, height } = container.getBoundingClientRect();

        let x = tooltipPos.x + 15;
        let y = tooltipPos.y - 15;
        if (x > width - tw - 8) x = tooltipPos.x - tw - 15;
        if (x < 8) x = 8;
        if (y < 8) y = tooltipPos.y + 15;
        if (y > height - th - 8) y = height - th - 8;

        tooltipEl.style.transform = `translate(${x}px, ${y}px)`;
    }, [tooltipPos, hoveredCountry]);

    // Hover highlight lives in MapLibre's feature-state (no React re-render per
    // mouse move); the ref remembers which country to un-highlight next.
    const hoveredFeatureIdRef = useRef<number | null>(null);
    const setHoverState = useCallback((id: number | null) => {
        const map = mapRef.current;
        const prev = hoveredFeatureIdRef.current;
        if (prev === id) return;
        if (map && prev !== null) map.setFeatureState({ source: "countries", id: prev }, { hover: false });
        if (map && id !== null) map.setFeatureState({ source: "countries", id }, { hover: true });
        hoveredFeatureIdRef.current = id;
    }, []);

    // "__none__" never matches a real region, so nothing gets outlined/darkened.
    const outlinedRegionId = selectedRegionId ?? hoveredRegionId ?? "__none__";

    const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
        const feature = e.features?.[0];
        const props = feature?.properties as CountryProperties | undefined;

        setHoverState(typeof feature?.id === "number" ? feature.id : null);

        if (props?.hasData) {
            setHoveredCountry({ name: props.name, unis: props.unis, scholarships: props.scholarships });
            setTooltipPos({ x: e.point.x, y: e.point.y });
        } else {
            setHoveredCountry(null);
        }
    }, [setHoverState]);

    const handleMouseLeave = useCallback(() => {
        setHoverState(null);
        setHoveredCountry(null);
    }, [setHoverState]);

    // Клик/тап по стране открывает её панель, по пустому месту (океан) — закрывает.
    const handleClick = useCallback((e: MapLayerMouseEvent) => {
        const props = e.features?.[0]?.properties as CountryProperties | undefined;
        onSelectCountry?.(
            props?.hasData ? { name: props.name, unis: props.unis, scholarships: props.scholarships } : null
        );
    }, [onSelectCountry]);

    // Don't let users zoom out past the fitted world view — there's nothing
    // but empty background beyond it.
    const [minZoom, setMinZoom] = useState(-2);
    const handleLoad = useCallback((e: MapEvent) => {
        setMinZoom(Math.max(-2, e.target.getZoom() - 0.25));
    }, []);

    const hoveredCountryHasData = hoveredCountry !== null;

    return (
        <div className="relative w-full h-full">
            <div
                ref={containerRef}
                className="relative w-full h-full min-h-[220px] overflow-hidden rounded-2xl bg-[#F8FAFD]"
            >
                <MapGL
                    ref={mapRef}
                    initialViewState={{ bounds: WORLD_BOUNDS, fitBoundsOptions: { padding: 8 } }}
                    mapStyle={MAP_STYLE}
                    style={{ width: "100%", height: "100%" }}
                    renderWorldCopies={false}
                    attributionControl={false}
                    dragRotate={false}
                    pitchWithRotate={false}
                    touchPitch={false}
                    // Scrolling the page over the map shouldn't hijack it: zoom with
                    // Ctrl/⌘ + scroll, two fingers on touch, or the +/− buttons.
                    cooperativeGestures
                    // Starts below zoom 0 so the whole world still fits a narrow phone
                    // card (at zoom 0 the world is 512px wide); tightened on load.
                    minZoom={minZoom}
                    maxZoom={6}
                    interactiveLayerIds={["country-fill"]}
                    cursor={hoveredCountryHasData ? "pointer" : "grab"}
                    onLoad={handleLoad}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                >
                    <NavigationControl position="top-right" showCompass={false} />

                    {countries && (
                        <Source id="countries" type="geojson" data={countries}>
                            <Layer
                                id="country-fill"
                                type="fill"
                                paint={{ "fill-color": fillColor, "fill-color-transition": { duration: 200 } }}
                            />
                            {/* Darkens the zone while its row in the filter list is hovered,
                                so it's obvious which countries it covers. */}
                            <Layer
                                id="region-preview"
                                type="fill"
                                filter={["==", ["get", "regionId"], hoveredRegionId ?? "__none__"]}
                                paint={{ "fill-color": "#0F172A", "fill-opacity": 0.18 }}
                            />
                            <Layer
                                id="country-border"
                                type="line"
                                paint={{ "line-color": "#FFFFFF", "line-width": 0.6 }}
                            />
                            <Layer
                                id="country-outline-selected"
                                type="line"
                                filter={["==", ["get", "name"], selectedCountryName ?? "__none__"]}
                                paint={{ "line-color": "#0A1A3F", "line-width": 1.5 }}
                            />
                            <Layer
                                id="country-outline-active"
                                type="line"
                                paint={{
                                    "line-color": "#1E293B",
                                    "line-width": 1,
                                    "line-opacity": [
                                        "case",
                                        ["boolean", ["feature-state", "hover"], false], 1,
                                        ["==", ["get", "regionId"], outlinedRegionId], 1,
                                        0,
                                    ],
                                }}
                            />
                        </Source>
                    )}
                </MapGL>

                {statsError && (
                    <div className="absolute top-2 left-2 right-14 z-40 flex items-center justify-between gap-3 rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-600 shadow sm:text-sm">
                        <span>Couldn&apos;t load live university/scholarship counts.</span>
                        <button
                            type="button"
                            onClick={() => {
                                setStatsError(false);
                                setRetryKey((k) => k + 1);
                            }}
                            className="shrink-0 font-semibold text-brand hover:underline cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!selectedRegionId && (
                    <div className="pointer-events-none absolute bottom-2 left-2 z-30 flex items-center gap-1.5 rounded-full border border-slate-100 bg-white/90 px-2.5 py-1.5 shadow-sm backdrop-blur-sm sm:bottom-3 sm:left-3 sm:gap-2 sm:px-3 sm:py-2">
                        <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:inline">
                            Universities
                        </span>
                        {CHOROPLETH_STEPS.map((step) => (
                            <span
                                key={step.label}
                                title={step.label}
                                className="h-2.5 w-4 rounded-sm sm:h-3 sm:w-5"
                                style={{ backgroundColor: step.color }}
                            />
                        ))}
                        <span className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
                            More
                        </span>
                    </div>
                )}

                {hoveredCountry && (
                    <div
                        ref={tooltipRef}
                        style={{
                            position: "absolute",
                            zIndex: 50,
                            left: 0,
                            top: 0,
                            pointerEvents: "none",
                            willChange: "transform",
                        }}
                        className="max-w-[170px] rounded-2xl border border-slate-100 bg-white/95 p-3 text-[11px] shadow-xl backdrop-blur-sm pointer-coarse:hidden sm:max-w-none sm:text-xs"
                    >
                        <div className="mb-1.5 font-bold text-slate-900">
                            {hoveredCountry.name}
                        </div>
                        <div className="space-y-1 text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 shrink-0 text-brand" />
                                <span>
                                    Universities: <span className="font-semibold text-slate-800">{hoveredCountry.unis}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Award className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                <span>
                                    Scholarships: <span className="font-semibold text-slate-800">{hoveredCountry.scholarships}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
