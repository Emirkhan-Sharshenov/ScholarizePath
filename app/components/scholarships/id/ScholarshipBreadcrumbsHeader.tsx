"use client";

import React from "react";
import Link from "next/link";
import { Share2, Heart, ChevronRight, Scale, Check } from "lucide-react";

interface ScholarshipBreadcrumbsHeaderProps {
    title: string;
    scholarship?: any;
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
            {/* Breadcrumb Навигация */}
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Link
                    href="/scholarships"
                    className="transition-colors hover:text-blue-600"
                >
                    Scholarships
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="max-w-[200px] truncate font-semibold text-slate-900 sm:max-w-none">
                    {title}
                </span>
            </nav>

            {/* Кнопки действий */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onToggleCompare}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition active:scale-95 ${isCompared
                            ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    {isCompared ? (
                        <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                        <Scale className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>{isCompared ? "In Comparison" : "Compare"}</span>
                </button>

                <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95">
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Share</span>
                </button>

                <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95">
                    <Heart className="h-3.5 w-3.5 text-slate-400" />
                    <span>Save to Favorites</span>
                </button>
            </div>
        </div>
    );
}