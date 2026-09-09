"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";


// Self-hosted instead of fetched from jsdelivr on every visitor's first load —
// removes a third-party runtime dependency (and its latency/outage risk) from
// the dashboard's critical path. Source: world-atlas@2 countries-50m.
const geoUrl = "/data/countries-50m.json";
const PROJECTION_CONFIG = { scale: 145 };

// The DB stores plain country names that mostly match world-atlas's
// `properties.name`, except for these two — checked directly against the
// topojson file rather than guessed.
const DB_TO_TOPOJSON_NAME: Record<string, string> = {
    "United States": "United States of America",
    "Czech Republic": "Czechia",
};

export interface RegionConfig {
    id: string;
    label: string;
    color: string;
    hexColor: string;
    countries: string[];
}

export const REGIONS_DATA: RegionConfig[] = [
    {
        id: "north-america",
        label: "North America",
        color: "bg-blue-600",
        hexColor: "#2563EB",
        countries: [
            "Canada", "United States of America", "United States", "USA", "Mexico",
            "Guatemala", "Belize", "El Salvador", "Honduras", "Nicaragua", "Costa Rica", "Panama",
            "Cuba", "Jamaica", "Haiti", "Dominican Rep.", "Dominican Republic", "Bahamas",
            "Trinidad and Tobago", "Barbados", "Saint Lucia", "St. Vincent and the Grenadines",
            "Grenada", "Antigua and Barbuda", "Dominica", "Saint Kitts and Nevis",
            "Puerto Rico", "Greenland"
        ],
    },
    {
        id: "south-america",
        label: "South America",
        color: "bg-amber-400",
        hexColor: "#FBBF24",
        countries: [
            "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador",
            "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela",
            "Falkland Is.", "French Guiana"
        ],
    },
    {
        id: "europe",
        label: "Europe",
        color: "bg-indigo-500",
        hexColor: "#6366F1",
        countries: [
            "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herz.", "Bosnia and Herzegovina",
            "Bulgaria", "Croatia", "Cyprus", "Czechia", "Czech Republic", "Denmark", "Estonia",
            "Finland", "France", "Georgia", "Germany", "Greece", "Hungary", "Iceland",
            "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg",
            "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Macedonia",
            "Norway", "Poland", "Portugal", "Romania", "Russia", "Russian Federation", "San Marino",
            "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Turkiye",
            "Ukraine", "United Kingdom", "UK"
        ],
    },
    {
        id: "asia",
        label: "Asia",
        color: "bg-sky-400",
        hexColor: "#38BDF8",
        countries: [
            "Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei",
            "Cambodia", "China", "Hong Kong", "India", "Indonesia", "Iran", "Iraq", "Israel",
            "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon",
            "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Dem. Rep. Korea",
            "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Saudi Arabia", "Singapore",
            "South Korea", "Korea, Republic of", "Sri Lanka", "Syria", "Taiwan", "Tajikistan",
            "Thailand", "Timor-Leste", "Turkmenistan", "United Arab Emirates", "UAE", "OAE", "Uzbekistan",
            "Vietnam", "Yemen"
        ],
    },
    {
        id: "africa",
        label: "Africa",
        color: "bg-pink-400",
        hexColor: "#F472B6",
        countries: [
            "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde",
            "Cameroon", "Central African Rep.", "Central African Republic", "Chad", "Comoros",
            "Congo", "Dem. Rep. Congo", "Democratic Republic of the Congo", "Djibouti", "Egypt",
            "Eq. Guinea", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon",
            "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Cote d'Ivoire",
            "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania",
            "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda",
            "S. Sudan", "South Sudan", "Sao Tome and Principe", "Senegal", "Seychelles",
            "Sierra Leone", "Somalia", "Somaliland", "South Africa", "Sudan", "Tanzania",
            "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe", "W. Sahara"
        ],
    },
    {
        id: "australia",
        label: "Australia & Oceania",
        color: "bg-emerald-400",
        hexColor: "#34D399",
        countries: [
            "Australia", "Fiji", "Kiribati", "Marshall Is.", "Micronesia", "Nauru",
            "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Is.",
            "Tonga", "Tuvalu", "Vanuatu", "New Caledonia"
        ],
    },
];

interface MapStats {
    universities: Record<string, number>;
    scholarships: Record<string, number>;
}

function remapToTopojsonNames(counts: Record<string, number>): Record<string, number> {
    const remapped: Record<string, number> = {};
    for (const [country, count] of Object.entries(counts)) {
        remapped[DB_TO_TOPOJSON_NAME[country] || country] = count;
    }
    return remapped;
}

const COUNTRY_TO_REGION = new Map<string, string>();
REGIONS_DATA.forEach((region) => {
    region.countries.forEach((country) => {
        COUNTRY_TO_REGION.set(country.toLowerCase(), region.id);
    });
});

function getBlueColorByData(unis: number): string {
    if (unis === 0) return "#F3F4F6";
    if (unis <= 25) return "#BFDBFE";
    if (unis <= 45) return "#60A5FA";
    if (unis <= 65) return "#2563EB";
    if (unis <= 80) return "#1E40AF";
    return "#0F172A";
}

interface HoveredCountry {
    name: string;
    unis: number;
    scholarships: number;
}

interface WorldMapProps {
    selectedRegionId?: string | null;
}


const CountryGeographies = React.memo(function CountryGeographies({
    selectedRegionId,
    activeRegion,
    universityCounts,
    scholarshipCounts,
    onCountryEnter,
    onCountryLeave,
    onCountrySelect,
}: {
    selectedRegionId?: string | null;
    activeRegion?: RegionConfig;
    universityCounts: Record<string, number>;
    scholarshipCounts: Record<string, number>;
    onCountryEnter: (name: string, unis: number, scholarships: number) => void;
    onCountryLeave: () => void;
    onCountrySelect: (e: React.MouseEvent, name: string, unis: number, scholarships: number) => void;
}) {
    return (
        <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => {
                    const countryName = geo.properties.name as string;

                    const unis = universityCounts[countryName] || 0;
                    const scholarships = scholarshipCounts[countryName] || 0;
                    const hasData = unis > 0 || scholarships > 0;

                    const regionId = COUNTRY_TO_REGION.get(countryName?.toLowerCase());
                    const isInSelectedRegion = selectedRegionId && regionId === selectedRegionId;

                    let fillColor = getBlueColorByData(unis);

                    if (selectedRegionId) {
                        fillColor = isInSelectedRegion && activeRegion ? activeRegion.hexColor : "#E5E7EB";
                    }

                    return (
                        <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => {
                                if (hasData) onCountryEnter(countryName, unis, scholarships);
                            }}
                            onMouseLeave={onCountryLeave}
                            onClick={(e: React.MouseEvent) => {
                                if (!hasData) return;
                                onCountrySelect(e, countryName, unis, scholarships);
                            }}
                            style={{
                                default: {
                                    fill: fillColor,
                                    stroke: isInSelectedRegion ? "#1E293B" : "#D1D5DB",
                                    strokeWidth: isInSelectedRegion ? 1 : 0.5,
                                    outline: "none",
                                },
                                hover: {
                                    fill: selectedRegionId
                                        ? (isInSelectedRegion && activeRegion ? activeRegion.hexColor : "#D1D5DB")
                                        : (hasData ? "#1D4ED8" : "#D1D5DB"),
                                    stroke: "#0F172A",
                                    strokeWidth: 1,
                                    outline: "none",
                                    cursor: hasData ? "pointer" : "default",
                                },
                                pressed: {
                                    fill: fillColor,
                                    outline: "none",
                                },
                            }}
                        />
                    );
                })
            }
        </Geographies>
    );
});

export default function WorldMap({ selectedRegionId }: WorldMapProps) {
    const [hoveredCountry, setHoveredCountry] = useState<HoveredCountry | null>(null);
    const [stats, setStats] = useState<MapStats | null>(null);
    const [statsError, setStatsError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);
    // Пока true, карточка "закреплена" тапом/кликом и игнорирует onMouseLeave —
    // без этого мобильные браузеры шлют фантомный mouseleave сразу после клика,
    // и карточка гасла бы мгновенно.
    const isPinnedRef = useRef(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const rectRef = useRef<DOMRect | null>(null);
    const rafId = useRef<number | null>(null);
    const pendingPos = useRef<{ x: number; y: number } | null>(null);

    const activeRegion = useMemo(
        () => REGIONS_DATA.find((r) => r.id === selectedRegionId),
        [selectedRegionId]
    );

    useEffect(() => {
        let cancelled = false;
        setStatsError(false);

        fetch("/api/dashboard/map-stats")
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                return res.json();
            })
            .then((data: MapStats) => {
                if (cancelled) return;
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
    }, [retryKey]);

    const refreshRect = useCallback(() => {
        if (containerRef.current) {
            rectRef.current = containerRef.current.getBoundingClientRect();
        }
    }, []);

    useEffect(() => {
        refreshRect();
        window.addEventListener("resize", refreshRect);
        window.addEventListener("scroll", refreshRect, true);

        // Ловим изменения размеров контейнера (смена ориентации телефона,
        // адаптивные брейкпоинты, появление/исчезновение сайдбара и т.п.)
        let resizeObserver: ResizeObserver | null = null;
        if (containerRef.current && typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => refreshRect());
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener("resize", refreshRect);
            window.removeEventListener("scroll", refreshRect, true);
            if (rafId.current != null) cancelAnimationFrame(rafId.current);
            resizeObserver?.disconnect();
        };
    }, [refreshRect]);

    const flushPosition = useCallback(() => {
        rafId.current = null;
        const pos = pendingPos.current;
        const rect = rectRef.current;
        const tooltipEl = tooltipRef.current;
        if (pos && rect && tooltipEl) {
            // Реальные размеры подсказки — точнее хардкода, особенно на узких экранах
            const tw = tooltipEl.offsetWidth || 150;
            const th = tooltipEl.offsetHeight || 60;

            let localX = pos.x - rect.left + 15;
            let localY = pos.y - rect.top - 15;

            const maxX = rect.width - tw - 8;
            const maxY = rect.height - th - 8;

            if (localX > maxX) localX = pos.x - rect.left - tw - 15;
            if (localX < 8) localX = 8;
            if (localY < 8) localY = pos.y - rect.top + 15;
            if (localY > maxY) localY = maxY;

            tooltipEl.style.transform = `translate(${localX}px, ${localY}px)`;
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        pendingPos.current = { x: e.clientX, y: e.clientY };
        if (rafId.current == null) {
            rafId.current = requestAnimationFrame(flushPosition);
        }
    }, [flushPosition]);

    const handleCountryEnter = useCallback((name: string, unis: number, scholarships: number) => {
        if (isPinnedRef.current) return; // карточка закреплена кликом — hover её не трогает
        refreshRect(); // cheap safety net in case layout shifted since last cache
        setHoveredCountry({ name, unis, scholarships });
    }, [refreshRect]);

    const handleCountryLeave = useCallback(() => {
        if (isPinnedRef.current) return; // игнорируем hover-уход, пока карточка закреплена
        setHoveredCountry(null);
    }, []);

    // Тап по стране: показывает карточку и она остаётся на экране,
    // пока не тапнешь в другое место. stopPropagation — чтобы этот же тап
    // не долетел до контейнера и не закрыл карточку сразу же.
    const handleCountrySelect = useCallback((e: React.MouseEvent, name: string, unis: number, scholarships: number) => {
        e.stopPropagation();
        isPinnedRef.current = true;
        refreshRect();
        pendingPos.current = { x: e.clientX, y: e.clientY };
        if (rafId.current == null) {
            rafId.current = requestAnimationFrame(flushPosition);
        }
        setHoveredCountry({ name, unis, scholarships });
    }, [flushPosition, refreshRect]);

    // Тап по пустому месту (океан/фон) — закрывает карточку и снимает закрепление
    const handleContainerClick = useCallback(() => {
        isPinnedRef.current = false;
        setHoveredCountry(null);
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onClick={handleContainerClick}
            className="relative w-full aspect-[8/5] max-h-[520px] min-h-[220px] overflow-hidden rounded-xl bg-surface sm:rounded-2xl touch-pan-y"
        >
            <ComposableMap
                projectionConfig={PROJECTION_CONFIG}
                width={800}
                height={500}
                className="w-full h-full"
            >
                <CountryGeographies
                    selectedRegionId={selectedRegionId}
                    activeRegion={activeRegion}
                    universityCounts={stats?.universities ?? {}}
                    scholarshipCounts={stats?.scholarships ?? {}}
                    onCountryEnter={handleCountryEnter}
                    onCountryLeave={handleCountryLeave}
                    onCountrySelect={handleCountrySelect}
                />
            </ComposableMap>

            {statsError && (
                <div className="absolute top-2 left-2 right-2 z-40 flex items-center justify-between gap-3 rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-600 shadow sm:text-sm">
                    <span>Couldn&apos;t load live university/scholarship counts.</span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setRetryKey((k) => k + 1);
                        }}
                        className="shrink-0 font-semibold text-brand hover:underline cursor-pointer"
                    >
                        Retry
                    </button>
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
                    className="max-w-[150px] rounded-xl border border-slate-100 bg-white p-2 text-[11px] shadow-lg sm:max-w-none sm:p-3 sm:text-xs"
                >
                    <div className="font-bold text-slate-900 mb-1">
                        {hoveredCountry.name}
                    </div>
                    <div className="text-slate-600 space-y-0.5">
                        <div>Universities: <span className="font-semibold text-slate-800">{hoveredCountry.unis}</span></div>
                        <div>Scholarships: <span className="font-semibold text-slate-800">{hoveredCountry.scholarships}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
}
