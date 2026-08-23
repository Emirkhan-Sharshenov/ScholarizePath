"use client";

import MapFilter from "./MapFilter";
import TopUniversitiesCard from "./TopUniversitiesCard";

export default function MapCard() {
    return (
        <main className="w-full px-4 sm:px-6 md:px-10 pb-12">
            {/* Title */}
            <div className="pt-4 md:pt-6">
                <h1 className="text-lg md:text-[20px] font-bold text-slate-900">
                    Explore the World
                </h1>
                <h2 className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Discover top universities across the globe
                </h2>
            </div>

            {/* Map & Filter Container */}
            <div className="mt-4 md:mt-6 h-auto md:h-[70vh]">
                <MapFilter />
            </div>

            {/* Suggested Universities Placed Lower Down */}
            <div className="mt-10">
                <TopUniversitiesCard />
            </div>
        </main>
    );
}