'use client';

import React, { useState } from 'react';
import WorldMap from './WorldMap';
import WorldMapFilter from './WorldMapFilter';

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