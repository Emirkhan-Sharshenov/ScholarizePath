"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    XCircle,
    MapPin,
    Bookmark,
    Heart,
    Plus,
    Building2,
    Award,
    Calendar,
    GraduationCap,
    DollarSign,
} from "lucide-react";
import { useCompare } from "@/lib/useCompare";

// Извлечение строк из различных структур данных
function extractString(val: any, fallback = "N/A"): string {
    if (val === null || val === undefined) return fallback;
    if (typeof val === "string" || typeof val === "number") return String(val);
    if (Array.isArray(val)) return val.map((v) => extractString(v)).join(", ");
    if (typeof val === "object") {
        return val.name || val.title || val.global || val.bachelor || val.type || fallback;
    }
    return fallback;
}

// Парсинг числовых значений для численного сравнения
function extractNumber(val: any): number | null {
    if (typeof val === "number") return val;
    if (!val) return null;
    if (typeof val === "object") {
        const numVal = val.global ?? val.bachelor ?? val.min ?? val.max ?? val.estimatedValue?.max ?? null;
        if (typeof numVal === "number") return numVal;
    }
    const str = String(val).replace(/[^0-9.]/g, "");
    const parsed = parseFloat(str);
    return isNaN(parsed) ? null : parsed;
}

export default function ComparePage() {
    const {
        compareList: uniList,
        scholarshipCompareList: schList,
        removeFromCompare,
        removeFromScholarshipCompare,
    } = useCompare();

    const [activeTab, setActiveTab] = useState<"universities" | "scholarships">(
        schList.length > 0 && uniList.length === 0 ? "scholarships" : "universities"
    );

    const isUniActive = activeTab === "universities";

    // --- УНИВЕРСИТЕТЫ: Расчет лучших параметров ---
    const parsedRankings = uniList.map((u) => extractNumber(u.ranking));
    const validRankings = parsedRankings.filter((v): v is number => v !== null);
    const minRanking = validRankings.length > 0 ? Math.min(...validRankings) : null;

    const parsedTuitions = uniList.map((u) => extractNumber(u.tuition));
    const validTuitions = parsedTuitions.filter((v): v is number => v !== null);
    const minTuition = validTuitions.length > 0 ? Math.min(...validTuitions) : null;

    const parsedAcceptance = uniList.map((u) => extractNumber(u.acceptanceRate));
    const validAcceptance = parsedAcceptance.filter((v): v is number => v !== null);
    const maxAcceptance = validAcceptance.length > 0 ? Math.max(...validAcceptance) : null;

    // --- СТИПЕНДИИ: Расчет лучших сумм ---
    const parsedAwardAmounts = schList.map((s) => extractNumber(s.award?.estimatedValue?.max || s.amount || s.award));
    const validAmounts = parsedAwardAmounts.filter((v): v is number => v !== null);
    const maxAwardAmount = validAmounts.length > 0 ? Math.max(...validAmounts) : null;

    // --- ФОРМАТИРОВАНИЕ УНИВЕРСИТЕТОВ ---
    const formattedUniversities = uniList.map((uni, idx) => {
        const rankingNum = parsedRankings[idx];
        const tuitionNum = parsedTuitions[idx];
        const acceptanceNum = parsedAcceptance[idx];

        const locationText =
            typeof uni.location === "object" && uni.location !== null
                ? `${uni.location.city ? uni.location.city + ", " : ""}${uni.location.country || ""}`
                : extractString(uni.location, "N/A");

        let tuitionText = "Varies";
        if (typeof uni.tuition === "object" && uni.tuition !== null) {
            const currency = uni.tuition.currency || "USD";
            const val = uni.tuition.bachelor || uni.tuition.min || null;
            tuitionText = val ? `${currency} ${val.toLocaleString()}` : "Varies";
        } else if (uni.tuition) {
            tuitionText = String(uni.tuition);
        }

        const programsText = Array.isArray(uni.programs)
            ? uni.programs.slice(0, 3).join(", ")
            : extractString(uni.programs, "N/A");

        return {
            id: uni.id || uni._id,
            name: extractString(uni.name || uni.universityName, "University"),
            logo: uni.images?.logo || uni.logo || null,
            ranking: rankingNum !== null ? `#${rankingNum}` : extractString(uni.ranking, "N/A"),
            location: locationText,
            tuition: tuitionText,
            acceptanceRate: acceptanceNum !== null ? `${acceptanceNum}%` : extractString(uni.acceptanceRate, "N/A"),
            programs: programsText,
            applyUrl: uni.applicationLink || uni.website || "#",
            isBestRanking: minRanking !== null && rankingNum === minRanking,
            isBestTuition: minTuition !== null && tuitionNum === minTuition,
            isBestAcceptance: maxAcceptance !== null && acceptanceNum === maxAcceptance,
        };
    });

    // --- ФОРМАТИРОВАНИЕ СТИПЕНДИЙ ---
    const formattedScholarships = schList.map((sch, idx) => {
        const coverage = sch.award?.type
            ? extractString(sch.award.type)
            : extractString(sch.coverageType, "Fully Funded");

        const isFullyFunded = coverage.toLowerCase().includes("fully funded") || coverage.toLowerCase().includes("full");

        const amountNum = parsedAwardAmounts[idx];
        const amountDetail = sch.award?.estimatedValue?.max
            ? `$${sch.award.estimatedValue.max.toLocaleString()} USD / year`
            : isFullyFunded
                ? "Full Tuition + Living Expenses"
                : extractString(sch.amount || sch.award, "Varies");

        const isBestAward = (maxAwardAmount !== null && amountNum === maxAwardAmount) || isFullyFunded;

        return {
            id: sch.id || sch._id,
            name: extractString(sch.scholarshipName || sch.title, "Scholarship"),
            logo: sch.logo || null,
            provider: extractString(sch.provider || sch.fundingOrganization, "N/A"),
            location: extractString(sch.country || sch.location, "Global"),
            coverage: coverage,
            amountDetail: amountDetail,
            degree: extractString(sch.studyLevel || sch.degreeLevel, "All Levels"),
            deadline: Array.isArray(sch.deadlines) && sch.deadlines.length > 0
                ? extractString(sch.deadlines[0]?.date, "Varies")
                : extractString(sch.deadline, "Varies"),
            applyUrl: sch.officialWebsite || sch.applicationLink || "#",
            isBestCoverage: isFullyFunded,
            isBestAward: isBestAward,
        };
    });

    const items = isUniActive ? formattedUniversities : formattedScholarships;

    return (
        <div className="min-h-screen bg-[rgb(246,247,251)] p-4 font-sans md:p-8 text-slate-800">
            <div className="mx-auto max-w-7xl">
                {/* Header & Tabs */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isUniActive ? "University Comparison" : "Scholarship Comparison"}
                        </h1>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                            {isUniActive
                                ? "Compare ranking, location, tuition, acceptance rate, and programs"
                                : "Compare financial awards, eligibility, and deadlines"}
                        </p>
                    </div>

                    <div className="inline-flex rounded-xl bg-slate-200/70 p-1 w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab("universities")}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${isUniActive
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Building2 className="h-4 w-4" />
                            Universities ({uniList.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("scholarships")}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${!isUniActive
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            <Award className="h-4 w-4" />
                            Scholarships ({schList.length})
                        </button>
                    </div>
                </div>

                {/* Empty State */}
                {items.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <h3 className="mb-2 text-lg font-bold text-slate-900">
                            No {isUniActive ? "universities" : "scholarships"} to compare
                        </h3>
                        <Link
                            href={isUniActive ? "/universities" : "/scholarships"}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                            Browse {isUniActive ? "Universities" : "Scholarships"}
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* 1. MOBILE VIEW (Вид карточек для маленьких экранов) */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {items.map((item: any) => (
                                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative">
                                    {/* Header карточки */}
                                    <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden p-1 shadow-sm shrink-0">
                                                {item.logo ? (
                                                    <img src={item.logo} alt={item.name} className="h-full w-full object-contain" />
                                                ) : isUniActive ? (
                                                    <Building2 className="h-6 w-6 text-slate-400" />
                                                ) : (
                                                    <Award className="h-6 w-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h3>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                    <MapPin className="h-3 w-3 shrink-0" />
                                                    <span>{item.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="text-slate-400 hover:text-red-500 transition p-1">
                                                <Heart className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    isUniActive
                                                        ? removeFromCompare(item.id)
                                                        : removeFromScholarshipCompare(item.id)
                                                }
                                                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>

                                    {/* Список параметров */}
                                    <div className="space-y-3 text-xs">
                                        {isUniActive ? (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Global Ranking</span>
                                                    <div className="flex items-center gap-1.5 font-semibold">
                                                        {item.isBestRanking ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                                                        <span>{item.ranking}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Tuition (Annual)</span>
                                                    <div className="flex items-center gap-1.5 font-semibold">
                                                        {item.isBestTuition ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                                                        <span>{item.tuition}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Acceptance Rate</span>
                                                    <div className="flex items-center gap-1.5 font-semibold">
                                                        {item.isBestAcceptance ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                                                        <span>{item.acceptanceRate}</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-slate-50">
                                                    <span className="text-slate-500 font-medium block mb-1">Popular Programs</span>
                                                    <span className="font-semibold text-slate-700">{item.programs}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Provider</span>
                                                    <span className="font-semibold">{item.provider}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Coverage Type</span>
                                                    <div className="flex items-center gap-1.5 font-semibold">
                                                        {item.isBestCoverage ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Award className="h-4 w-4 text-slate-400" />}
                                                        <span className={item.isBestCoverage ? "text-emerald-700" : ""}>{item.coverage}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Award Details</span>
                                                    <div className="flex items-center gap-1.5 font-semibold">
                                                        {item.isBestAward ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <DollarSign className="h-4 w-4 text-slate-400" />}
                                                        <span className={item.isBestAward ? "text-emerald-700" : ""}>{item.amountDetail}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Degree Level</span>
                                                    <span className="font-semibold">{item.degree}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">Deadline</span>
                                                    <span className="font-semibold">{item.deadline}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Экшены */}
                                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                                        <button className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50">
                                            <Bookmark className="h-3.5 w-3.5" />
                                            Save
                                        </button>
                                        <a
                                            href={item.applyUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
                                        >
                                            Apply Now
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. DESKTOP VIEW (Таблица сравнения для экранов md и выше) */}
                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div
                                className="grid min-w-[700px] divide-y divide-slate-100"
                                style={{
                                    gridTemplateColumns: `220px repeat(${items.length}, minmax(240px, 1fr))`,
                                }}
                            >
                                {/* РЯД 1: Шапка / Название */}
                                <div className="bg-slate-50/50 p-6 flex items-end text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Metrics
                                </div>
                                {items.map((item: any) => (
                                    <div key={item.id} className="p-6 relative flex flex-col justify-between border-l border-slate-100 min-h-[140px]">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="h-10 w-10 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden p-1 shadow-sm">
                                                {item.logo ? (
                                                    <img src={item.logo} alt={item.name} className="h-full w-full object-contain" />
                                                ) : isUniActive ? (
                                                    <Building2 className="h-5 w-5 text-slate-400" />
                                                ) : (
                                                    <Award className="h-5 w-5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="text-slate-400 hover:text-red-500 transition">
                                                    <Heart className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        isUniActive
                                                            ? removeFromCompare(item.id)
                                                            : removeFromScholarshipCompare(item.id)
                                                    }
                                                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{item.name}</h3>
                                    </div>
                                ))}

                                {/* РЯД 2: Global Ranking / Provider */}
                                <div className="p-4 bg-slate-50/50 text-xs font-semibold text-slate-600 flex items-center">
                                    {isUniActive ? "Global Ranking" : "Provider / Organization"}
                                </div>
                                {items.map((item: any) => (
                                    <div key={item.id} className="p-4 border-l border-slate-100 text-xs font-medium flex items-center gap-2">
                                        {isUniActive ? (
                                            <>
                                                {item.isBestRanking ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                                                )}
                                                <span>{item.ranking}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>{item.provider}</span>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/* РЯД 3: Location */}
                                <div className="p-4 bg-slate-50/50 text-xs font-semibold text-slate-600 flex items-center">
                                    Location
                                </div>
                                {items.map((item: any) => (
                                    <div key={item.id} className="p-4 border-l border-slate-100 text-xs font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span>{item.location}</span>
                                    </div>
                                ))}

                                {/* РЯД 4: Tuition / Coverage Type */}
                                <div className="p-4 bg-slate-50/50 text-xs font-semibold text-slate-600 flex items-center">
                                    {isUniActive ? "Tuition (Annual)" : "Coverage Type"}
                                </div>
                                {items.map((item: any) => (
                                    <div key={item.id} className="p-4 border-l border-slate-100 text-xs font-medium flex items-center gap-2">
                                        {isUniActive ? (
                                            <>
                                                {item.isBestTuition ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                                                )}
                                                <span>{item.tuition}</span>
                                            </>
                                        ) : (
                                            <>
                                                {item.isBestCoverage ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <Award className="h-4 w-4 text-slate-400 shrink-0" />
                                                )}
                                                <span className={item.isBestCoverage ? "font-semibold text-emerald-700" : ""}>
                                                    {item.coverage}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/* РЯД 5: Acceptance Rate / Award Details */}
                                <div className="p-4 bg-slate-50/50 text-xs font-semibold text-slate-600 flex items-center">
                                    {isUniActive ? "Acceptance Rate" : "Award Details / Amount"}
                                </div>
                                {items.map((item: any) => (
                                    <div key={item.id} className="p-4 border-l border-slate-100 text-xs font-medium flex items-center gap-2">
                                        {isUniActive ? (
                                            <>
                                                {item.isBestAcceptance ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                                                )}
                                                <span>{item.acceptanceRate}</span>
                                            </>
                                        ) : (
                                            <>
                                                {item.isBestAward ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <DollarSign className="h-4 w-4 text-slate-400 shrink-0" />
                                                )}
                                                <span className={item.isBestAward ? "font-semibold text-emerald-700" : ""}>
                                                    {item.amountDetail}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/* РЯД 6: Popular Programs / Degree Level */}
                                <div className="p-4 bg-slate-50/50 text-xs font-semibold text-slate-600 flex items-center">
                                    {isUniActive ? "Popular Programs" : "Degree Level"}
                                </div>
                                {items.map((item: any) => (
                                    <div key={item.id} className="p-4 border-l border-slate-100 text-xs font-medium flex items-center gap-2">
                                        {isUniActive ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                                <span className="truncate" title={item.programs}>{item.programs}</span>
                                            </>
                                        ) : (
                                            <>
                                                <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>{item.degree}</span>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/* РЯД 7: Application Deadline */}
                                {!isUniActive && (
                                    <>
                                        <div className="p-4 bg-slate-50/50 text-xs font-semibold text-slate-600 flex items-center">
                                            Application Deadline
                                        </div>
                                        {items.map((item: any) => (
                                            <div key={item.id} className="p-4 border-l border-slate-100 text-xs font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                                <span>{item.deadline}</span>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* РЯД 8: Кнопки Подачи / Сохранения */}
                                <div className="p-4 bg-slate-50/50"></div>
                                {items.map((item: any) => (
                                    <div key={item.id} className="p-4 border-l border-slate-100 space-y-2">
                                        <button className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 py-1">
                                            <Bookmark className="h-3.5 w-3.5" />
                                            Save
                                        </button>
                                        <a
                                            href={item.applyUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition"
                                        >
                                            Apply Now
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <div className="mt-8 text-center">
                    <Link
                        href={isUniActive ? "/universities" : "/scholarships"}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <Plus className="h-4 w-4" />
                        Compare More {isUniActive ? "Universities" : "Scholarships"}
                    </Link>
                </div>
            </div>
        </div>
    );
}