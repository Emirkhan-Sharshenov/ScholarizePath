"use client";

import MapFilter from "./MapFilter";
import TopUniversitiesCard from "./TopUniversitiesCard";

export default function MapCard() {
    return (
        <main className="w-full px-4 pb-12 font-body sm:px-6 md:px-10">
            <div className="pt-5 md:pt-8">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink md:text-4xl">
                    Explore the World
                </h1>
                <p className="mt-1.5 text-sm text-slate-500 md:text-base">
                    Discover top universities and scholarships across the globe
                </p>
            </div>

            <div className="mt-5 md:mt-7">
                <MapFilter />
            </div>

            <div className="mt-10 md:mt-14">
                <TopUniversitiesCard />
            </div>
        </main>
    );
}
