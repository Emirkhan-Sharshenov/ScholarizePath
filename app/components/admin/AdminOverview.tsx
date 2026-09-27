"use client";

import { useEffect, useState } from "react";

import {
    Users,
    University,
    GraduationCap,
    Sparkles,
} from "lucide-react";

import StatCard from "./StatCard";
import RecentActivities from "./RecentActivities";
import UserGrowthChart from "./UserGrowthChart";
import AdminFeedback from "./AdminFeedback";

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

                if (json.success) {
                    setStats(json.stats);
                }
            } catch (err) {
                console.error("Failed to load admin stats:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-5 md:space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                <StatCard
                    title="Total users"
                    value={stats ? stats.totalUsers : "—"}
                    loading={loading}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                >
                    <Users className="h-5 w-5" />
                </StatCard>

                <StatCard
                    title="Universities"
                    value={stats ? stats.totalUniversities : "—"}
                    loading={loading}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                >
                    <University className="h-5 w-5" />
                </StatCard>

                <StatCard
                    title="Scholarships"
                    value={stats ? stats.totalScholarships : "—"}
                    loading={loading}
                    iconBg="bg-violet-50"
                    iconColor="text-violet-600"
                >
                    <GraduationCap className="h-5 w-5" />
                </StatCard>

                <StatCard
                    title="Open scholarships"
                    value={stats ? stats.openScholarships : "—"}
                    loading={loading}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                >
                    <Sparkles className="h-5 w-5" />
                </StatCard>
            </div>

            <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <UserGrowthChart />
                </div>
                <div className="lg:col-span-4">
                    <RecentActivities />
                </div>
            </div>

            {/* Feedback */}
            <AdminFeedback />
        </div>
    );
}