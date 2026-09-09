'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import WorldMapFilter from './WorldMapFilter';

// react-simple-maps + d3 are only needed on this one dashboard panel — lazy
// load the chunk instead of shipping it in the main dashboard bundle, and
// skip SSR since the map only does anything once the browser can fetch
// /api/dashboard/map-stats and measure its own container.
const WorldMap = dynamic(() => import('./WorldMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full min-h-[220px] rounded-xl bg-surface animate-pulse sm:rounded-2xl" />
    ),
});

function MapFilter() {
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

    return (
        <div className="flex flex-col gap-4 md:flex-row md:gap-6 md:h-[70vh]">
            <div className="w-full h-[280px] sm:h-[350px] md:h-full md:flex-[8.5] rounded-2xl md:rounded-3xl overflow-hidden">
                <WorldMap selectedRegionId={selectedRegionId} />
            </div>

            <div className="w-full md:flex-[1.5]">
                <WorldMapFilter
                    selectedRegionId={selectedRegionId}
                    onSelectRegion={setSelectedRegionId}
                />
            </div>
        </div>
    );
}

export default MapFilter;