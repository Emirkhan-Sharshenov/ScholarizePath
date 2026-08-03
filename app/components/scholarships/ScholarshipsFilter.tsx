'use client';

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function FilterScholarships({ onApply, onReset }: { onApply?: (filters: any) => void, onReset?: () => void }) {
  const [filters, setFilters] = useState({
    search: '',
    fieldOfStudy: 'All Fields',
    studyLevel: 'All Levels',
    country: 'All Countries',
    scholarshipType: 'All Types',
    minAmount: '',
    maxAmount: '',
    deadline: 'Any Deadline',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    if (onApply) onApply(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      search: '',
      fieldOfStudy: 'All Fields',
      studyLevel: 'All Levels',
      country: 'All Countries',
      scholarshipType: 'All Types',
      minAmount: '',
      maxAmount: '',
      deadline: 'Any Deadline',
    };
    setFilters(defaultFilters);
    if (onReset) onReset();
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm border border-gray-100 font-sans ">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Filter Scholarships</h2>

      <div className="space-y-4">
        {/* Search Keywords */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Search Keywords
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search scholarships..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Field of Study */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Field of Study
          </label>
          <div className="relative">
            <select
              name="fieldOfStudy"
              value={filters.fieldOfStudy}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="All Fields">All Fields</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Medicine">Medicine</option>
              <option value="Business">Business</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          </div>
        </div>

        {/* Study Level */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Study Level
          </label>
          <div className="relative">
            <select
              name="studyLevel"
              value={filters.studyLevel}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="All Levels">All Levels</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Country
          </label>
          <div className="relative">
            <select
              name="country"
              value={filters.country}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="All Countries">All Countries</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Germany">Germany</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          </div>
        </div>

        {/* Scholarship Type */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Scholarship Type
          </label>
          <div className="relative">
            <select
              name="scholarshipType"
              value={filters.scholarshipType}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="All Types">All Types</option>
              <option value="Fully Funded">Fully Funded</option>
              <option value="Partially Funded">Partially Funded</option>
              <option value="Tuition Waiver">Tuition Waiver</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          </div>
        </div>

        {/* Award Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Award Amount
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleChange}
              placeholder="Min ($)"
              className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
            <input
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleChange}
              placeholder="Max ($)"
              className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Deadline
          </label>
          <div className="relative">
            <select
              name="deadline"
              value={filters.deadline}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            >
              <option value="Any Deadline">Any Deadline</option>
              <option value="Next 7 Days">Next 7 Days</option>
              <option value="This Month">This Month</option>
              <option value="Next 3 Months">Next 3 Months</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleApply}
            className="w-full rounded-xl bg-blue-650 bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition duration-150 active:scale-[0.99]"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="w-full rounded-xl py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition duration-150"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}