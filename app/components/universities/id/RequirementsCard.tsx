'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function RequirementsCard() {
    const items = [
        'Online Application',
        'Transcripts',
        'Statement of Purpose',
        'Letters of Recommendation (2)',
        'Resume/CV',
        'Test Scores (TOEFL/GRE)'
    ];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-sm font-bold text-slate-900">Requirements</h3>
            <ul className="space-y-3.5 text-xs text-slate-700">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}