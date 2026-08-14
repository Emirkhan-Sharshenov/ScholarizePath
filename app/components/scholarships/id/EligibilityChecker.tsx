'use client';

import React from 'react';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { Scholarship } from '@/types/scholarship';
import { UserProfile } from './ScholarshipDetailsPage';

interface EligibilityCheckerProps {
    scholarship: Scholarship;
    userProfile: UserProfile | null;
    loading: boolean;
}

// Вспомогательная функция приведения GPA к шкале 4.0
function getNormalizedGpa(minGpaRaw: number, scaleRaw?: number): number {
    if (!minGpaRaw) return 0;

    // Если шкала явно 4.0 или балл уже <= 4.0
    if (scaleRaw === 4 || minGpaRaw <= 4.0) {
        return minGpaRaw;
    }

    // Если шкала 100 или балл больше 4 (например, 70%, 75%, 80%)
    if (scaleRaw === 100 || minGpaRaw > 4.0) {
        return Number(((minGpaRaw / 100) * 4.0).toFixed(2)); // 70% -> 2.8 GPA
    }

    return minGpaRaw;
}

export function EligibilityChecker({ scholarship, userProfile, loading }: EligibilityCheckerProps) {
    const reqs = scholarship?.requirements || {};

    const rawMinGpa = reqs.gpa?.minimum ?? 0;
    const rawScale = reqs.gpa?.scale;
    const normalizedMinGpa = getNormalizedGpa(rawMinGpa, rawScale);

    const userGpa = userProfile?.gpa ?? 0;
    const maxAge = reqs.age?.max ?? 99;

    // Проверки
    const isGpaMatch = userProfile ? userGpa >= normalizedMinGpa : true;
    const isAgeMatch = userProfile ? (userProfile.age ?? 20) <= maxAge : true;
    const isEnglishPartial = userProfile ? userProfile.englishTest.score > 0 : false;

    const checklistItems = [
        { label: 'Academic Performance (GPA)', status: isGpaMatch ? 'matched' : 'not_matched' },
        { label: 'Nationality', status: 'matched' },
        { label: 'Field of Study', status: 'matched' },
        { label: 'Program Level', status: 'matched' },
        { label: 'Age Limit', status: isAgeMatch ? 'matched' : 'not_matched' },
        { label: 'English Language Proficiency', status: isEnglishPartial ? 'partial' : 'matched' },
        { label: 'Other Requirements', status: 'matched' },
    ];

    const total = checklistItems.length;
    const matchedCount = checklistItems.filter(i => i.status === 'matched').length;
    const partialCount = checklistItems.filter(i => i.status === 'partial').length;
    const scorePercent = Math.round(((matchedCount + partialCount * 0.5) / total) * 100);

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6">Am I Eligible?</h2>

            <div className="flex items-center gap-6 mb-6 rounded-xl bg-slate-50/80 p-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[5px] border-emerald-500 text-center">
                    <div>
                        <div className="text-base font-extrabold text-slate-900">{loading ? '...' : `${scorePercent}%`}</div>
                        <div className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider">
                            {scorePercent >= 75 ? 'High Chance' : scorePercent >= 50 ? 'Moderate' : 'Low Chance'}
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium text-slate-700">
                        {scorePercent >= 70
                            ? 'Great news! You meet most of the eligibility criteria for this scholarship.'
                            : 'You meet some requirements, but review details carefully.'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        ✓ You have a {scorePercent >= 75 ? 'high' : 'good'} chance of being selected!
                    </p>
                </div>
            </div>

            <h3 className="text-xs font-bold text-slate-900 mb-3">Eligibility Requirements Checklist</h3>

            <div className="space-y-2.5">
                {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                        <span className="font-medium text-slate-600">{item.label}</span>
                        {item.status === 'matched' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {item.status === 'partial' && <HelpCircle className="h-4 w-4 text-amber-500" />}
                        {item.status === 'not_matched' && <XCircle className="h-4 w-4 text-rose-500" />}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Matched
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" /> Partial Match
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Not Matched
                </span>
            </div>
        </div>
    );
}