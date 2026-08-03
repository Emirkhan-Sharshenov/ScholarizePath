import React from 'react';
import ScholarshipsFilter from '@/components/scholarships/ScholarshipsFilter';
import Scholarships from '@/components/scholarships/Scholarships';

function Page() {
  return (
    <div className="min-h-screen bg-[rgb(246,247,251)]">
      <div className="px-6 pt-6">
        <h1 className="ml-[35px] text-[30px] font-bold">
          Scholarships
        </h1>

        <h2 className="ml-[35px] text-[20px] text-gray-500">
          Discover and apply for top scholarships from top universities worldwide
        </h2>
      </div>
      <div className="flex flex-col">

        <div className="mt-8 flex gap-6 px-8">
          {/* Левая колонка */}
          <div className="w-[320px] shrink-0">
            <div className="origin-top scale-81">
              <ScholarshipsFilter />
            </div>
          </div>

          {/* Правая колонка */}
          <div className="flex-1">
            <Scholarships />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;