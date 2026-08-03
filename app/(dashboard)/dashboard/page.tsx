
import SearchBar from "../../components/dashboard/SearchbarDashboard";
import MapCard from "../../components/dashboard/MapCard";
import TopUniversitiesCard from "../../components/dashboard/TopUniversitiesCard";

export default function Page() {
  return (
    <div className="bg-[rgb(246,247,251)]">
      <div className="flex-1 flex flex-col">
        <SearchBar />

        <main className="flex-1 flex justify-center">
          <MapCard />
        </main>
        <main className="flex-1 flex justify-center">
          <TopUniversitiesCard></TopUniversitiesCard>
        </main>

      </div>
      </div>
  );
}