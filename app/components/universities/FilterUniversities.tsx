'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterState {
    search: string;
    country: string;
    minRanking: string;
    maxRanking: string;
    minTuition: string;
    maxTuition: string;
    programs: string;
    degreeLevel: string;
}

export const initialFilters: FilterState = {
    search: '',
    country: 'All Countries',
    minRanking: '',
    maxRanking: '',
    minTuition: '',
    maxTuition: '',
    programs: 'All Programs',
    degreeLevel: 'All Degree Levels',
};

const COUNTRIES = [
    "United Kingdom",
    "Canada",
    "South Korea",
    "Italy",
    "Germany",
    "Japan",
    "Singapore",
    "Netherlands",
    "Turkey",
    "Malaysia",
    "United Arab Emirates",
    "Switzerland",
    "Finland",
    "Sweden",
    "Australia",
    "United States of America",
    "China",
    "Russia",
    "France",
    "Spain",
    "Brazil",
    "India",
    "Nigeria"
];

const PROGRAMS = [
    'Actuarial Science', 'Aerospace Engineering', 'African Studies', 'Agricultural Engineering',
    'Agricultural Sciences', 'Agriculture', 'Agronomy', 'Applied Mathematics', 'Applied Studies',
    'Architecture', 'Arts', 'Baltic Studies', 'Biochemistry', 'Biology', 'Biomedicine',
    'Bioscience', 'Bioscience Engineering', 'Biotechnology', 'Business', 'Business (Antai)',
    'Business (HEC)', 'Business Administration', 'Business Analytics', 'Business Economics',
    'Business Informatics', 'Business and Technology Management', 'Byzantine Studies',
    'Chemical Engineering', 'Chemistry', 'Chinese Literature', 'Civil Engineering', 'Classics',
    'Commerce', 'Communication', 'Communication Arts', 'Communication Science', 'Computer Engineering',
    'Computer Science', 'Computer Science and Engineering', 'Computing', 'Computing and Software Systems',
    'Data Engineering and Analytics', 'Data Science', 'Dentistry', 'Design', 'Development Studies',
    'Economics', 'Economics and Business', 'Electrical Engineering', 'Electronic Engineering',
    'Engineering', 'Engineering Science', 'English Literature', 'English Studies', 'Environmental Science',
    'Environmental Science and Engineering', 'Environmental Studies', 'Film and Media', 'Finance',
    'Fine Arts', 'Foreign Languages', 'Forestry', 'Gastronomy', 'Geology', 'Geosciences', 'History',
    'Humanities', 'Industrial Design', 'Industrial Engineering', 'Informatics', 'Information Science',
    'Information Technology', 'International Affairs', 'International Business', 'International Development',
    'International Liberal Studies', 'International Relations', 'International Studies', 'International Trade',
    'International and Comparative Politics', 'Islamic Studies', 'Journalism', 'Law', 'Life Sciences',
    'Literature', 'Machine Learning', 'Management', 'Management and Finance', 'Marine Biology',
    'Marine Science', 'Mass Communication', 'Materials Science', 'Mathematics', 'Mathematics and Computing',
    'Mechanical Engineering', 'Mechatronics Engineering', 'Media Studies', 'Medicine', 'Middle East Studies',
    'Mining Engineering', 'Mongolian Studies', 'Natural Sciences', 'Naval Architecture', 'Nordic Studies',
    'Ocean Engineering', 'Oriental Studies', 'Pacific Studies', 'Petroleum Engineering', 'Petroleum Geoscience',
    'Pharmacy', 'Philology', 'Philosophy', 'Philosophy Politics and Economics', 'Physical Education',
    'Physics', 'Political Science', 'Political Science and International Relations', 'Psychology',
    'Public Health', 'Renewable Energy', 'Semiotics', 'Slavic Studies', 'Social Sciences', 'Sociology',
    'Software Engineering', 'Theology', 'Tourism', 'Tourism Studies', 'Translation and Interpreting',
    'Urban Planning', 'Veterinary Medicine'
];

interface FilterUniversitiesProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    onApply?: () => void;
    onReset?: () => void;
}

export default function FilterUniversities({
    filters,
    setFilters,
    onApply,
    onReset,
}: FilterUniversitiesProps) {
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        if (onApply) onApply();
    };

    const handleReset = () => {
        setFilters(initialFilters);
        if (onReset) onReset();
    };

    return (
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-xs">
            <h2 className="mb-5 text-lg font-bold text-slate-900">Filter Universities</h2>

            <div className="space-y-4">
                {/* Search */}
                <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-800">
                        Search
                    </label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Search universities..."
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                </div>

                {/* Country */}
                <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-800">
                        Country
                    </label>
                    <div className="relative">
                        <select
                            name="country"
                            value={filters.country}
                            onChange={handleChange}
                            className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        >
                            <option value="All Countries">All Countries</option>
                            {COUNTRIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                    </div>
                </div>

                {/* Ranking */}
                <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-800">
                        Ranking Range
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="minRanking"
                            value={filters.minRanking}
                            onChange={handleChange}
                            placeholder="Min"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                        <span className="text-xs text-slate-400">-</span>
                        <input
                            type="number"
                            name="maxRanking"
                            value={filters.maxRanking}
                            onChange={handleChange}
                            placeholder="Max"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                    </div>
                </div>

                {/* Tuition Fee */}
                <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-800">
                        Tuition Fee (USD)
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            name="minTuition"
                            value={filters.minTuition}
                            onChange={handleChange}
                            placeholder="Min"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                        <span className="text-xs text-slate-400">-</span>
                        <input
                            type="number"
                            name="maxTuition"
                            value={filters.maxTuition}
                            onChange={handleChange}
                            placeholder="Max"
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        />
                    </div>
                </div>

                {/* Programs */}
                <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-800">
                        Programs
                    </label>
                    <div className="relative">
                        <select
                            name="programs"
                            value={filters.programs}
                            onChange={handleChange}
                            className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        >
                            <option value="All Programs">All Programs</option>
                            {PROGRAMS.map((prog) => (
                                <option key={prog} value={prog}>
                                    {prog}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                    </div>
                </div>

                {/* Degree Level */}
                <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-800">
                        Degree Level
                    </label>
                    <div className="relative">
                        <select
                            name="degreeLevel"
                            value={filters.degreeLevel}
                            onChange={handleChange}
                            className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        >
                            <option value="All Degree Levels">All Degree Levels</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="Master">Master</option>
                            <option value="PhD">PhD</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-3">
                    <button
                        type="button"
                        onClick={handleApply}
                        className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.98]"
                    >
                        Apply Filters
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl px-4 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}