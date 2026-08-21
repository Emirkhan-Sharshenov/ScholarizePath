import React from 'react';
import { Search, Globe, Heart, Bell, ChevronDown, GraduationCap } from 'lucide-react';

export function Header() {
    return (
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-gray-900 text-lg leading-tight">ScholarizePath</h1>
                    <p className="text-[10px] text-gray-400 font-medium">Your Pathway to Global Education</p>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-xl mx-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search for countries, universities or programs..."
                    className="w-full bg-gray-100/80 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-5">
                <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900">
                    <Globe className="w-4 h-4" />
                    <span>EN</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                <button className="text-gray-600 hover:text-gray-900">
                    <Heart className="w-5 h-5" />
                </button>

                <button className="relative text-gray-600 hover:text-gray-900">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        3
                    </span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                        alt="Ananya Sharma"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="hidden sm:block">
                        <p className="text-xs font-semibold text-gray-900 leading-none">Ananya Sharma</p>
                        <a href="#" className="text-[10px] text-gray-400 font-medium hover:underline">
                            View Profile
                        </a>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 cursor-pointer" />
                </div>
            </div>
        </header>
    );
}