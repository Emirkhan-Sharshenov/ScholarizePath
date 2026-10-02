"use client";

import React from "react";
import { REGIONS_DATA } from "./mapData";
import { useI18n } from "@/i18n/I18nProvider";

interface WorldMapFilterProps {
    selectedRegionId: string | null;
    onSelectRegion: (regionId: string | null) => void;
    onHoverRegion?: (regionId: string | null) => void;
}

// Region chips above the map: "All" plus one per region. Scrolls sideways on
// phones instead of wrapping onto several lines.
export default function WorldMapFilter({
    selectedRegionId,
    onSelectRegion,
    onHoverRegion,
}: WorldMapFilterProps) {
    const { t } = useI18n();
    const chipBase =
        "flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition-colors";

    return (
        <div
            role="group"
            aria-label={t.dashboard.filterByRegion}
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            <button
                type="button"
                onClick={() => onSelectRegion(null)}
                aria-pressed={selectedRegionId === null}
                className={`${chipBase} ${selectedRegionId === null
                    ? "border-ink bg-ink text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-ink"
                    }`}
            >
                {t.dashboard.all}
            </button>

            {REGIONS_DATA.map((region) => {
                const isSelected = selectedRegionId === region.id;

                return (
                    <button
                        key={region.id}
                        type="button"
                        onClick={() => onSelectRegion(isSelected ? null : region.id)}
                        onMouseEnter={() => onHoverRegion?.(region.id)}
                        onMouseLeave={() => onHoverRegion?.(null)}
                        onFocus={() => onHoverRegion?.(region.id)}
                        onBlur={() => onHoverRegion?.(null)}
                        aria-pressed={isSelected}
                        className={`${chipBase} ${isSelected
                            ? "border-brand bg-brand text-white shadow-[0_4px_12px_rgba(0,88,189,0.25)]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-ink"
                            }`}
                    >
                        <span
                            aria-hidden="true"
                            className={`h-2 w-2 shrink-0 rounded-full ${isSelected ? "bg-white" : region.color}`}
                        />
                        {t.dashboard.regions[region.id] ?? region.label}
                    </button>
                );
            })}
        </div>
    );
}
