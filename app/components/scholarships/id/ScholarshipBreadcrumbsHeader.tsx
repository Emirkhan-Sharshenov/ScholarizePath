"use client";

import React from "react";
import Link from "next/link";
import { Share2, Heart, ChevronRight, Scale, Check } from "lucide-react";

interface ScholarshipBreadcrumbsHeaderProps {
    title: string;
    isCompared?: boolean;
    onToggleCompare?: () => void;
}

export function ScholarshipBreadcrumbsHeader({
    title,
    isCompared = false,
    onToggleCompare,
}: ScholarshipBreadcrumbsHeaderProps) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Link href="/scholarships" className="hover:text-blue-600 transition-colors">
                    Scholarships
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
                    {title}
                </span>
            </nav>

            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleCompare}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition active:scale-95 ${isCompared
                            ? "border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    {isCompared ? (
                        <Check className="h-3.5 w-3.5 text-blue-600" />
                    ) : (
                        <Scale className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    {isCompared ? "In Comparison" : "Compare"}
                </button>

                <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95">
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    Share
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95">
                    <Heart className="h-3.5 w-3.5 text-slate-400" />
                    Save to Favorites
                </button>
            </div>
        </div>
    );
}