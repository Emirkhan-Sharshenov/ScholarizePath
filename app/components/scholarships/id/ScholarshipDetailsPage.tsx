'use client';

import React, { useEffect, useState } from 'react';
import { Scholarship } from '@/types/scholarship';
import { ScholarshipBreadcrumbsHeader } from './ScholarshipBreadcrumbsHeader';
import { ScholarshipHeroBanner } from './ScholarshipHeroBanner';
import { EligibilityChecker } from './EligibilityChecker';
import { EligibilityCriteriaList } from './EligibilityCriteriaList';
import { ApplySidebarCard } from './ApplySidebarCard';
import { AboutScholarship } from './AboutScholarship';

export interface UserProfile {
    gpa: number;
    sat: number;
    nationality?: string;
    age?: number;
    degree?: string;
    fieldOfStudy?: string;
    englishTest: {
        type: string;
        score: number;
    };
}

export default function ScholarshipDetailsPage({ scholarship }: { scholarship: Scholarship }) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Загружаем данные профиля пользователя
    useEffect(() => {
        async function fetchUserData() {
            try {
                const res = await fetch('/api/auth/self');
                const data = await res.json();
                if (data.success && data.user?.profile) {
                    const prof = data.user.profile;
                    setUserProfile({
                        gpa: prof.gpa ?? 0,
                        sat: prof.sat ?? 0,
                        nationality: prof.nationality || 'International',
                        age: prof.age || 22,
                        degree: prof.degree || 'Bachelor',
                        fieldOfStudy: prof.fieldOfStudy || 'Computer Science',
                        englishTest: {
                            type: prof.englishTest?.type || 'IELTS',
                            score: prof.englishTest?.score ?? 0,
                        },
                    });
                }
            } catch (err) {
                console.error('Failed to load user profile for scholarship:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    const officialSite = scholarship?.officialWebsite || scholarship?.applicationLink || '#';

    return (
        <div className="min-h-screen bg-[rgb(246,247,251)] p-4 font-sans md:p-8 text-slate-800">
            <div className="mx-auto max-w-7xl">
                {/* Хлебные крошки */}
                <ScholarshipBreadcrumbsHeader title={scholarship?.scholarshipName || 'Scholarship Details'} />

                {/* Герой баннер с таймером и суммой */}
                <ScholarshipHeroBanner scholarship={scholarship} />

                {/* Основной контент */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <EligibilityChecker scholarship={scholarship} userProfile={userProfile} loading={loading} />
                            <EligibilityCriteriaList scholarship={scholarship} userProfile={userProfile} />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <ApplySidebarCard applyUrl={officialSite} />
                    </div>
                </div>

                {/* Описание */}
                <AboutScholarship description={scholarship?.description || 'No description provided.'} />
            </div>
        </div>
    );
}