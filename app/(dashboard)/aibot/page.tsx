'use client';

import React, { useState } from 'react';
import AIRecommendationsCard, {
  ScholarshipCardData,
  UniversityCardData,
} from '@/components/aibot/aiRecommendation';
import SearchBar from '@/components/aibot/aibotHeader';
import AIChatCard from '@/components/aibot/aibotchat';

function page() {
  const [scholarships, setScholarships] = useState<ScholarshipCardData[]>([]);
  const [universities, setUniversities] = useState<UniversityCardData[]>([]);

  return (
    <div className="bg-[rgb(246,247,251)] min-h-screen">
      <div className="flex-1 flex flex-col">
        <SearchBar />
      </div>

      <div className="flex gap-6 px-6 mt-6">
        <AIChatCard
          onRecommendations={(data) => {
            setScholarships(data.scholarships);
            setUniversities(data.universities);
          }}
        />

        <AIRecommendationsCard
          scholarships={scholarships}
          universities={universities}
        />
      </div>
    </div>
  );
}

export default page;