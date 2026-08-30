'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterState {
  search: string;
  country: string;
  studyLevel: string;
  fieldOfStudy: string;
  minAmount: string;
  maxDeadline: string;
}

export const initialFilters: FilterState = {
  search: '',
  country: 'All Countries',
  studyLevel: 'All Study Levels',
  fieldOfStudy: 'All Fields',
  minAmount: '',
  maxDeadline: '',
};

const COUNTRIES = [
  "United States of America",
  "United Kingdom",
  "China",
  "South Korea",
  "Germany",
  "Japan",
  "Italy",
  "United Arab Emirates",
  "Turkey",
  "Russia",
  "Saudi Arabia",
  "Qatar",
  "Australia",
  "Czech Republic"
];

const STUDY_LEVELS = [
  "Bachelor's",
  "Master's",
  'PhD',
  'Postdoctoral',
  'Non-degree Research',
];

const FIELDS_OF_STUDY = [
  'All fields',
  'STEM',
  'Engineering Sciences',
  'Economics & Management',
  'Law & Political Science',
  'Humanities & Social Sciences',
  'Medicine & Health Sciences',
];

interface ScholarshipsFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onApply?: () => void;
  onReset?: () => void;
  isMobileModal?: boolean;
}

export default function ScholarshipsFilter({
  filters,
  setFilters,
  onApply,
  onReset,
  isMobileModal = false,
}: ScholarshipsFilterProps) {
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
    <div className={isMobileModal ? 'w-full font-sans' : 'w-full max-w-xs rounded-2xl border border-gray-100 bg-white p-5 font-sans shadow-sm'}>
      {!isMobileModal && (
        <h2 className="mb-5 text-lg font-bold text-slate-900">Filter Scholarships</h2>
      )}

      <div className="space-y-4">
        {/* Search Input (Hidden in mobile drawer to avoid duplicate input) */}
        {!isMobileModal && (
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-800">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search by name, provider..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        )}

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

        {/* Study Level */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-800">
            Study Level
          </label>
          <div className="relative">
            <select
              name="studyLevel"
              value={filters.studyLevel}
              onChange={handleChange}
              className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="All Study Levels">All Study Levels</option>
              {STUDY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          </div>
        </div>


        {/* Min Amount */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-800">
            Min Award Amount ($)
          </label>
          <input
            type="number"
            name="minAmount"
            value={filters.minAmount}
            onChange={handleChange}
            placeholder="e.g. 5000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Deadline Before */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-800">
            Deadline Before
          </label>
          <input
            type="date"
            name="maxDeadline"
            value={filters.maxDeadline}
            onChange={handleChange}
            className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3">
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
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