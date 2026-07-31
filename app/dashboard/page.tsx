import Sidebar from "../components/Sidebar";
import SearchBar from "../components/Searchbar";
import MapCard from "../components/MapCard";
import TopUniversitiesCard from "../components/TopUniversitiesCard";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#F7F8FC]">
      <Sidebar />

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