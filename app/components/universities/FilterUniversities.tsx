'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ChipGroup, FilterSection, SelectField, inputClass } from '@/components/common/listUi';
import { flagFor } from '@/components/profile/countryList';

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

// Must match the country names stored in the database exactly.
const COUNTRIES = [
    "Argentina",
    "Australia",
    "Brazil",
    "Canada",
    "Chile",
    "China",
    "Egypt",
    "Finland",
    "France",
    "Germany",
    "India",
    "Italy",
    "Japan",
    "Malaysia",
    "Mexico",
    "Netherlands",
    "New Zealand",
    "Nigeria",
    "Russia",
    "Singapore",
    "South Africa",
    "South Korea",
    "Spain",
    "Sweden",
    "Switzerland",
    "Turkey",
    "United Arab Emirates",
    "United Kingdom",
    "United States"
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
    isMobileModal?: boolean;
}

export default function FilterUniversities({
    filters,
    setFilters,
    onApply,
    onReset,
    isMobileModal = false,
}: FilterUniversitiesProps) {
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setFilters(initialFilters);
        if (onReset) onReset();
    };

    return (
        <div className={isMobileModal ? 'w-full font-body' : 'w-full rounded-3xl border border-slate-200/80 bg-white p-5 font-body shadow-[0_4px_12px_rgba(10,26,63,0.04)]'}>
            {!isMobileModal && (
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                        <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-brand" /> Filters
                    </h2>
                    <button type="button" onClick={handleReset} className="text-sm font-semibold text-brand hover:underline">
                        Clear
                    </button>
                </div>
            )}

            <div className="space-y-5">
                <FilterSection label="Country">
                    <SelectField name="country" value={filters.country} onChange={handleChange} ariaLabel="Country">
                        <option value="All Countries">All countries</option>
                        {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                                {flagFor(c)} {c}
                            </option>
                        ))}
                    </SelectField>
                </FilterSection>

                <FilterSection label="World ranking" hint="e.g. 1–100">
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" name="minRanking" aria-label="Minimum ranking" value={filters.minRanking} onChange={handleChange} placeholder="Min" className={inputClass} />
                        <input type="number" name="maxRanking" aria-label="Maximum ranking" value={filters.maxRanking} onChange={handleChange} placeholder="Max" className={inputClass} />
                    </div>
                </FilterSection>

                <FilterSection label="Tuition per year (USD)">
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" name="minTuition" aria-label="Minimum tuition" value={filters.minTuition} onChange={handleChange} placeholder="Min $" className={inputClass} />
                        <input type="number" name="maxTuition" aria-label="Maximum tuition" value={filters.maxTuition} onChange={handleChange} placeholder="Max $" className={inputClass} />
                    </div>
                </FilterSection>

                <FilterSection label="Program">
                    <SelectField name="programs" value={filters.programs} onChange={handleChange} ariaLabel="Program">
                        <option value="All Programs">All programs</option>
                        {PROGRAMS.map((prog) => (
                            <option key={prog} value={prog}>
                                {prog}
                            </option>
                        ))}
                    </SelectField>
                </FilterSection>

                <FilterSection label="Degree level">
                    <ChipGroup
                        ariaLabel="Degree level"
                        options={['Bachelor', 'Master', 'PhD']}
                        value={filters.degreeLevel}
                        emptyValue="All Degree Levels"
                        onChange={(v) => setFilters((prev) => ({ ...prev, degreeLevel: v }))}
                    />
                </FilterSection>

                {isMobileModal && (
                    <div className="flex items-center gap-3 pt-2">
                        <button type="button" onClick={handleReset} className="h-12 rounded-[10px] px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                            Reset
                        </button>
                        <button type="button" onClick={onApply} className="h-12 flex-1 rounded-[10px] bg-brand text-sm font-semibold text-white shadow-sm hover:bg-[#004a9f]">
                            Show results
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
