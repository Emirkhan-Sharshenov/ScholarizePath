'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calculator, Building2, GraduationCap, Wallet, Loader2 } from 'lucide-react';
import UniversityPicker from './UniversityPicker';
import ScholarshipPicker from './ScholarshipPicker';
import {
    DEFAULT_DURATION,
    ProgramLevel,
    ScholarshipOffset,
    UniversityCostDetail,
    extractUniversityCostDetail,
} from './calculatorTypes';

const COLORS = { tuition: '#0058BD', living: '#60A5FA', covered: '#34D399' };

function formatUSD(value: number): string {
    return `$${Math.round(value).toLocaleString('en-US')}`;
}

function CustomTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
        <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-semibold text-slate-900">{name}</p>
            <p className="mt-0.5 text-slate-600">{formatUSD(value)}</p>
        </div>
    );
}

export default function CostCalculator() {
    const [university, setUniversity] = useState<UniversityCostDetail | null>(null);
    const [loadingUniversity, setLoadingUniversity] = useState(false);
    const [level, setLevel] = useState<ProgramLevel>('bachelor');
    const [duration, setDuration] = useState(DEFAULT_DURATION.bachelor);
    const [scholarship, setScholarship] = useState<ScholarshipOffset | null>(null);

    const handleSelectUniversity = async (id: string) => {
        setLoadingUniversity(true);
        try {
            const res = await fetch(`/api/universities/${id}`);
            if (!res.ok) return;
            const data = await res.json();
            setUniversity(extractUniversityCostDetail(data));
        } finally {
            setLoadingUniversity(false);
        }
    };

    const handleLevelChange = (next: ProgramLevel) => {
        setLevel(next);
        setDuration(DEFAULT_DURATION[next]);
    };

    const breakdown = useMemo(() => {
        if (!university) return null;

        const tuitionPerYear = level === 'bachelor' ? university.tuitionBachelor : university.tuitionMaster;
        const livingPerYear = (university.livingMin + university.livingMax) / 2;
        const totalPerYear = tuitionPerYear + livingPerYear;
        const totalProgram = totalPerYear * duration;

        const tuitionCovered = scholarship?.coversTuition ? tuitionPerYear * duration : 0;
        const scholarshipCash = scholarship ? (scholarship.estimatedMin + scholarship.estimatedMax) / 2 : 0;
        const totalOffset = Math.min(totalProgram, tuitionCovered + scholarshipCash);
        const netTotal = totalProgram - totalOffset;

        return {
            tuitionPerYear,
            livingPerYear,
            totalPerYear,
            totalProgram,
            totalOffset,
            netTotal,
            hasLivingData: university.livingMin > 0 || university.livingMax > 0,
            hasTuitionData: tuitionPerYear > 0,
        };
    }, [university, level, duration, scholarship]);

    const chartData = breakdown
        ? [
            { name: 'Tuition / year', value: breakdown.tuitionPerYear, color: COLORS.tuition },
            { name: 'Living costs / year', value: breakdown.livingPerYear, color: COLORS.living },
        ].filter((d) => d.value > 0)
        : [];

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-5">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                        1. University
                    </label>
                    <UniversityPicker onSelect={handleSelectUniversity} selectedName={university?.name} />
                    {loadingUniversity && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Loading cost data...
                        </div>
                    )}
                    {university && !loadingUniversity && (
                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
                            <Building2 className="h-4 w-4 shrink-0 text-brand" />
                            <div className="min-w-0">
                                <div className="truncate text-sm font-bold text-slate-800">{university.name}</div>
                                {university.location && (
                                    <div className="truncate text-xs text-slate-500">{university.location}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                        2. Program
                    </label>
                    <div className="flex gap-2">
                        {(['bachelor', 'master'] as ProgramLevel[]).map((lvl) => (
                            <button
                                key={lvl}
                                type="button"
                                onClick={() => handleLevelChange(lvl)}
                                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition-colors ${level === lvl
                                        ? 'border-blue-500 bg-blue-50 text-brand'
                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>

                    <label className="mb-1.5 mt-4 block text-xs font-semibold text-slate-500">
                        Duration (years)
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={8}
                        value={duration}
                        onChange={(e) => setDuration(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
                        className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                        3. Apply a scholarship (optional)
                    </label>
                    <ScholarshipPicker onSelect={setScholarship} />
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="sticky top-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-brand" />
                        <h3 className="text-sm font-bold text-slate-900">Estimated Cost</h3>
                    </div>

                    {!university || !breakdown ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-center">
                            <Wallet className="h-7 w-7 text-slate-200" />
                            <p className="text-xs text-slate-400">
                                Pick a university to see an estimated cost breakdown.
                            </p>
                        </div>
                    ) : (
                        <>
                            {chartData.length > 0 && (
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={2}
                                        >
                                            {chartData.map((d) => (
                                                <Cell key={d.name} fill={d.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}

                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                        <span className="h-2 w-2 rounded-full" style={{ background: COLORS.tuition }} />
                                        Tuition / year
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {breakdown.hasTuitionData ? formatUSD(breakdown.tuitionPerYear) : 'Not reported'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                        <span className="h-2 w-2 rounded-full" style={{ background: COLORS.living }} />
                                        Living costs / year
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {breakdown.hasLivingData ? formatUSD(breakdown.livingPerYear) : 'Not reported'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                    <span className="text-slate-600">Total / year</span>
                                    <span className="font-semibold text-slate-900">{formatUSD(breakdown.totalPerYear)}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        Total for {duration} year{duration > 1 ? 's' : ''}
                                    </span>
                                    <span className="font-semibold text-slate-900">{formatUSD(breakdown.totalProgram)}</span>
                                </div>

                                {scholarship && breakdown.totalOffset > 0 && (
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <span className="flex items-center gap-1.5 text-emerald-600">
                                            <span className="h-2 w-2 rounded-full" style={{ background: COLORS.covered }} />
                                            Covered by {scholarship.name}
                                        </span>
                                        <span className="font-semibold text-emerald-600">
                                            -{formatUSD(breakdown.totalOffset)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-1">
                                    <span className="font-bold text-slate-800">Estimated net total</span>
                                    <span className="text-base font-bold text-brand">{formatUSD(breakdown.netTotal)}</span>
                                </div>
                            </div>

                            <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
                                Estimates in USD as reported on each university/scholarship profile — actual costs vary by
                                lifestyle, exchange rates, and award terms.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
