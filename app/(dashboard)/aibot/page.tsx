'use client';

import React, { useState } from 'react';
import AIRecommendationsCard, {
  ScholarshipCardData,
  UniversityCardData,
} from '@/components/aibot/aiRecommendation';
import SearchBar from '@/components/aibot/aibotHeader';
import AIChatCard from '@/components/aibot/aibotchat';
import { Sparkles, X } from 'lucide-react';

export default function Page() {
  const [scholarships, setScholarships] = useState<ScholarshipCardData[]>([]);
  const [universities, setUniversities] = useState<UniversityCardData[]>([]);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="bg-[rgb(246,247,251)] min-h-screen flex flex-col pb-10">
      <SearchBar />

      {/* Кнопка переключения рекомендаций для мобильных экранов */}
      <div className="lg:hidden px-4 sm:px-6 pt-4 flex justify-end">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-md transition active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Рекомендации AI</span>
          {(scholarships.length > 0 || universities.length > 0) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 sm:px-6 mt-4 lg:mt-6 max-w-7xl mx-auto w-full items-start">

        {/* Чат карточка */}
        <div className="flex-1 w-full">
          <AIChatCard
            onRecommendations={(data) => {
              setScholarships(data.scholarships);
              setUniversities(data.universities);
            }}
          />
        </div>

        {/* Десктопная sidebar-карточка (скрыта на мобильных) */}
        <div className="hidden lg:block w-80 lg:w-96 shrink-0 sticky top-6">
          <AIRecommendationsCard
            scholarships={scholarships}
            universities={universities}
          />
        </div>
      </div>

      {/* Мобильная шторка / Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-4 overflow-y-auto z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">Рекомендации</span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 flex-1">
              <AIRecommendationsCard
                scholarships={scholarships}
                universities={universities}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}