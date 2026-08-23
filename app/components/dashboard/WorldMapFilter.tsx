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
        onSelectRegion(selectedRegionId === id ? null : id);
    };

    return (
        <div className="w-full h-full rounded-3xl border border-slate-100 bg-white p-4 md:p-5 shadow-sm flex flex-col justify-center">
            <div className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Region Filter
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-2 md:space-y-2 md:gap-0">
                {REGIONS_DATA.map((region) => {
                    const isSelected = selectedRegionId === region.id;

                    return (
                        <button
                            key={region.id}
                            type="button"
                            onClick={() => handleToggle(region.id)}
                            className={`flex w-full items-center gap-2 md:gap-3 rounded-xl px-3 py-2.5 text-left text-xs md:text-sm font-medium transition-all duration-200 ${isSelected
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <span
                                className={`h-2.5 w-2.5 md:h-3 md:w-3 shrink-0 rounded-full ${region.color} ${isSelected ? "ring-2 ring-white" : ""
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
                    className="mt-3 md:mt-4 w-full rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                >
                    Reset Selection
                </button>
            )}
        </div>
    );
}