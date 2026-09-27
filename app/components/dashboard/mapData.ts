// Region/country lookup tables shared by the map and the controls around it.
// Kept apart from WorldMap.tsx so importing them doesn't pull MapLibre (which
// WorldMap lazy-loads) into the main dashboard bundle.

// The DB stores plain country names that mostly match world-atlas's
// `properties.name`, except for these two — checked directly against the
// topojson file rather than guessed.
export const DB_TO_TOPOJSON_NAME: Record<string, string> = {
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

export interface MapStats {
    universities: Record<string, number>;
    scholarships: Record<string, number>;
}

export function remapToTopojsonNames(counts: Record<string, number>): Record<string, number> {
    const remapped: Record<string, number> = {};
    for (const [country, count] of Object.entries(counts)) {
        remapped[DB_TO_TOPOJSON_NAME[country] || country] = count;
    }
    return remapped;
}

export const COUNTRY_TO_REGION = new Map<string, string>();
REGIONS_DATA.forEach((region) => {
    region.countries.forEach((country) => {
        COUNTRY_TO_REGION.set(country.toLowerCase(), region.id);
    });
});

export const CHOROPLETH_STEPS: { max: number | null; color: string; label: string }[] = [
    { max: 0, color: "#E7EDF6", label: "No data" },
    { max: 25, color: "#BFDBFE", label: "1–25" },
    { max: 45, color: "#60A5FA", label: "26–45" },
    { max: 65, color: "#3B82F6", label: "46–65" },
    { max: 80, color: "#1D4ED8", label: "66–80" },
    { max: null, color: "#1E3A8A", label: "80+" },
];

// Reverse of DB_TO_TOPOJSON_NAME — the map speaks world-atlas names, the
// universities API filters on the names stored in the DB.
export function toDbCountryName(topojsonName: string): string {
    for (const [dbName, mapName] of Object.entries(DB_TO_TOPOJSON_NAME)) {
        if (mapName === topojsonName) return dbName;
    }
    return topojsonName;
}
