'use client';

import React, { useState } from 'react';
import ScholarshipsFilter, {
  FilterState,
  initialFilters,
} from '@/components/scholarships/ScholarshipsFilter';
import ScholarshipsListUI from '@/components/scholarships/Scholarships';

export default function ScholarshipsPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  return (
    <div className="min-h-screen bg-[rgb(246,247,251)] pb-12">
      <div className="px-4 pt-6 sm:px-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Scholarships
        </h1>
        <h2 className="mt-1 text-sm text-gray-500 sm:text-base">
          Discover funding opportunities, grants, and financial aid to support your international education
        </h2>
      </div>

      <div className="mt-6 px-4 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          <div className="hidden w-[320px] shrink-0 lg:block">
            <ScholarshipsFilter filters={filters} setFilters={setFilters} />
          </div>
          
          <div className="min-w-0 flex-1">
            <ScholarshipsListUI filters={filters} setFilters={setFilters} />
          </div>

        </div>
      </div>
    </div>
  );
}