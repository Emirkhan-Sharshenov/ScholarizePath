'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ChipGroup, FilterSection, SelectField, inputClass } from '@/components/common/listUi';
import { flagFor } from '@/components/profile/countryList';

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

// Must match the country names stored in the database exactly.
const COUNTRIES = [
  "Australia",
  "Austria",
  "Canada",
  "China",
  "Czech Republic",
  "France",
  "Germany",
  "Hong Kong",
  "Hungary",
  "Ireland",
  "Italy",
  "Japan",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Qatar",
  "Russia",
  "Saudi Arabia",
  "South Korea",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States"
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

        <FilterSection label="Study level">
          <ChipGroup
            ariaLabel="Study level"
            options={STUDY_LEVELS}
            value={filters.studyLevel}
            emptyValue="All Study Levels"
            onChange={(v) => setFilters((prev) => ({ ...prev, studyLevel: v }))}
          />
        </FilterSection>

        <FilterSection label="Minimum amount" hint="in the scholarship's currency">
          <input type="number" name="minAmount" aria-label="Minimum amount" value={filters.minAmount} onChange={handleChange} placeholder="e.g. 5000" className={inputClass} />
        </FilterSection>

        <FilterSection label="Deadline before">
          <input type="date" name="maxDeadline" aria-label="Deadline before" value={filters.maxDeadline} onChange={handleChange} className={`${inputClass} cursor-pointer`} />
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
