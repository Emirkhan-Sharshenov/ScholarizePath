"use client";

import React, { useEffect, useState } from "react";
import { UserPlus, GraduationCap, University, Clock } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";

interface ActivityItem {
    action: string;
    name: string;
    detail: string;
    time: string;
}

const ACTION_STYLES: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    "User Registration": { icon: UserPlus, bg: "bg-blue-50", color: "text-blue-600" },
    "University Added": { icon: University, bg: "bg-emerald-50", color: "text-emerald-600" },
    "University Updated": { icon: University, bg: "bg-amber-50", color: "text-amber-600" },
    "Scholarship Added": { icon: GraduationCap, bg: "bg-violet-50", color: "text-violet-600" },
    "Scholarship Updated": { icon: GraduationCap, bg: "bg-amber-50", color: "text-amber-600" },
};

export default function RecentActivities() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            try {
                const res = await fetch("/api/admin/recent-activity");
                const json = await res.json();
                if (json.success) setActivities(json.activities);
            } catch (err) {
                console.error("Failed to load recent activity:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchActivities();
    }, []);

    return (
        <div className="rounded-2xl border border-slate-100/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
                <Clock className="h-4 w-4 text-slate-300" />
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="h-9 w-9 rounded-xl bg-slate-100" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 w-1/3 rounded bg-slate-100" />
                                <div className="h-2.5 w-1/4 rounded bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No recent activity yet.</p>
            ) : (
                <div className="divide-y divide-slate-100">
                    {activities.map((item, index) => {
                        const style = ACTION_STYLES[item.action] ?? {
                            icon: Clock,
                            bg: "bg-slate-50",
                            color: "text-slate-500",
                        };
                        const Icon = style.icon;

                        return (
                            <div key={index} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-slate-900">
                                        {item.action}
                                        <span className="font-normal text-slate-500"> · {item.name}</span>
                                    </p>
                                    <p className="text-[11px] text-slate-400">{item.detail}</p>
                                </div>
                                <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-slate-400">
                                    {timeAgo(item.time)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}