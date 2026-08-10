'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';

interface EligibilityCardProps {
    userProfile: { gpa: number; ielts: number; sat: number };
    minGpa: number | string;
    minToefl: number | string;
    minIelts: number | string;
    minSat: number | string;
}

export default function EligibilityCard({ userProfile, minGpa, minToefl, minIelts, minSat }: EligibilityCardProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-sm font-bold text-slate-900">Eligibility Criteria</h3>
            <ul className="space-y-4 text-xs">
                <li className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-slate-400" /> Bachelor's Degree
                    </span>
                    <span className="font-semibold text-emerald-600">Required</span>
                </li>
                <li className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-700">Minimum GPA</span>
                        <span className="text-[10px] text-slate-400">Your GPA: {userProfile.gpa}</span>
                    </div>
                    <span className={`font-semibold ${typeof minGpa === 'number' && userProfile.gpa >= minGpa ? 'text-slate-900' : 'text-amber-600'}`}>
                        {minGpa} / 4.0
                    </span>
                </li>
                <li className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-700">English Tests</span>
                        <span className="text-[10px] text-slate-400">Your IELTS: {userProfile.ielts}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                        TOEFL {minToefl}+ / IELTS {minIelts}+
                    </span>
                </li>
                <li className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-700">Standardized Tests</span>
                        <span className="text-[10px] text-slate-400">Your SAT: {userProfile.sat}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                        SAT {minSat}+
                    </span>
                </li>
            </ul>
        </div>
    );
}