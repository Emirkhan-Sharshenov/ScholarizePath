"use client"

import { Search, Heart, Bell } from "lucide-react";

function SearchBar() {
    return (
        <div className="flex justify-center">
            <header className="h-17 w-[95%] rounded-2xl bg-[rgb(252,254,255)] px-6 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 w-[50%] ">
                    <Search className="h-5 w-5 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search for scholarships..."
                        className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    />
                </div>

                <div className="flex items-center gap-4 pl-4">
                    <button
                        aria-label="Favorites"
                        className="rounded-full p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-red-500"
                    >
                        <Heart className="h-5 w-5" />
                    </button>
                    <button
                        aria-label="Notifications"
                        className="relative rounded-full p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-[rgb(2,76,209)]"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                    </button>
                </div>
            </header>
        </div>
    );
}

export default SearchBar;