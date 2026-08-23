"use client";

import React from "react";
import Link from "next/link";
import { Heart, ChevronRight, Scale, Check, Loader2, Plus } from "lucide-react";
import { useFavorites } from "@/lib/useFavorites";

interface ScholarshipBreadcrumbsHeaderProps {
    title: string;
    scholarshipId?: string;
    scholarship?: any;
    isCompared?: boolean;
    onToggleCompare?: () => void;
    onAddToList?: () => void;
    isInList?: boolean;
}

export function ScholarshipBreadcrumbsHeader({
    title,
    scholarshipId,
    scholarship,
    isCompared = false,
    onToggleCompare,
    onAddToList,
    isInList = false,
}: ScholarshipBreadcrumbsHeaderProps) {
    const rawId = scholarshipId || scholarship?._id || scholarship?.id;
    const cleanId = rawId ? String(rawId) : "";

    const { isFavorite, toggleFavorite, loading } = useFavorites(cleanId, "scholarship");

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
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Link href="/scholarships" className="transition-colors hover:text-blue-600">
                    Scholarships
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="max-w-[200px] truncate font-semibold text-slate-900 sm:max-w-none">{title}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={onAddToList}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 ${isInList
                        ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    {isInList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 text-slate-500" />}
                    <span>{isInList ? "Added to List" : "Add to List"}</span>
                </button>

                <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={!cleanId}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-50 ${isFavorite
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : (
                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
                    )}
                    <span>{isFavorite ? "Saved" : "Save"}</span>
                </button>

                <button
                    type="button"
                    onClick={onToggleCompare}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 ${isCompared
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    <Scale className="h-4 w-4" />
                    <span>{isCompared ? "In Comparison" : "Compare"}</span>
                </button>
            </div>
        </div>
    );
}