import React from 'react'
import WorldMap from './WorldMap'
import WorldMapFilter from './WorldMapFilter'

function MapFilter() {
  return (
      <div className="mt-6 flex gap-6 h-[70vh]">
          <div className="flex-[8.5] h-full rounded-3xl overflow-hidden">
              <WorldMap />
          </div>

          <div className="flex-[1.5]">
              <WorldMapFilter />
          </div>
      </div>
  )
}

export default MapFilter