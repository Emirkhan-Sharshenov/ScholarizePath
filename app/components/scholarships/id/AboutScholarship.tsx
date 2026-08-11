'use client';

import React from 'react';

export function AboutScholarship({ description }: { description: string }) {
    return (
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-base font-bold text-slate-900 mb-3">About the Scholarship</h2>
            <p className="text-xs font-normal leading-relaxed text-slate-600">
                {description}
            </p>
        </div>
    );
}