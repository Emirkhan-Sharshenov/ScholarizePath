import AIRecommendationsCard from '@/components/aibot/aiRecommendation'
import SearchBar from '@/components/aibot/aibotHeader'
import AIChatCard from '@/components/aibot/aibotchat'
import React from 'react'

function page() {
  return (
    <div className="bg-[rgb(246,247,251)] min-h-screen">
      <div className="flex-1 flex flex-col">
        <SearchBar />
      </div>

      <div className="flex gap-6 px-6 mt-6">
        <AIChatCard />

        <AIRecommendationsCard />
      </div>
    </div>
  )
}

export default page