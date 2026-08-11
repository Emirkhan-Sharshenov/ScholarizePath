'use client';

import React from 'react';
import { CheckCircle2, ShieldCheck, Globe, GraduationCap, BookOpen } from 'lucide-react';
import { Scholarship } from '@/types/scholarship';

export function ScholarshipHeroBanner({ scholarship }: { scholarship: Scholarship }) {
    const estVal = scholarship?.award?.estimatedValue;
    const valueDisplay = estVal
        ? `$${(estVal.max || estVal.min || 0).toLocaleString()} USD`
        : '$25,000 USD';

    const deadlineDate = scholarship?.deadlines?.[0]?.date || '2026-01-08';

    return (
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                {/* Информация слева */}
                <div className="space-y-4 lg:max-w-[55%]">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                            {scholarship.scholarshipName}
                        </h1>
                        {scholarship.verified && (
                            <CheckCircle2 className="h-6 w-6 shrink-0 text-blue-600 fill-blue-100" />
                        )}
                    </div>

                    <p className="text-xs font-normal leading-relaxed text-slate-500">
                        {scholarship.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                            {scholarship.award?.type || 'Fully Funded'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5">
                            <Globe className="h-3.5 w-3.5 text-slate-500" />
                            {scholarship.country || 'International'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
                            {Array.isArray(scholarship.studyLevel) ? scholarship.studyLevel.join(', ') : scholarship.studyLevel}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                            Priority Fields
                        </span>
                    </div>
                </div>

                {/* Блок таймера и суммы справа */}
                <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 lg:bg-transparent lg:p-0">
                    {/* Дедлайн и счетчик */}
                    <div className="text-center sm:text-right">
                        <span className="text-xs font-medium text-slate-500">Application Deadline</span>
                        <div className="mt-0.5 text-base font-bold text-rose-600">
                            {deadlineDate}
                        </div>
                        <div className="mt-2 flex items-center justify-center sm:justify-end gap-3 text-center">
                            <div>
                                <div className="text-sm font-extrabold text-slate-800">42</div>
                                <div className="text-[10px] text-slate-400">Days</div>
                            </div>
                            <div>
                                <div className="text-sm font-extrabold text-slate-800">14</div>
                                <div className="text-[10px] text-slate-400">Hours</div>
                            </div>
                            <div>
                                <div className="text-sm font-extrabold text-slate-800">28</div>
                                <div className="text-[10px] text-slate-400">Mins</div>
                            </div>
                            <div>
                                <div className="text-sm font-extrabold text-slate-800">36</div>
                                <div className="text-[10px] text-slate-400">Secs</div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block h-12 w-[1px] bg-slate-200" />

                    {/* Сумма */}
                    <div className="text-center sm:text-right">
                        <span className="text-xs font-medium text-slate-500">Scholarship Amount</span>
                        <div className="text-xs text-slate-400">Up to</div>
                        <div className="text-xl font-extrabold text-blue-600">
                            {valueDisplay}
                        </div>
                        <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                            Tuition + Living Allowance
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}