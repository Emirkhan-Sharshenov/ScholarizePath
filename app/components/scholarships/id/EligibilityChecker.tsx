'use client';

import React from 'react';
import { CheckCircle2, HelpCircle } from 'lucide-react';

export function EligibilityChecker() {
    const checklistItems = [
        { label: 'Academic Performance (GPA)', status: 'matched' },
        { label: 'Nationality', status: 'matched' },
        { label: 'Field of Study', status: 'matched' },
        { label: 'Program Level', status: 'matched' },
        { label: 'Age Limit', status: 'matched' },
        { label: 'English Language Proficiency', status: 'partial' },
        { label: 'Other Requirements', status: 'matched' },
    ];

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6">Am I Eligible?</h2>

            <div className="flex items-center gap-6 mb-6 rounded-xl bg-slate-50/80 p-4">
                {/* Круговой индикатор */}
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[5px] border-emerald-500 text-center">
                    <div>
                        <div className="text-base font-extrabold text-slate-900">85%</div>
                        <div className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider">High Chance</div>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium text-slate-700">
                        Great news! You meet most of the eligibility criteria for this scholarship.
                    </p>
                    <p className="mt-1 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        ✓ You have a high chance of being selected!
                    </p>
                </div>
            </div>

            <h3 className="text-xs font-bold text-slate-900 mb-3">Eligibility Requirements Checklist</h3>

            <div className="space-y-2.5">
                {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                        <span className="font-medium text-slate-600">{item.label}</span>
                        {item.status === 'matched' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <HelpCircle className="h-4 w-4 text-amber-500" />
                        )}
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