"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

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

// Universities mapping (54 assigned to United Arab Emirates)
const UNIVERSITIES_COUNT: Record<string, number> = {
    "United Kingdom": 86,
    "UK": 86,
    "Canada": 76,
    "South Korea": 73,
    "Korea, Republic of": 73,
    "Italy": 77,
    "Germany": 79,
    "Japan": 78,
    "Singapore": 22,
    "Netherlands": 52,
    "Turkey": 85,
    "Turkiye": 85,
    "Malaysia": 70,
    "United Arab Emirates": 54, // Match key for world-atlas
    "UAE": 54,
    "OAE": 54,
    "Switzerland": 50,
    "Finland": 37,
    "Sweden": 39,
    "Australia": 42,
    "United States of America": 74,
    "United States": 74,
    "USA": 74,
    "China": 87,
};

// Scholarships mapping
const SCHOLARSHIPS_COUNT: Record<string, number> = {
    "United States of America": 19,
    "United States": 19,
    "USA": 19,
    "United Kingdom": 17,
    "UK": 17,
    "China": 5,
    "South Korea": 5,
    "Korea, Republic of": 5,
    "Germany": 8,
};

const COUNTRY_TO_REGION = new Map<string, string>();
REGIONS_DATA.forEach((region) => {
    region.countries.forEach((country) => {
        COUNTRY_TO_REGION.set(country.toLowerCase(), region.id);
    });
});

function getBlueColorByData(unis: number): string {
    if (unis === 0) return "#F3F4F6";       // No data (light gray)
    if (unis <= 25) return "#BFDBFE";      // Light blue
    if (unis <= 45) return "#60A5FA";      // Mid-light blue
    if (unis <= 65) return "#2563EB";      // Medium blue
    if (unis <= 80) return "#1E40AF";      // Dark blue
    return "#0F172A";                      // Deepest dark blue
}

interface HoveredCountry {
    name: string;
    unis: number;
    scholarships: number;
    x: number;
    y: number;
}

interface WorldMapProps {
    selectedRegionId?: string | null;
}

export default function WorldMap({ selectedRegionId }: WorldMapProps) {
    const [hoveredCountry, setHoveredCountry] = useState<HoveredCountry | null>(null);

    const activeRegion = useMemo(
        () => REGIONS_DATA.find((r) => r.id === selectedRegionId),
        [selectedRegionId]
    );

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGPathElement>, name: string, unis: number, scholarships: number) => {
        const x = e.clientX;
        const y = e.clientY;

        requestAnimationFrame(() => {
            setHoveredCountry({ name, unis, scholarships, x, y });
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredCountry(null);
    }, []);

    return (
        <div className="w-full h-full relative bg-[rgb(246,247,251)]">
            <ComposableMap
                projectionConfig={{ scale: 145 }}
                width={800}
                height={500}
                className="w-full h-full"
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }: { geographies: any[] }) =>
                        geographies.map((geo: any) => {
                            const countryName = geo.properties.name as string;

                            const unis = UNIVERSITIES_COUNT[countryName] || 0;
                            const scholarships = SCHOLARSHIPS_COUNT[countryName] || 0;
                            const hasData = unis > 0 || scholarships > 0;

                            const regionId = COUNTRY_TO_REGION.get(countryName?.toLowerCase());
                            const isInSelectedRegion = selectedRegionId && regionId === selectedRegionId;

                            let fillColor = getBlueColorByData(unis);

                            if (selectedRegionId) {
                                if (isInSelectedRegion && activeRegion) {
                                    fillColor = activeRegion.hexColor;
                                } else {
                                    fillColor = "#E5E7EB";
                                }
                            }

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onMouseMove={(e) => {
                                        if (hasData) {
                                            handleMouseMove(e, countryName, unis, scholarships);
                                        }
                                    }}
                                    onMouseLeave={handleMouseLeave}
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
            </ComposableMap>

            {hoveredCountry && (
                <div
                    style={{
                        position: "fixed",
                        zIndex: 9999,
                        left: hoveredCountry.x + 15,
                        top: hoveredCountry.y - 15,
                        pointerEvents: "none",
                        willChange: "transform",
                    }}
                    className="rounded-xl bg-white p-3 shadow-lg border border-slate-100 text-xs"
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