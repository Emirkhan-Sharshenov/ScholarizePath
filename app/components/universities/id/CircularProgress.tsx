'use client';

import React from 'react';

interface CircularProgressProps {
    value: number;
    color: string;
    text: string;
    subtext: string;
}

export default function CircularProgress({ value, color, text, subtext }: CircularProgressProps) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-3 flex h-24 w-24 items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                    <circle
                        cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${color}`}
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-slate-800">{value}%</span>
                </div>
            </div>
            <span className="text-sm font-semibold text-emerald-600">{text}</span>
            <span className="mt-1 text-[10px] text-slate-500 max-w-[120px] leading-tight">{subtext}</span>
        </div>
    );
}