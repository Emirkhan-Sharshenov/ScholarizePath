'use client';

import React, { useState } from 'react';
import FilterUniversities, {
  FilterState,
  initialFilters,
} from '@/components/universities/FilterUniversities';
import ListUniversities from '@/components/universities/ListUniversities';

export default function UniversitiesPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  return (
    <div className="min-h-screen bg-[rgb(246,247,251)]">
      <div className="px-6 pt-6">
        <h1 className="ml-[35px] text-[30px] font-bold text-slate-900">
          Universities
        </h1>
        <h2 className="ml-[35px] text-[20px] text-gray-500">
          Explore top universities from around the world and find the best fit for your academic journey
        </h2>
      </div>

      <div className="flex flex-col">
        <div className="mt-8 flex gap-6 px-8">
          <div className="w-[320px] shrink-0">
            <FilterUniversities filters={filters} setFilters={setFilters} />
          </div>

          <div className="flex-1">
            <ListUniversities filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}