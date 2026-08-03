'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterUniversitiesProps {
    onApply?: (filters: FilterState) => void;
    onReset?: () => void;
}

interface FilterState {
    search: string;
    location: string;
    minRanking: string;
    maxRanking: string;
    minTuition: string;
    maxTuition: string;
    programs: string;
    degreeLevel: string;
}

const initialFilters: FilterState = {
    search: '',
    location: 'All Locations',
    minRanking: '',
    maxRanking: '',
    minTuition: '',
    maxTuition: '',
    programs: 'All Programs',
    degreeLevel: 'All Degree Levels',
};

export default function FilterUniversities({ onApply, onReset }: FilterUniversitiesProps) {
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        if (onApply) onApply(filters);
    };

    const handleReset = () => {
        setFilters(initialFilters);
        if (onReset) onReset();
    };

    return (
        <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-sm border border-gray-100 font-sans">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Filter Universities</h2>

            <div className="space-y-4">
                {/* Search */}
                <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Search
                    </label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Search universities by name"
                        className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Location
                    </label>
                    <div className="relative">
                        <select
                            name="location"
                            value={filters.location}
                            onChange={handleChange}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2 px-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                        >
                            <option value="All Locations">All Locations</option>
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    </div>
                </div>

                {/* Ranking */}
                <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Ranking
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="minRanking"
                            value={filters.minRanking}
                            onChange={handleChange}
                            placeholder="Min"
                            className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                        <span className="text-slate-400 font-medium text-xs">-</span>
                        <input
                            type="number"
                            name="maxRanking"
                            value={filters.maxRanking}
                            onChange={handleChange}
                            placeholder="Max"
                            className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                    </div>
                </div>

                {/* Tuition Fee (USD) */}
                <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Tuition Fee (USD)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="minTuition"
                            value={filters.minTuition}
                            onChange={handleChange}
                            placeholder="Min"
                            className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                        <span className="text-slate-400 font-medium text-xs">-</span>
                        <input
                            type="number"
                            name="maxTuition"
                            value={filters.maxTuition}
                            onChange={handleChange}
                            placeholder="Max"
                            className="w-full rounded-xl border border-gray-200 py-2 px-3 text-xs text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                    </div>
                </div>

                {/* Programs */}
                <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Programs
                    </label>
                    <div className="relative">
                        <select
                            name="programs"
                            value={filters.programs}
                            onChange={handleChange}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2 px-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                        >
                            <option value="All Programs">All Programs</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Business & Management">Business & Management</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Medicine">Medicine</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    </div>
                </div>

                {/* Degree Level */}
                <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Degree Level
                    </label>
                    <div className="relative">
                        <select
                            name="degreeLevel"
                            value={filters.degreeLevel}
                            onChange={handleChange}
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2 px-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
                        >
                            <option value="All Degree Levels">All Degree Levels</option>
                            <option value="Undergraduate">Undergraduate</option>
                            <option value="Postgraduate">Postgraduate</option>
                            <option value="Doctorate">Doctorate</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    </div>
                </div>

                {/* Action Buttons (Side by Side) */}
                <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                        onClick={handleApply}
                        className="flex-1 rounded-xl bg-blue-600 py-2.5 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition active:scale-[0.98]"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={handleReset}
                        className="rounded-xl py-2.5 px-4 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}