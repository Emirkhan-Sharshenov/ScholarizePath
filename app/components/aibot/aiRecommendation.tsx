'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Heart, Compass } from 'lucide-react';

interface AIRecommendationsCardProps {
    scholarships?: Array<{
        id: string;
        title: string;
        amount: string;
        level: string;
        logoUrl?: string;
    }>;
    universities?: Array<{
        id: string;
        name: string;
        location: string;
        rankBadge: string;
        logoUrl?: string;
    }>;
    onViewAllScholarships?: () => void;
    onViewAllUniversities?: () => void;
    onViewMoreAI?: () => void;
}

export default function AIRecommendationsCard({
    scholarships = [
        {
            id: '1',
            title: 'Vanier Canada Graduate Scholarships',
            amount: '$50,000 / year',
            level: 'Graduate',
        },
        {
            id: '2',
            title: 'NSERC Postgraduate Scholarships',
            amount: '$35,000 / year',
            level: 'Graduate',
        },
        {
            id: '3',
            title: 'UofT Lester B. Pearson International Scholarship',
            amount: '$25,000 / year',
            level: 'Undergraduate',
        },
    ],
    universities = [
        {
            id: '1',
            name: 'University of Toronto',
            location: 'Toronto, Canada',
            rankBadge: '#1 in Canada',
        },
        {
            id: '2',
            name: 'University of British Columbia',
            location: 'Vancouver, Canada',
            rankBadge: '#3 in Canada',
        },
        {
            id: '3',
            name: 'McGill University',
            location: 'Montreal, Canada',
            rankBadge: '#2 in Canada',
        },
    ],
    onViewAllScholarships,
    onViewAllUniversities,
    onViewMoreAI,
}: AIRecommendationsCardProps) {
    const [favorites, setFavorites] = useState<Record<string, boolean>>({});

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-white p-4 sm:p-5 rounded-3xl font-sans border border-slate-100 shadow-xs">

            {/* Top Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center">
                        <Image
                                                                            src="/images/aibot/ai-star.png"
                                                                            alt="AI Star"
                                                                            width={30}
                                                                            height={30}
                                                                        />
                        <h2 className="text-base font-bold text-slate-800">AI Recommendations</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Personalized for you</p>
                </div>
                <button
                    onClick={onViewMoreAI}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                >
                    View All
                </button>
            </div>

            {/* Top Scholarships Section */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold text-slate-800">Top Scholarships for You</h3>
                    <button
                        onClick={onViewAllScholarships}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                    >
                        View All
                    </button>
                </div>

                <div className="space-y-2">
                    {scholarships.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100/80 shadow-xs hover:border-indigo-100 transition"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Logo Placeholder */}
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 font-bold text-xs text-indigo-600">
                                    {item.title.slice(0, 2).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs font-bold text-emerald-600 mt-0.5">
                                        {item.amount}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                                <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">
                                    {item.level}
                                </span>
                                <button
                                    onClick={() => toggleFavorite(`scholarship-${item.id}`)}
                                    className="text-slate-300 hover:text-rose-500 transition"
                                >
                                    <Heart
                                        className={`w-4 h-4 ${favorites[`scholarship-${item.id}`]
                                                ? 'fill-rose-500 text-rose-500'
                                                : ''
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommended Universities Section */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold text-slate-800">Recommended Universities</h3>
                    <button
                        onClick={onViewAllUniversities}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                    >
                        View All
                    </button>
                </div>

                <div className="space-y-2">
                    {universities.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100/80 shadow-xs hover:border-indigo-100 transition"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Logo Placeholder */}
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 font-bold text-xs text-indigo-600">
                                    {item.name.slice(0, 2).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition">
                                        {item.name}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {item.location}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                                    {item.rankBadge}
                                </span>
                                <button
                                    onClick={() => toggleFavorite(`university-${item.id}`)}
                                    className="text-slate-300 hover:text-rose-500 transition"
                                >
                                    <Heart
                                        className={`w-4 h-4 ${favorites[`university-${item.id}`]
                                                ? 'fill-rose-500 text-rose-500'
                                                : ''
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Gradient Action Card */}
            <button
                onClick={onViewMoreAI}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 rounded-2xl flex items-center justify-between hover:opacity-95 transition shadow-sm group text-left"
            >
                <div>
                    <h4 className="text-xs font-bold">View More AI Recommendations</h4>
                    <p className="text-[11px] text-indigo-100/90 mt-0.5">
                        Explore more scholarships, universities & programs
                    </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                    <Compass className="w-4 h-4 text-white" />
                </div>
            </button>

        </div>
    );
}