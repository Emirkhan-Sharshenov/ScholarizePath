"use client";

import React from "react";
import Link from "next/link";
import { Plus, Trash2, CheckCircle2, XCircle, Bookmark, MinusCircle } from "lucide-react";
import { useCompare } from "@/lib/useCompare";

// ==================== Вспомогательные функции сравнения ====================

function getRankOrCostStatuses(values: (number | null)[]) {
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length <= 1) return values.map(() => "neutral");

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    if (min === max) return values.map(() => "neutral");

    return values.map((v) => {
        if (v === null) return "neutral";
        if (v === min) return "best";
        if (v === max) return "worst";
        return "neutral";
    });
}

function getHigherIsBetterStatuses(values: (number | null)[]) {
    const validValues = values.filter((v): v is number => v !== null);
    if (validValues.length <= 1) return values.map(() => "neutral");

    const min = Math.min(...validValues);
    const max = Math.max(...validValues);

    if (min === max) return values.map(() => "neutral");

    return values.map((v) => {
        if (v === null) return "neutral";
        if (v === max) return "best";
        if (v === min) return "worst";
        return "neutral";
    });
}

// ==================== КОМПОНЕНТЫ ====================

function UniversityHeaderContent({ university }: { university: { id: string; name: string } }) {
    return (
        <div className="flex items-start justify-between gap-3 min-w-[200px]">
            <h3 className="text-sm font-bold text-gray-900 leading-snug">{university.name}</h3>
        </div>
    );
}

interface MetricRowProps {
    label: string;
    items: Array<{ id: string; value: string; status?: "best" | "worst" | "neutral" }>;
    isNeutralIcon?: boolean;
}

function MetricRow({ label, items, isNeutralIcon = false }: MetricRowProps) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="p-6 font-semibold text-gray-900">{label}</td>
            {items.map((item) => (
                <td key={item.id} className="p-6">
                    <div className="flex items-center gap-2">
                        {isNeutralIcon || item.status === "neutral" ? (
                            <MinusCircle className="h-5 w-5 text-gray-400 shrink-0" />
                        ) : item.status === "worst" ? (
                            <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                        )}
                        <span
                            className={
                                item.status === "best"
                                    ? "font-bold text-emerald-700"
                                    : item.status === "worst"
                                        ? "font-semibold text-rose-600"
                                        : "text-gray-700"
                            }
                        >
                            {item.value}
                        </span>
                    </div>
                </td>
            ))}
        </tr>
    );
}

function ActionCell({ universityId }: { universityId: string }) {
    return (
        <td className="p-6 align-bottom">
            <div className="flex flex-col gap-3">
                <button className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    <Bookmark className="h-4 w-4" />
                    Save Comparison
                </button>
                <Link
                    href={`/universities/${universityId}`}
                    className="inline-flex items-center justify-center rounded-xl bg-[rgb(2,76,209)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                    Apply Now
                </Link>
            </div>
        </td>
    );
}

// ==================== ОСНОВНАЯ СТРАНИЦА ====================

export default function ComparePage() {
    const { compareList, removeFromCompare } = useCompare();

    const rawRankings = compareList.map((u) => {
        const val = u.ranking?.global || u.global_rank;
        return typeof val === "number" ? val : null;
    });

    const rawTuitions = compareList.map((u) => {
        const val = u.tuition?.bachelor || u.tuition_fee;
        return typeof val === "number" ? val : null;
    });

    const rawAcceptances = compareList.map((u) => {
        const val = u.acceptanceRate || u.acceptance_rate;
        return typeof val === "number" ? val : null;
    });

    const rankStatuses = getRankOrCostStatuses(rawRankings);
    const tuitionStatuses = getRankOrCostStatuses(rawTuitions);
    const acceptanceStatuses = getHigherIsBetterStatuses(rawAcceptances);

    const formattedUniversities = compareList.map((uni, index) => ({
        id: uni.id || uni._id,
        name: uni.name || uni.title || "Unknown University",
        globalRanking: rawRankings[index] !== null ? `#${rawRankings[index]}` : "N/A",
        rankStatus: rankStatuses[index],
        location: uni.location
            ? `${uni.location.city || ""}, ${uni.location.country || ""}`
            : uni.city ? `${uni.city}, ${uni.country}` : "N/A",
        tuitionAnnual: rawTuitions[index] !== null ? `$${rawTuitions[index].toLocaleString()}` : "N/A",
        tuitionStatus: tuitionStatuses[index],
        acceptanceRate: rawAcceptances[index] !== null ? `${rawAcceptances[index]}%` : "N/A",
        acceptanceStatus: acceptanceStatuses[index],
        popularPrograms: Array.isArray(uni.programs) ? uni.programs.slice(0, 2).join(", ") : "N/A",
    }));

    if (formattedUniversities.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Universities Selected</h2>
                <p className="text-gray-500 mb-6">Select universities to compare their metrics side-by-side.</p>
                <Link
                    href="/universities"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Browse Universities
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">University Comparison</h1>
                    <p className="mt-1 text-sm text-gray-500">Compare key metrics between your selected universities</p>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="relative overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[768px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="w-1/4 p-6 align-bottom">
                                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Criteria</span>
                                </th>
                                {formattedUniversities.map((uni) => (
                                    <th key={uni.id} className="p-6 align-top">
                                        <div className="flex justify-between items-start gap-2">
                                            <UniversityHeaderContent university={uni} />
                                            <button
                                                onClick={() => removeFromCompare(uni.id)}
                                                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                                title="Remove from comparison"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                            <MetricRow
                                label="Global Ranking"
                                items={formattedUniversities.map((u) => ({ id: u.id, value: u.globalRanking, status: u.rankStatus as any }))}
                            />
                            <MetricRow
                                label="Location"
                                isNeutralIcon
                                items={formattedUniversities.map((u) => ({ id: u.id, value: u.location }))}
                            />
                            <MetricRow
                                label="Tuition (Annual)"
                                items={formattedUniversities.map((u) => ({ id: u.id, value: u.tuitionAnnual, status: u.tuitionStatus as any }))}
                            />
                            <MetricRow
                                label="Acceptance Rate"
                                items={formattedUniversities.map((u) => ({ id: u.id, value: u.acceptanceRate, status: u.acceptanceStatus as any }))}
                            />
                            <MetricRow
                                label="Popular Programs"
                                isNeutralIcon
                                items={formattedUniversities.map((u) => ({ id: u.id, value: u.popularPrograms }))}
                            />

                            <tr>
                                <td className="p-6"></td>
                                {formattedUniversities.map((uni) => (
                                    <ActionCell key={uni.id} universityId={uni.id} />
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <Link
                    href="/universities"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Compare More Universities
                </Link>
            </div>
        </div>
    );
}