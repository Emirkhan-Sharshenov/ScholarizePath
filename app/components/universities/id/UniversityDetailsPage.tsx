'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Scale, Loader2, Plus, Check } from 'lucide-react';
import { useCompare } from '@/lib/useCompare';
import { useFavorites } from '@/lib/useFavorites';
import { useUniList } from '@/lib/useUniList';

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

interface UniversityDetailsPageProps {
    university: any;
    onAddToList?: () => void;
}

export default function UniversityDetailsPage({ university, onAddToList }: UniversityDetailsPageProps) {
    const router = useRouter();
    const { addToCompare, compareList } = useCompare();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Extract variables inside component body
    const uniId = university?._id || university?.id;
    const name = university?.name || university?.title || 'Unknown University';

    // Call hooks inside component body
    const { toggleInList, isInList } = useUniList();
    const { isFavorite, toggleFavorite } = useFavorites(uniId, 'university');

    const inList = isInList(String(uniId || ''), 'university');
    const isCompared = compareList.some((item) => (item.id || item._id) === uniId);

    const handleAddToList = () => {
        if (!uniId) return;
        toggleInList(String(uniId), 'university', name);
        if (onAddToList) onAddToList();
    };

    const handleCompareClick = () => {
        if (university) {
            addToCompare(university);
            router.push('/compare');
        }
    };

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

    const calculateScores = () => {
        if (!userProfile) return { eligibilityScore: 0, chancesScore: 0 };

        let metCriteria = 0;
        let totalCriteria = 0;

        if (minGpa > 0) {
            totalCriteria++;
            if (userProfile.gpa >= minGpa) metCriteria++;
        }

        if (minIelts > 0 || minToefl > 0) {
            totalCriteria++;
            if (userProfile.englishTest.score >= minIelts) metCriteria++;
        }

        if (minSat > 0) {
            totalCriteria++;
            if (userProfile.sat >= minSat) metCriteria++;
        }

        const eligibilityScore = totalCriteria > 0
            ? Math.round((metCriteria / totalCriteria) * 100)
            : 100;

        let extraPoints = 0;
        if (minGpa > 0 && userProfile.gpa >= minGpa) extraPoints += 15;
        if (minSat > 0 && userProfile.sat >= minSat) extraPoints += 15;
        if (minIelts > 0 && userProfile.englishTest.score >= minIelts) extraPoints += 10;

        const baseAcceptance = typeof acceptanceRate === 'number' ? acceptanceRate : 30;
        const chancesScore = Math.min(95, Math.max(10, Math.round(baseAcceptance * 0.5 + extraPoints + (eligibilityScore * 0.3))));

        return { eligibilityScore, chancesScore };
    };

    const { eligibilityScore, chancesScore } = calculateScores();

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

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Add to List Button */}
                        <button
                            type="button"
                            onClick={handleAddToList}
                            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 ${inList
                                    ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4 text-slate-500" />}
                            <span>{inList ? 'Added to List' : 'Add to List'}</span>
                        </button>

                        {/* Favorite Button */}
                        <button
                            type="button"
                            onClick={toggleFavorite}
                            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 ${isFavorite
                                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                            <span>{isFavorite ? 'Saved' : 'Save'}</span>
                        </button>

                        {/* Compare Button */}
                        <button
                            onClick={handleCompareClick}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 ${isCompared
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            <Scale className="h-4 w-4" />
                            <span>{isCompared ? 'In Comparison' : 'Compare'}</span>
                        </button>
                    </div>
                </div>

                {/* Header Section */}
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

                {/* Cards Grid */}
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