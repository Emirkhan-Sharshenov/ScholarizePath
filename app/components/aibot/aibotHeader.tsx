"use client"

import {  Bell } from "lucide-react";
import Image from "next/image"

function SearchBar() {
    return (
        <div className="flex justify-center">
            <header className="relative h-17 w-full bg-[rgb(252,254,255)] flex items-center ">
                <div className="flex items-center justify-center gap-4">
                    <Image
                        src="/images/aibot/ai-star.png"
                        alt="AI Star"
                        width={50}
                        height={50}
                        className="absolute left-6"
                    />

                    <div>
                        <h1 className="ml-[75px] text-[20px] font-bold z-2">
                            AI ScholarizePath
                        </h1>

                        <h2 className="ml-[75px] text-[10px] text-gray-500 z-2">
                            Your AI assistant for finding scholarships and universities
                        </h2>
                    </div>
                </div>

                <button
                    className="absolute right-6 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-[rgb(2,76,209)]"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>
            </header>
        </div>
    );
}

export default SearchBar;