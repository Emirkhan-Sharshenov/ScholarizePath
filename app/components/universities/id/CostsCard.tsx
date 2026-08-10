'use client';

import React from 'react';

interface CostsCardProps {
    tuition: number;
    avgLiving: number;
    totalCost: number;
}

export default function CostsCard({ tuition, avgLiving, totalCost }: CostsCardProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-sm font-bold text-slate-900">Tuition & Fees (USD)</h3>
            <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-slate-600">Tuition (Per Year)</span>
                    <span className="font-semibold text-slate-900">${tuition.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-slate-600">Estimated Living (Per Year)</span>
                    <span className="font-semibold text-slate-900">${avgLiving.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                    <span className="font-bold text-slate-800">Estimated Total (Per Year)</span>
                    <span className="font-bold text-blue-600">${totalCost.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}