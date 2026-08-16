"use client";

import React, { useEffect, useState } from "react";
import { Scholarship } from "@/types/scholarship";
import { ScholarshipBreadcrumbsHeader } from "./ScholarshipBreadcrumbsHeader";
import { ScholarshipHeroBanner } from "./ScholarshipHeroBanner";
import { EligibilityChecker } from "./EligibilityChecker";
import { EligibilityCriteriaList } from "./EligibilityCriteriaList";
import { ApplySidebarCard } from "./ApplySidebarCard";
import { useScholarshipCompare } from "@/lib/useScholarshipCompare";

export default function ScholarshipDetailsPage({ scholarship }: { scholarship: Scholarship }) {
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Используем отдельное хранилище для стипендий
    const { compareList, addToCompare, removeFromCompare } = useScholarshipCompare();

    const currentId = scholarship?.id || scholarship?._id;
    const isCompared = compareList.some((item) => (item.id || item._id) === currentId);

    const handleToggleCompare = () => {
        if (!scholarship) return;
        if (isCompared) {
            removeFromCompare(currentId);
        } else {
            addToCompare(scholarship);
        }
    };

    useEffect(() => {
        async function fetchUserData() {
            try {
                const res = await fetch("/api/auth/self");
                const data = await res.json();
                if (data.success && data.user?.profile) {
                    setUserProfile(data.user.profile);
                }
            } catch (err) {
                console.error("Failed to load user profile:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUserData();
    }, []);

    const officialSite = scholarship?.officialWebsite || scholarship?.applicationLink || "#";

    return (
        <div className="min-h-screen bg-[rgb(246,247,251)] p-4 font-sans md:p-8 text-slate-800">
            <div className="mx-auto max-w-7xl">
                <ScholarshipBreadcrumbsHeader
                    title={scholarship?.scholarshipName || "Scholarship Details"}
                    isCompared={isCompared}
                    onToggleCompare={handleToggleCompare}
                />

                <ScholarshipHeroBanner scholarship={scholarship} />

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
            </div>
        </div>
    );
}