'use client';

import React, { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { Globe2 } from 'lucide-react';
import WorldMapFilter from './WorldMapFilter';
import { CountryPanel, CountrySheet, useCountryUniversities } from './CountryPanel';
import type { MapCountry } from './WorldMap';
import { useI18n } from '@/i18n/I18nProvider';

// MapLibre (WebGL) is only needed on this one dashboard panel — lazy
// load the chunk instead of shipping it in the main dashboard bundle, and
// skip SSR since the map only does anything once the browser can fetch
// /api/dashboard/map-stats and measure its own container.
const WorldMap = dynamic(() => import('./WorldMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-surface" />,
});

function MapFilter() {
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<MapCountry | null>(null);
    const [totalUniversities, setTotalUniversities] = useState<number | null>(null);
    const { t } = useI18n();

    const universities = useCountryUniversities(selectedCountry?.name ?? null);
    const closeCountry = useCallback(() => setSelectedCountry(null), []);

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-5">
            <div className="flex min-w-0 flex-col rounded-3xl border border-slate-200/80 bg-white p-3 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-4">
                <WorldMapFilter
                    selectedRegionId={selectedRegionId}
                    onSelectRegion={setSelectedRegionId}
                    onHoverRegion={setHoveredRegionId}
                />

                <p className="mt-3 flex items-center gap-2 px-1 text-sm text-slate-500">
                    <Globe2 aria-hidden="true" className="h-4 w-4 text-brand" />
                    {totalUniversities !== null
                        ? t.dashboard.mapped(totalUniversities)
                        : t.dashboard.loadingUniversities}
                </p>

                <div className="mt-3 h-[300px] sm:h-[380px] lg:h-[min(62vh,560px)]">
                    <WorldMap
                        selectedRegionId={selectedRegionId}
                        hoveredRegionId={hoveredRegionId}
                        selectedCountryName={selectedCountry?.name ?? null}
                        onSelectCountry={setSelectedCountry}
                        onTotalChange={setTotalUniversities}
                    />
                </div>
            </div>

            <CountryPanel country={selectedCountry} universities={universities} onClose={closeCountry} />
            <CountrySheet country={selectedCountry} universities={universities} onClose={closeCountry} />
        </div>
    );
}

export default MapFilter;
