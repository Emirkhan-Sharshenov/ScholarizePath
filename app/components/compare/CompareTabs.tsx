"use client";

import React from "react";
import { GraduationCap, Award } from "lucide-react";

interface CompareTabsProps {
    activeTab: "universities" | "scholarships";
    setActiveTab: (tab: "universities" | "scholarships") => void;
    uniCount: number;
    scholarshipCount: number;
}

export function CompareTabs({
    activeTab,
    setActiveTab,
    uniCount,
    scholarshipCount,
}: CompareTabsProps) {
    return (
        <div className="inline-flex rounded-xl bg-gray-200/70 p-1 border border-gray-200/50">
            <button
                onClick={() => setActiveTab("universities")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === "universities"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
            >
                <GraduationCap className="h-4 w-4" />
                Universities ({uniCount})
            </button>
            <button
                onClick={() => setActiveTab("scholarships")}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === "scholarships"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
            >
                <Award className="h-4 w-4" />
                Scholarships ({scholarshipCount})
            </button>
        </div>
    );
}