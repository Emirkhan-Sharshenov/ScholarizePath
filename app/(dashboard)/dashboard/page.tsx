import Sidebar from "../../components/Sidebar";
import SearchBar from "../../components/SearchbarDashboard";
import MapCard from "../../components/MapCard";
import TopUniversitiesCard from "../../components/TopUniversitiesCard";

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