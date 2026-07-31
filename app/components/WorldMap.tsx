"use client";

import {
    ComposableMap,
    Geographies,
    Geography,
} from "react-simple-maps";
import { useState } from "react";

const geoUrl =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";


interface HoveredCountry {
    name: string;
    x: number;
    y: number;
}

interface GeoProperties {
    name: string;
    [key: string]: unknown;
}

const CONTINENT_COLORS: Record<string, string> = {
    "North America": "#1E3A8A", // dark blue
    Europe: "#7C3AED", // purple
    Asia: "#7DD3FC", // light blue
    Oceania: "#22C55E", // green
    "South America": "#EAB308", // yellow
    Africa: "#EC4899", // pink
};

const CONTINENT_HOVER_COLORS: Record<string, string> = {
    "North America": "#3B5BDB",
    Europe: "#9F67F5",
    Asia: "#A5E4FC",
    Oceania: "#4ADE80",
    "South America": "#FDE047",
    Africa: "#F472B6",
};

// Maps country names as they appear in the world-atlas countries-110m.json
// "name" property to their continent.
const COUNTRY_CONTINENTS: Record<string, string> = {
    // North America
    "United States of America": "North America",
    Canada: "North America",
    Mexico: "North America",
    Guatemala: "North America",
    Belize: "North America",
    Honduras: "North America",
    "El Salvador": "North America",
    Nicaragua: "North America",
    "Costa Rica": "North America",
    Panama: "North America",
    Cuba: "North America",
    "The Bahamas": "North America",
    Bahamas: "North America",
    Jamaica: "North America",
    Haiti: "North America",
    "Dominican Republic": "North America",
    "Trinidad and Tobago": "North America",
    Greenland: "North America",

    // Europe
    Portugal: "Europe",
    Spain: "Europe",
    France: "Europe",
    "United Kingdom": "Europe",
    Ireland: "Europe",
    Iceland: "Europe",
    Norway: "Europe",
    Sweden: "Europe",
    Finland: "Europe",
    Denmark: "Europe",
    Germany: "Europe",
    Netherlands: "Europe",
    Belgium: "Europe",
    Luxembourg: "Europe",
    Switzerland: "Europe",
    Austria: "Europe",
    Italy: "Europe",
    Poland: "Europe",
    "Czech Republic": "Europe",
    Czechia: "Europe",
    Slovakia: "Europe",
    Hungary: "Europe",
    Romania: "Europe",
    Bulgaria: "Europe",
    Greece: "Europe",
    Albania: "Europe",
    "North Macedonia": "Europe",
    Macedonia: "Europe",
    Serbia: "Europe",
    Croatia: "Europe",
    Slovenia: "Europe",
    "Bosnia and Herzegovina": "Europe",
    Montenegro: "Europe",
    Kosovo: "Europe",
    Ukraine: "Europe",
    Moldova: "Europe",
    Lithuania: "Europe",
    Latvia: "Europe",
    Estonia: "Europe",
    Belarus: "Europe",
    Russia: "Europe",
    Malta: "Europe",
    Cyprus: "Europe",

    // Asia
    Turkey: "Asia",
    Georgia: "Asia",
    Armenia: "Asia",
    Azerbaijan: "Asia",
    Kazakhstan: "Asia",
    Uzbekistan: "Asia",
    Turkmenistan: "Asia",
    Tajikistan: "Asia",
    Kyrgyzstan: "Asia",
    Afghanistan: "Asia",
    Pakistan: "Asia",
    India: "Asia",
    Nepal: "Asia",
    Bhutan: "Asia",
    Bangladesh: "Asia",
    "Sri Lanka": "Asia",
    Myanmar: "Asia",
    Thailand: "Asia",
    Laos: "Asia",
    Vietnam: "Asia",
    Cambodia: "Asia",
    Malaysia: "Asia",
    Singapore: "Asia",
    Indonesia: "Asia",
    Philippines: "Asia",
    Brunei: "Asia",
    China: "Asia",
    Mongolia: "Asia",
    "North Korea": "Asia",
    "South Korea": "Asia",
    Japan: "Asia",
    Taiwan: "Asia",
    Iran: "Asia",
    Iraq: "Asia",
    Syria: "Asia",
    Lebanon: "Asia",
    Israel: "Asia",
    Palestine: "Asia",
    Jordan: "Asia",
    "Saudi Arabia": "Asia",
    Yemen: "Asia",
    Oman: "Asia",
    "United Arab Emirates": "Asia",
    Qatar: "Asia",
    Kuwait: "Asia",
    Bahrain: "Asia",
    "Timor-Leste": "Asia",

    // Oceania
    Australia: "Oceania",
    "New Zealand": "Oceania",
    "Papua New Guinea": "Oceania",
    Fiji: "Oceania",
    "Solomon Islands": "Oceania",
    Vanuatu: "Oceania",
    "New Caledonia": "Oceania",

    // South America
    Colombia: "South America",
    Venezuela: "South America",
    Guyana: "South America",
    Suriname: "South America",
    Ecuador: "South America",
    Peru: "South America",
    Brazil: "South America",
    Bolivia: "South America",
    Paraguay: "South America",
    Chile: "South America",
    Argentina: "South America",
    Uruguay: "South America",

    // Africa
    Morocco: "Africa",
    Algeria: "Africa",
    Tunisia: "Africa",
    Libya: "Africa",
    Egypt: "Africa",
    Sudan: "Africa",
    "South Sudan": "Africa",
    Chad: "Africa",
    Niger: "Africa",
    Mali: "Africa",
    Mauritania: "Africa",
    Senegal: "Africa",
    Gambia: "Africa",
    "Guinea-Bissau": "Africa",
    Guinea: "Africa",
    "Sierra Leone": "Africa",
    Liberia: "Africa",
    "Ivory Coast": "Africa",
    "Cote d'Ivoire": "Africa",
    Ghana: "Africa",
    Togo: "Africa",
    Benin: "Africa",
    Nigeria: "Africa",
    Cameroon: "Africa",
    "Central African Republic": "Africa",
    "Republic of the Congo": "Africa",
    "Democratic Republic of the Congo": "Africa",
    Gabon: "Africa",
    "Equatorial Guinea": "Africa",
    "Western Sahara": "Africa",
    Eritrea: "Africa",
    Djibouti: "Africa",
    Ethiopia: "Africa",
    Somalia: "Africa",
    Kenya: "Africa",
    Uganda: "Africa",
    Rwanda: "Africa",
    Burundi: "Africa",
    Tanzania: "Africa",
    Zambia: "Africa",
    Malawi: "Africa",
    Mozambique: "Africa",
    Zimbabwe: "Africa",
    Botswana: "Africa",
    Namibia: "Africa",
    "South Africa": "Africa",
    Lesotho: "Africa",
    Eswatini: "Africa",
    Swaziland: "Africa",
    Angola: "Africa",
    Madagascar: "Africa",
    "Burkina Faso": "Africa",
};

function getCountryColor(name: string): string {
    const continent = COUNTRY_CONTINENTS[name];
    return continent ? CONTINENT_COLORS[continent] : "#D6D6DA";
}

function getHoverColor(name: string): string {
    const continent = COUNTRY_CONTINENTS[name];
    return continent ? CONTINENT_HOVER_COLORS[continent] : "#93C5FD";
}

export default function WorldMap() {
    const [hoveredCountry, setHoveredCountry] =
        useState<HoveredCountry | null>(null);

    return (
        <div className="w-full h-full">
            <ComposableMap
                projectionConfig={{ scale: 160 }}
                width={800}
                height={600}
                style={{ width: "100%", height: "100%" }}
                preserveAspectRatio="none"
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const properties = geo.properties as GeoProperties;
                            const fillColor = getCountryColor(properties.name);
                            const hoverColor = getHoverColor(properties.name);
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onMouseMove={(e) => {
                                        setHoveredCountry({
                                            name: properties.name,
                                            x: e.clientX,
                                            y: e.clientY,
                                        });
                                    }}
                                    onMouseLeave={() => setHoveredCountry(null)}
                                    style={{
                                        default: {
                                            fill: fillColor,
                                            outline: "none",
                                            cursor: "pointer",
                                        },
                                        hover: {
                                            fill: hoverColor,
                                            outline: "none",
                                            cursor: "pointer",
                                        },
                                        pressed: {
                                            fill: hoverColor,
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
                        left: hoveredCountry.x + 20,
                        top: hoveredCountry.y - 20,
                        width: 288,
                        borderRadius: 16,
                        backgroundColor: "blue",
                        padding: 20,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                        pointerEvents: "none",
                    }}
                >
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                        {hoveredCountry.name}
                    </h2>
                    <p style={{ color: "#6b7280" }}>Top universities</p>
                    <button
                        style={{
                            marginTop: 16,
                            width: "100%",
                            borderRadius: 12,
                            backgroundColor: "#2563eb",
                            color: "white",
                            padding: "8px 0",
                            border: "none",
                        }}
                    >
                        Explore
                    </button>
                </div>
            )}
        </div>
    );
}