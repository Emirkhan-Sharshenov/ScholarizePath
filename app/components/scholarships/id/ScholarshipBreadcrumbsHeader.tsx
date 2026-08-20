"use client";

import React from "react";
import Link from "next/link";
import { Share2, Heart, ChevronRight, Scale, Check, Loader2 } from "lucide-react";
import { useFavorites } from "@/lib/useFavorites";

interface ScholarshipBreadcrumbsHeaderProps {
    title: string;
    scholarshipId?: string;
    scholarship?: any;
    isCompared?: boolean;
    onToggleCompare?: () => void;
}

export function ScholarshipBreadcrumbsHeader({
    title,
    scholarshipId,
    scholarship,
    isCompared = false,
    onToggleCompare,
}: ScholarshipBreadcrumbsHeaderProps) {
    // Безопасно получаем ID из любого переданного источника
    const rawId = scholarshipId || scholarship?._id || scholarship?.id;
    const cleanId = rawId ? String(rawId) : "";

    const { isFavorite, toggleFavorite, loading } = useFavorites(cleanId, 'scholarship');

    const handleSaveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!cleanId) {
            console.error("Cannot save: scholarship ID is missing", { scholarshipId, scholarship });
            return;
        }

        await toggleFavorite();
    };

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

                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                >
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Share</span>
                </button>

                {/* Кнопка сохранения стипендии */}
                <button
                    type="button"
                    disabled={!cleanId}
                    onClick={handleSaveClick}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50 ${isFavorite
                            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                    ) : (
                        <Heart
                            className={`h-3.5 w-3.5 transition-colors ${isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-400"
                                }`}
                        />
                    )}
                    <span>{isFavorite ? "Saved" : "Save to Favorites"}</span>
                </button>
            </div>
        </div>
    );
}