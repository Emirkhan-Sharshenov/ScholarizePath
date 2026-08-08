"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
} from "react-simple-maps";

const geoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

interface HoveredCountry {
    name: string;
    unis: number;
    scholarships: number;
    x: number;
    y: number;
}

interface GeoProperties {
    name: string;
    [key: string]: unknown;
}

// Количество университетов по странам
const UNIVERSITIES_COUNT: Record<string, number> = {
    Argentina: 1, Armenia: 1, Australia: 3, Austria: 1, Azerbaijan: 1, Bahrain: 1,
    Bangladesh: 1, Belgium: 1, Brazil: 1, Brunei: 1, Bulgaria: 1, Cambodia: 1,
    Canada: 4, Chile: 1, China: 5, Colombia: 1, "Costa Rica": 1, Croatia: 1,
    Cyprus: 1, "Czech Republic": 1, Czechia: 1, Denmark: 1, Ecuador: 1, Egypt: 1,
    Estonia: 1, Ethiopia: 1, Fiji: 1, Finland: 1, France: 3, Georgia: 1,
    Germany: 5, Ghana: 1, Greece: 1, "Hong Kong": 2, Hungary: 1, Iceland: 1,
    India: 4, Indonesia: 1, Iran: 1, Ireland: 1, Israel: 1, Italy: 2, Japan: 3,
    Jordan: 1, Kazakhstan: 2, Kenya: 1, Kuwait: 1, Kyrgyzstan: 2, Laos: 1,
    Latvia: 1, Lebanon: 1, Lithuania: 1, Malaysia: 1, Malta: 1, Mexico: 2,
    Mongolia: 1, Morocco: 1, Nepal: 1, Netherlands: 2, "New Zealand": 2,
    Nigeria: 1, Norway: 1, Oman: 1, Pakistan: 1, Palestine: 1, Peru: 1,
    Philippines: 1, Poland: 1, Portugal: 1, Qatar: 1, Romania: 1, Russia: 1,
    "Saudi Arabia": 1, Senegal: 1, Serbia: 1, Singapore: 1, Slovakia: 1,
    Slovenia: 1, "South Africa": 2, "South Korea": 3, Spain: 2, "Sri Lanka": 1,
    Sweden: 2, Switzerland: 3, Taiwan: 1, Tanzania: 1, Thailand: 1, Tunisia: 1,
    Turkey: 2, Uganda: 1, "United Arab Emirates": 1, "United Kingdom": 5,
    "United States of America": 2, "United States": 2, Uruguay: 1, Uzbekistan: 1,
    Vietnam: 1,
};

// Количество стипендий по странам
const SCHOLARSHIPS_COUNT: Record<string, number> = {
    Australia: 1,
    Canada: 1,
    China: 1,
    France: 1,
    Germany: 1,
    Hungary: 1,
    Japan: 1,
    "South Korea": 1,
    Switzerland: 1,
    Turkey: 1,
    "United Kingdom": 3,
    "United States of America": 2,
    "United States": 2,
};

// Расчет цвета на основе общего количества (чем больше сумма, тем темнее синий)
function getCountryColor(unis: number, scholarships: number): string {
    const total = unis + scholarships;

    if (total === 0) return "#FFFFFF"; // Белый, если нет данных
    if (total <= 1) return "#93C5FD";  // Светло-синий
    if (total <= 3) return "#3B82F6";  // Умеренно-синий
    if (total <= 5) return "#1D4ED8";  // Насыщенный синий
    return "#1E3A8A";                  // Тёмно-синий (для высших показателей)
}

export default function WorldMap() {
    const [hoveredCountry, setHoveredCountry] =
        useState<HoveredCountry | null>(null);

    return (
        <div className="w-full h-full relative">
            <ComposableMap
                projectionConfig={{ scale: 160 }}
                width={800}
                height={600}
                style={{ width: "100%", height: "100%" }}
                preserveAspectRatio="none"
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }: { geographies: any[] }) =>
                        geographies.map((geo: any) => {
                            const properties = geo.properties as GeoProperties;
                            const name = properties.name;

                            const unis = UNIVERSITIES_COUNT[name] || 0;
                            const scholarships = SCHOLARSHIPS_COUNT[name] || 0;
                            const hasData = unis > 0 || scholarships > 0;

                            const fillColor = getCountryColor(unis, scholarships);

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onMouseMove={(e: MouseEvent<HTMLDivElement>) => {
                                        if (hasData) {
                                            setHoveredCountry({
                                                name,
                                                unis,
                                                scholarships,
                                                x: e.clientX,
                                                y: e.clientY,
                                            });
                                        }
                                    }}
                                    onMouseLeave={() => setHoveredCountry(null)}
                                    style={{
                                        default: {
                                            fill: fillColor,
                                            stroke: "#D1D5DB",
                                            strokeWidth: 0.5,
                                            outline: "none",
                                            cursor: hasData ? "pointer" : "default",
                                        },
                                        hover: {
                                            fill: hasData ? "#60A5FA" : "#FFFFFF",
                                            stroke: "#9CA3AF",
                                            strokeWidth: 0.5,
                                            outline: "none",
                                            cursor: hasData ? "pointer" : "default",
                                        },
                                        pressed: {
                                            fill: fillColor,
                                            stroke: "#D1D5DB",
                                            strokeWidth: 0.5,
                                            outline: "none",
                                        },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>

            {hoveredCountry && (
                <div
                    style={{
                        position: "fixed",
                        zIndex: 9999,
                        left: hoveredCountry.x + 15,
                        top: hoveredCountry.y - 15,
                        borderRadius: 12,
                        backgroundColor: "white",
                        padding: "12px 16px",
                        pointerEvents: "none",
                        border: "1px solid #E5E7EB",
                    }}
                >
                    <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#111827" }}>
                        {hoveredCountry.name}
                    </h2>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#4B5563" }}>
                        <div>🏛️ Университеты: <strong>{hoveredCountry.unis}</strong></div>
                        <div>🎓 Стипендии: <strong>{hoveredCountry.scholarships}</strong></div>
                    </div>
                </div>
            )}
        </div>
    );
}