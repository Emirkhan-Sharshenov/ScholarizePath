'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Scale } from 'lucide-react';

import HeaderSection from './HeaderSection';
import EligibilityCard from './EligibilityCard';
import RequirementsCard from './RequirementsCard';
import StatsCard from './StatsCard';
import ProgramsCard from './ProgramsCard';
import CostsCard from './CostsCard';
import DeadlinesCard from './DeadlinesCard';

export default function UniversityDetailsPage({ university }: { university: any }) {
    const name = university?.name || university?.title || 'Unknown University';
    const location = university?.location
        ? `${university.location.city || ''}, ${university.location.country || ''}`
        : university?.city ? `${university.city}, ${university.country}` : 'Unknown Location';

    const rank = university?.ranking?.global || university?.global_rank || 'N/A';
    const type = university?.type || university?.ownership || 'N/A';
    const desc = university?.description || university?.overview || '';
    const acceptanceRate = university?.acceptanceRate || university?.acceptance_rate || 'N/A';

    const reqs = university?.admissionRequirements || university?.requirements || {};
    const minGpa = reqs?.gpa?.min ?? reqs?.min_gpa ?? 'N/A';
    const minToefl = reqs?.toefl?.min ?? reqs?.min_toefl ?? 'N/A';
    const minIelts = reqs?.ielts?.min ?? reqs?.min_ielts ?? 'N/A';
    const minSat = reqs?.sat?.min ?? reqs?.min_sat ?? 'N/A';

    const tuition = university?.tuition?.bachelor || university?.tuition_fee || 0;
    const livingMin = university?.livingCostUSD?.min || university?.living_cost_min || 0;
    const livingMax = university?.livingCostUSD?.max || university?.living_cost_max || 0;
    const avgLiving = (livingMin + livingMax) / 2;
    const totalCost = tuition + avgLiving;

    const programs = university?.programs || university?.majors || [];
    const deadlines = university?.applicationDeadlines || university?.deadlines || [];

    return (
        <div className="min-h-screen bg-[rgb(246,247,251)]  p-4 md:p-8 font-sans">
            <div className="mx-auto max-w-7xl">

                {/* НАВИГАЦИОННАЯ ПАНЕЛЬ С КНОПКОЙ НАЗАД */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href="/universities"
                        className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 active:scale-95"
                    >
                        <ArrowLeft className="h-4 w-4 text-slate-500 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-blue-600" />
                        <span>Universities</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 active:scale-95">
                            <Heart className="h-4 w-4 text-slate-400" />
                        </button>
                        <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 active:scale-95">
                            <Scale className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <HeaderSection
                    name={name}
                    location={location}
                    rank={rank}
                    type={type}
                    desc={desc}
                    website={university?.website}
                    eligibilityScore={78}
                    chancesScore={65}
                />

                {/* ОСНОВНАЯ СЕТКА КАРТОЧЕК */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <EligibilityCard
                        userProfile={{ gpa: 3.8, ielts: 7.5, sat: 1450 }}
                        minGpa={minGpa}
                        minToefl={minToefl}
                        minIelts={minIelts}
                        minSat={minSat}
                    />
                    <RequirementsCard />
                    <StatsCard
                        acceptanceRate={acceptanceRate}
                        totalStudents={university?.students?.total || university?.total_students}
                        internationalStudents={university?.students?.international || university?.intl_students}
                    />
                    <ProgramsCard programs={programs} />
                    <CostsCard tuition={tuition} avgLiving={avgLiving} totalCost={totalCost} />
                    <DeadlinesCard deadlines={deadlines} />
                </div>

            </div>
        </div>
    );
}