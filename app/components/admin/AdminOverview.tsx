"use client";

import React, { useEffect, useState } from "react";
import { Users, University, GraduationCap, Sparkles } from "lucide-react";
import StatCard from "./StatCard";
import RecentActivities from "./RecentActivities";
import UserGrowthChart from "./UserGrowthChart";

interface Stats {
    totalUsers: number;
    totalUniversities: number;
    totalScholarships: number;
    openScholarships: number;
}

export default function AdminOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/stats");
                const json = await res.json();
                if (json.success) setStats(json.stats);
            } catch (err) {
                console.error("Failed to load admin stats:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="space-y-6 min-h-screen bg-[rgb(246,247,251)] ">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers ?? 0}
                    loading={loading}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                >
                    <Users className="h-5 w-5" />
                </StatCard>

                <StatCard
                    title="Universities"
                    value={stats?.totalUniversities ?? 0}
                    loading={loading}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                >
                    <University className="h-5 w-5" />
                </StatCard>

                <StatCard
                    title="Scholarships"
                    value={stats?.totalScholarships ?? 0}
                    loading={loading}
                    iconBg="bg-violet-50"
                    iconColor="text-violet-600"
                >
                    <GraduationCap className="h-5 w-5" />
                </StatCard>

                <StatCard
                    title="Open Scholarships"
                    value={stats?.openScholarships ?? 0}
                    loading={loading}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                >
                    <Sparkles className="h-5 w-5" />
                </StatCard>
            </div>
                <div className="lg:col-span-2">
                    <UserGrowthChart />
                </div>
            <RecentActivities />
        </div>
    );
}