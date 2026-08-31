'use client';

import React from 'react';
import { BarChart2, Globe, User, BookOpen, GraduationCap, FileText, ChevronRight } from 'lucide-react';
import { Scholarship } from '@/types/scholarship';
import type { UserProfile } from '@/types/user';

interface EligibilityCriteriaListProps {
    scholarship: Scholarship;
    userProfile: UserProfile | null;
    loading: boolean;
}

export function EligibilityCriteriaList({ scholarship, userProfile }: EligibilityCriteriaListProps) {
    const reqs = scholarship?.requirements || {};

    const minGpaRaw = reqs.gpa?.minimum ?? 0;
    const userGpa = userProfile?.gpa ?? 0;

    // Конвертация для сравнения
    const minGpaNormalized = minGpaRaw > 4.0 ? (minGpaRaw / 100) * 4.0 : minGpaRaw;
    const isGpaOk = userGpa >= minGpaNormalized;

    // 'nationality' может отсутствовать в текущем типе requirements — обращаемся безопасно
    const nationalityReq = (reqs as { nationality?: { eligibleCountries?: string } }).nationality;

    const criteria = [
        {
            icon: <BarChart2 className="h-4 w-4 text-slate-500" />,
            title: 'GPA Requirement',
            desc: reqs.gpa?.description || (minGpaRaw > 4.0 ? `Minimum ${minGpaRaw}%` : `Minimum ${minGpaRaw} / 4.0`),
            status: isGpaOk
                ? `You meet this requirement (${userGpa} / 4.0)`
                : `Your GPA is ${userGpa} (Requires ~${minGpaNormalized.toFixed(1)} / 4.0)`,
            isOk: isGpaOk,
        },
        {
            icon: <Globe className="h-4 w-4 text-slate-500" />,
            title: 'Nationality',
            desc: nationalityReq?.eligibleCountries || 'Open to all international applicants',
            status: 'You meet this requirement',
            isOk: true,
        },
        {
            icon: <User className="h-4 w-4 text-slate-500" />,
            title: 'Age Limit',
            desc: reqs.age?.description || `Under ${reqs.age?.max || 35} years old`,
            status: 'You meet this requirement',
            isOk: true,
        },
        {
            icon: <BookOpen className="h-4 w-4 text-slate-500" />,
            title: 'Field of Study',
            desc: scholarship?.fieldOfStudy || 'All fields',
            status: 'You meet this requirement',
            isOk: true,
        },
        {
            icon: <GraduationCap className="h-4 w-4 text-slate-500" />,
            title: 'Program Level',
            desc: Array.isArray(scholarship?.studyLevel) ? scholarship.studyLevel.join(', ') : scholarship?.studyLevel || 'All levels',
            status: 'You meet this requirement',
            isOk: true,
        },
        {
            icon: <FileText className="h-4 w-4 text-slate-500" />,
            title: 'Other Requirements',
            isList: true,
            descList: reqs.other && reqs.other.length > 0 ? reqs.other : [
                reqs.education?.minimumDegree || 'High school diploma or University degree',
                reqs.language?.description || 'Language proficiency certificates if required',
                'Academic Transcripts and Recommendation Letters',
            ],
        },
    ];

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-6">Eligibility Criteria</h2>

            <div className="space-y-6">
                {criteria.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            {item.icon}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>

                            {item.isList ? (
                                <ul className="list-disc pl-4 text-xs text-slate-600 space-y-0.5 font-medium">
                                    {item.descList?.map((d, i) => (
                                        <li key={i}>{d}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs font-medium text-slate-600">{item.desc}</p>
                            )}

                            {item.status && (
                                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold pt-0.5 ${item.isOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {item.isOk ? '✓' : 'ℹ'} {item.status}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}