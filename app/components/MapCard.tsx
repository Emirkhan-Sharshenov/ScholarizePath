import MapFilter from "./MapFilter";

export default function MapCard() {
    return (
        <main className="w-[95%] mx-auto">
            <div className="px-6 pt-6">
                <h1 className="ml-[75px] text-[20px] font-bold">
                    Explore the World
                </h1>

                <h2 className="ml-[75px] text-[10px] text-gray-500">
                    Discover top universities across the globe
                </h2>
            </div>

            <div className="mt-6 h-[70vh]">
                <MapFilter />
            </div>
        </main>
    );
}