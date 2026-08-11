'use client';

import React from 'react';
import Link from 'next/link';
import { Share2, Heart, ChevronRight } from 'lucide-react';

export function ScholarshipBreadcrumbsHeader({ title }: { title: string }) {
    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Link href="/scholarships" className="hover:text-blue-600 transition-colors">
                    Scholarships
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="hover:text-blue-600 transition-colors cursor-pointer">
                    International Scholarships
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none">
                    {title}
                </span>
            </nav>

            <div className="flex items-center gap-2">
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