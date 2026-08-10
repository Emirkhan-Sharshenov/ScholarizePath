'use client';

import React from 'react';

interface ProgramsCardProps {
    programs: string[];
}

export default function ProgramsCard({ programs }: ProgramsCardProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-900">Programs Offered</h3>
            <div className="flex flex-wrap gap-2">
                {programs.map((prog, i) => (
                    <span key={i} className="rounded-md bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 border border-gray-100">
                        {prog}
                    </span>
                ))}
            </div>
        </div>
    );
}