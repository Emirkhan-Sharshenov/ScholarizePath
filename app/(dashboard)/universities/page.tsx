import FilterUniversities from '@/components/universities/FilterUniversities'
import ListUniversities from '@/components/universities/ListUniversities'

import React from 'react'

function page() {
  return (
    <div className="min-h-screen bg-[rgb(246,247,251)]">
          <div className="px-6 pt-6">
            <h1 className="ml-[35px] text-[30px] font-bold">
              Universities
            </h1>
    
            <h2 className="ml-[35px] text-[20px] text-gray-500">
              Explore top universities from around the world and find the best fit for your academic journey
            </h2>
          </div>
          <div className="flex flex-col">
    
            <div className="mt-8 flex gap-6 px-8">
              {/* Левая колонка */}
              <div className="w-[320px] shrink-0">
                <div className="origin-top scale-90">
                  <FilterUniversities />
                </div>
              </div>
    
              {/* Правая колонка */}
              <div className="flex-1">
                <ListUniversities />
              </div>
            </div>
          </div>
        </div>
  )
}

export default page