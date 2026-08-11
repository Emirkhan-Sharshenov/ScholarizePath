'use client';

import React, { useState } from 'react';
import WorldMap from './WorldMap';
import WorldMapFilter from './WorldMapFilter';

function MapFilter() {
    // Состояние хранит ID выбранного региона (или null, если ничего не выбрано)
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

    return (
        <div className="mt-6 flex gap-6 h-[70vh]">
            <div className="flex-[8.5] h-full rounded-3xl overflow-hidden">
                {/* Передаем ID выбранного региона в карту для подсветки */}
                <WorldMap selectedRegionId={selectedRegionId} />
            </div>

            <div className="flex-[1.5]">
                {/* Передаем текущий выбранный регион и функцию управления в фильтр */}
                <WorldMapFilter
                    selectedRegionId={selectedRegionId}
                    onSelectRegion={setSelectedRegionId}
                />
            </div>
        </div>
    );
}

export default MapFilter;