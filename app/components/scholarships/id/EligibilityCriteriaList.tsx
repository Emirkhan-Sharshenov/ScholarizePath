'use client';

import React from 'react';
import { BarChart2, Globe, User, BookOpen, GraduationCap, FileText, ChevronRight } from 'lucide-react';
import { Scholarship } from '@/types/scholarship';

export function EligibilityCriteriaList({ scholarship }: { scholarship: Scholarship }) {
    const reqs = scholarship?.requirements || {};

    const criteria = [
        {
            icon: <BarChart2 className="h-4 w-4 text-slate-500" />,
            title: 'GPA Requirement',
            desc: reqs.gpa?.description || `Minimum ${reqs.gpa?.minimum || 3.75} out of ${reqs.gpa?.scale || 4.0} or equivalent`,
            status: 'You meet this requirement',
        },
        {
            icon: <Globe className="h-4 w-4 text-slate-500" />,
            title: 'Nationality',
            desc: reqs.nationality?.eligibleCountries || 'Open to all nationalities except French',
            status: 'You meet this requirement',
        },
        {
            icon: <User className="h-4 w-4 text-slate-500" />,
            title: 'Age Limit',
            desc: reqs.age?.description || `Applicants must be under ${reqs.age?.max || 35} years old`,
            status: 'You meet this requirement',
        },
        {
            icon: <BookOpen className="h-4 w-4 text-slate-500" />,
            title: 'Field of Study',
            desc: scholarship.fieldOfStudy || 'Engineering, Law, Economics, Political Science',
            status: 'You meet this requirement',
        },
        {
            icon: <GraduationCap className="h-4 w-4 text-slate-500" />,
            title: 'Program Level',
            desc: Array.isArray(scholarship.studyLevel) ? scholarship.studyLevel.join(' and ') : scholarship.studyLevel,
            status: 'You meet this requirement',
        },
        {
            icon: <FileText className="h-4 w-4 text-slate-500" />,
            title: 'Other Requirements',
            isList: true,
            descList: reqs.other || [
                'Strong academic record',
                'Statement of Purpose',
                '2 Letters of Recommendation',
                'Proof of Language Proficiency',
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
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 pt-0.5">
                                    ✓ {item.status}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
                <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition">
                    View full details <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}