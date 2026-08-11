"use client";

import React from "react";
import { REGIONS_DATA } from "./WorldMap";

interface WorldMapFilterProps {
    selectedRegionId: string | null;
    onSelectRegion: (regionId: string | null) => void;
}

export default function WorldMapFilter({
    selectedRegionId,
    onSelectRegion,
}: WorldMapFilterProps) {
    const handleToggle = (id: string) => {
        // Повторный клик снимает выделение с региона
        if (selectedRegionId === id) {
            onSelectRegion(null);
        } else {
            onSelectRegion(id);
        }
    };

    return (
        <div className="w-full h-full rounded-3xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-center">
            <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Region filter
            </div>

            <div className="space-y-2">
                {REGIONS_DATA.map((region) => {
                    const isSelected = selectedRegionId === region.id;

                    return (
                        <button
                            key={region.id}
                            type="button"
                            onClick={() => handleToggle(region.id)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${isSelected
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                        >
                            <span
                                className={`h-3 w-3 shrink-0 rounded-full ${region.color} ${isSelected ? "ring-2 ring-white" : ""
                                    }`}
                            />
                            <span className="truncate">{region.label}</span>
                        </button>
                    );
                })}
            </div>

            {selectedRegionId && (
                <button
                    type="button"
                    onClick={() => onSelectRegion(null)}
                    className="mt-4 w-full rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                >
                    Reset
                </button>
            )}
        </div>
    );
}