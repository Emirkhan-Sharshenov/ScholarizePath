'use client';

import React from 'react';

interface StatsCardProps {
    acceptanceRate: number | string;
    totalStudents?: number;
    internationalStudents?: number;
}

export default function StatsCard({ acceptanceRate, totalStudents, internationalStudents }: StatsCardProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-sm font-bold text-slate-900">Admission Statistics</h3>
            <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-slate-600">Acceptance Rate</span>
                    <span className="font-bold text-slate-900">{acceptanceRate}%</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-slate-600">Total Students</span>
                    <span className="font-bold text-slate-900">{totalStudents?.toLocaleString('en-US') || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-slate-600">International Students</span>
                    <span className="font-bold text-slate-900">{internationalStudents?.toLocaleString('en-US') || 'N/A'}</span>
                </div>
                <div className="flex justify-between pb-2">
                    <span className="text-slate-600">Yield Rate</span>
                    <span className="font-bold text-slate-900">21%</span>
                </div>
            </div>
        </div>
    );
}