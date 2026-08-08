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
    <div className="min-h-screen bg-[rgb(246,247,251)]">
      <div className="px-6 pt-6">
        <h1 className="ml-[35px] text-[30px] font-bold text-slate-900">
          Scholarships
        </h1>
        <h2 className="ml-[35px] text-[20px] text-gray-500">
          Discover funding opportunities, grants, and financial aid to support your international education
        </h2>
      </div>

      <div className="flex flex-col">
        <div className="mt-8 flex gap-6 px-8">
          <div className="w-[320px] shrink-0">
            <ScholarshipsFilter filters={filters} setFilters={setFilters} />
          </div>

          <div className="flex-1">
            <ScholarshipsListUI filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}