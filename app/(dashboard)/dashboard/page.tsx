"use client";

import { useState } from "react";
import SearchBar from "../../components/dashboard/SearchbarDashboard";
import MapCard from "../../components/dashboard/MapCard";
import TopUniversitiesCard from "../../components/dashboard/TopUniversitiesCard";

export default function Page() {
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();

  return (
    <div className="bg-[rgb(246,247,251)] min-h-screen pb-10">
      <div className="flex flex-col w-full">
        <SearchBar />

        {/* Блок карты */}
        <section className="w-full flex justify-center px-4 mt-4">
          <div className="w-full max-w-7xl">
            <MapCard onSelectCountry={(country) => setSelectedCountry(country)} />
          </div>
        </section>

        {/* Блок университетов (min-w-0 защищает от поломки flex-сеток) */}
        <section className="w-full flex justify-center px-4 mt-6 min-w-0">
          <div className="w-full max-w-7xl min-w-0">
            <TopUniversitiesCard countryName={selectedCountry} />
          </div>
        </section>
      </div>
    </div>
  );
}