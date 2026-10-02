'use client';

import React, { useState } from 'react';
import ScholarshipsFilter, {
  FilterState,
  initialFilters,
} from '@/components/scholarships/ScholarshipsFilter';
import ScholarshipsListUI from '@/components/scholarships/Scholarships';
import { useI18n } from '@/i18n/I18nProvider';

export default function ScholarshipsPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-12 font-body">
      <div className="px-4 pt-5 sm:px-6 md:px-10 md:pt-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-4xl">{t.scholarships.title}</h1>
        <p className="mt-1.5 text-sm text-slate-500 md:text-base">{t.scholarships.lead}</p>
      </div>

      <div className="mt-5 px-4 sm:px-6 md:mt-7 md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          <div className="hidden w-[300px] shrink-0 lg:sticky lg:top-6 lg:block">
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