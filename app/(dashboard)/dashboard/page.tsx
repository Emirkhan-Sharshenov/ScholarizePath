"use client";

import MapCard from "../../components/dashboard/MapCard";

export default function Page() {
  return (
    <div className="bg-[rgb(246,247,251)] min-h-screen pb-10">
      <div className="flex flex-col w-full">
        <section className="w-full flex justify-center px-4 mt-4">
          <div className="w-full max-w-7xl">
            <MapCard />
          </div>
        </section>
      </div>
    </div>
  );
}