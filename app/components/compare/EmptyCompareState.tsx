"use client";

import React from "react";
import Link from "next/link";
import { Plus, GraduationCap, Award } from "lucide-react";

interface EmptyCompareStateProps {
    activeTab: "universities" | "scholarships";
}

export function EmptyCompareState({ activeTab }: EmptyCompareStateProps) {
    const isUni = activeTab === "universities";
    const title = isUni ? "Universities" : "Scholarships";
    const href = isUni ? "/universities" : "/scholarships";

    return (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm my-8 flex flex-col items-center">
            <div className="mb-4 rounded-full bg-blue-50 p-4 text-blue-600">
                {isUni ? <GraduationCap className="h-8 w-8" /> : <Award className="h-8 w-8" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No {title} Selected</h2>
            <p className="text-gray-500 mb-6 max-w-md">
                Select {title.toLowerCase()} from their details page to compare their metrics here.
            </p>
            <Link
                href={href}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
                <Plus className="h-4 w-4" />
                Browse {title}
            </Link>
        </div>
    );
}