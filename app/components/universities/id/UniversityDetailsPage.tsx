'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Scale, Loader2 } from 'lucide-react';

import HeaderSection from './HeaderSection';
import EligibilityCard from './EligibilityCard';
import RequirementsCard from './RequirementsCard';
import StatsCard from './StatsCard';
import ProgramsCard from './ProgramsCard';
import CostsCard from './CostsCard';
import DeadlinesCard from './DeadlinesCard';

interface UserProfile {
    gpa: number;
    sat: number;
    englishTest: {
        type: string;
        score: number;
    };
}

export default function UniversityDetailsPage({ university }: { university: any }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Загружаем данные пользователя из твоего API
    useEffect(() => {
        async function fetchUserData() {
            try {
                const res = await fetch('/api/auth/self');
                const data = await res.json();
                if (data.success && data.user?.profile) {
                    setUserProfile({
                        gpa: data.user.profile.gpa ?? 0,
                        sat: data.user.profile.sat ?? 0,
                        englishTest: {
                            type: data.user.profile.englishTest?.type || 'IELTS',
                            score: data.user.profile.englishTest?.score ?? 0,
                        },
                    });
                }
            } catch (err) {
                console.error('Failed to load user profile:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    // Базовые переменные университета
    const name = university?.name || university?.title || 'Unknown University';
    const location = university?.location
        ? `${university.location.city || ''}, ${university.location.country || ''}`
        : university?.city ? `${university.city}, ${university.country}` : 'Unknown Location';

    const rank = university?.ranking?.global || university?.global_rank || 'N/A';
    const type = university?.type || university?.ownership || 'N/A';
    const desc = university?.description || university?.overview || '';
    const acceptanceRate = university?.acceptanceRate || university?.acceptance_rate || 50;

    const reqs = university?.admissionRequirements || university?.requirements || {};
    const minGpa = reqs?.gpa?.min ?? reqs?.min_gpa ?? 0;
    const minToefl = reqs?.toefl?.min ?? reqs?.min_toefl ?? 0;
    const minIelts = reqs?.ielts?.min ?? reqs?.min_ielts ?? 0;
    const minSat = reqs?.sat?.min ?? reqs?.min_sat ?? 0;

    const tuition = university?.tuition?.bachelor || university?.tuition_fee || 0;
    const livingMin = university?.livingCostUSD?.min || university?.living_cost_min || 0;
    const livingMax = university?.livingCostUSD?.max || university?.living_cost_max || 0;
    const avgLiving = (livingMin + livingMax) / 2;
    const totalCost = tuition + avgLiving;

    const programs = university?.programs || university?.majors || [];
    const deadlines = university?.applicationDeadlines || university?.deadlines || [];

    // ----------------------------------------------------
    // Алгоритм расчёта Eligibility & Chances
    // ----------------------------------------------------
    const calculateScores = () => {
        if (!userProfile) return { eligibilityScore: 0, chancesScore: 0 };

        let metCriteria = 0;
        let totalCriteria = 0;

        // GPA Check
        if (minGpa > 0) {
            totalCriteria++;
            if (userProfile.gpa >= minGpa) metCriteria++;
        }

        // English Test Check (IELTS/TOEFL)
        if (minIelts > 0 || minToefl > 0) {
            totalCriteria++;
            if (userProfile.englishTest.score >= minIelts) metCriteria++;
        }

        // SAT Check
        if (minSat > 0) {
            totalCriteria++;
            if (userProfile.sat >= minSat) metCriteria++;
        }

        const eligibilityScore = totalCriteria > 0
            ? Math.round((metCriteria / totalCriteria) * 100)
            : 100;

        // Chances Score (учитываем процент поступающих + насколько оценки выше минималок)
        let extraPoints = 0;
        if (minGpa > 0 && userProfile.gpa >= minGpa) extraPoints += 15;
        if (minSat > 0 && userProfile.sat >= minSat) extraPoints += 15;
        if (minIelts > 0 && userProfile.englishTest.score >= minIelts) extraPoints += 10;

        const baseAcceptance = typeof acceptanceRate === 'number' ? acceptanceRate : 30;
        const chancesScore = Math.min(95, Math.max(10, Math.round(baseAcceptance * 0.5 + extraPoints + (eligibilityScore * 0.3))));

        return { eligibilityScore, chancesScore };
    };

    const { eligibilityScore, chancesScore } = calculateScores();

    // Дефолтный профиль на случай ожидания или если юзер не авторизован
    const currentProfile = userProfile || {
        gpa: 0,
        sat: 0,
        englishTest: { type: 'IELTS', score: 0 }
    };

    return (
        <div className="min-h-screen bg-[rgb(246,247,251)] p-4 md:p-8 font-sans">
            <div className="mx-auto max-w-7xl">

                {/* Navigation Bar */}
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

                {/* Header Section с живыми баллами */}
                <HeaderSection
                    name={name}
                    location={location}
                    rank={rank}
                    type={type}
                    desc={desc}
                    website={university?.website}
                    eligibilityScore={loading ? 0 : eligibilityScore}
                    chancesScore={loading ? 0 : chancesScore}
                />

                {/* Основная сетка карточек */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <EligibilityCard
                        userProfile={{
                            gpa: currentProfile.gpa,
                            ielts: currentProfile.englishTest.score,
                            sat: currentProfile.sat,
                        }}
                        minGpa={minGpa || 'N/A'}
                        minToefl={minToefl || 'N/A'}
                        minIelts={minIelts || 'N/A'}
                        minSat={minSat || 'N/A'}
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