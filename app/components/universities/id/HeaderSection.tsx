'use client';

import React from 'react';
import { MapPin, Info } from 'lucide-react';
import CircularProgress from './CircularProgress';

interface HeaderSectionProps {
    name: string;
    location: string;
    rank: string | number;
    type: string;
    desc: string;
    website?: string;
    eligibilityScore: number;
    chancesScore: number;
}

export default function HeaderSection({
    name, location, rank, type, desc, website, eligibilityScore, chancesScore
}: HeaderSectionProps) {
    const getChancesText = (score: number) => {
        if (score >= 75) return { text: 'High', color: 'text-emerald-500' };
        if (score >= 45) return { text: 'Moderate', color: 'text-blue-500' };
        return { text: 'Low', color: 'text-amber-500' };
    };

    const chanceInfo = getChancesText(chancesScore);

    return (
        <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:flex-row">
            <div className="flex-1">
                <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-600">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{name}</h1>
                        <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                            <MapPin className="h-4 w-4" />
                            {location}
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-6 rounded-xl bg-slate-50 p-4 border border-gray-100/50">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Global Ranking</p>
                        <p className="mt-0.5 text-sm font-bold text-slate-800">#{rank}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Type</p>
                        <p className="mt-0.5 text-sm font-bold text-slate-800">{type}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Intakes</p>
                        <p className="mt-0.5 text-sm font-bold text-slate-800">Fall, Spring</p>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Founded</p>
                        <p className="mt-0.5 text-sm font-bold text-slate-800">1861</p>
                    </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-600 line-clamp-2">{desc}</p>
                {website && (
                    <a href={website} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
                        View University Profile →
                    </a>
                )}
            </div>

            <div className="flex w-full flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row xl:w-[450px] xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                <div className="flex-1 rounded-xl border border-gray-100 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Am I Eligible to Apply?</span>
                        <Info className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <CircularProgress
                        value={eligibilityScore}
                        color="text-emerald-500"
                        text={eligibilityScore >= 70 ? "Yes" : "Partial"}
                        subtext="You meet most of the eligibility criteria"
                    />
                </div>
                <div className="flex-1 rounded-xl border border-gray-100 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">My Chances of Admission</span>
                        <Info className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <CircularProgress
                        value={chancesScore}
                        color={chanceInfo.color}
                        text={chanceInfo.text}
                        subtext="Good chance! Strengthen your profile for better outcomes."
                    />
                </div>
            </div>
        </div>
    );
}