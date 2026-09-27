'use client';

// Funding and deadline pills shared by the scholarship list, Compare and Saved pages.

import React from 'react';
import { AlarmClock, CalendarClock, CalendarX, Lock } from 'lucide-react';
import { getDeadlineInfo } from '@/lib/scholarshipDisplay';

export function FundingPill({ type }: { type?: string | null }) {
    if (!type) return null;
    const full = /fully/i.test(type);
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${full ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${full ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {type}
        </span>
    );
}

export function DeadlinePill({ deadlines }: { deadlines?: Array<{ name?: string; date?: unknown }> }) {
    const info = getDeadlineInfo(deadlines);
    if (!info.date && info.approxText) {
        return (
            <span title={`Estimated, not an official date: ${info.approxText}`} className="inline-flex max-w-[min(16rem,100%)] items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                <CalendarClock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">≈ {info.approxText.replace(/\s*\((approximate|varies)[^)]*\)/i, '')}</span>
            </span>
        );
    }
    if (!info.date) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                <CalendarX aria-hidden="true" className="h-3.5 w-3.5" /> Dates not announced
            </span>
        );
    }
    if (info.passed) {
        return (
            <span title={`Last deadline ${info.date}`} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                <Lock aria-hidden="true" className="h-3.5 w-3.5" /> Closed
            </span>
        );
    }
    const urgent = (info.daysLeft ?? 0) < 30;
    return (
        <span title={`Deadline ${info.date}`} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${urgent ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-brand'}`}>
            {urgent ? <AlarmClock aria-hidden="true" className="h-3.5 w-3.5" /> : <CalendarClock aria-hidden="true" className="h-3.5 w-3.5" />}
            {info.daysLeft === 0 ? 'Closes today' : `Closes in ${info.daysLeft} day${info.daysLeft === 1 ? '' : 's'}`}
        </span>
    );
}
