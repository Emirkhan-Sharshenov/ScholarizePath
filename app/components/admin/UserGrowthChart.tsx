"use client";

import React, { useEffect, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp } from "lucide-react";

interface GrowthPoint {
    date: string;
    count: number;
}

const RANGES = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "All", value: "all" },
] as const;

function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-semibold text-slate-900">{formatDateLabel(label)}</p>
            <p className="mt-0.5 text-blue-600">
                {payload[0].value} new user{payload[0].value === 1 ? "" : "s"}
            </p>
        </div>
    );
}

export default function UserGrowthChart() {
    const [range, setRange] = useState<(typeof RANGES)[number]["value"]>("30d");
    const [data, setData] = useState<GrowthPoint[]>([]);
    const [totalInRange, setTotalInRange] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGrowth() {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/user-growth?range=${range}`);
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                    setTotalInRange(json.totalInRange);
                }
            } catch (err) {
                console.error("Failed to load user growth:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchGrowth();
    }, [range]);

    return (
        <div className="rounded-2xl border border-slate-100/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">User Growth</h3>
                    <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            {loading ? "—" : totalInRange}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                            <TrendingUp className="h-3 w-3" />
                            new signups
                        </span>
                    </div>
                </div>

                <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                    {RANGES.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => setRange(r.value)}
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${range === r.value
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex h-56 items-center justify-center">
                    <div className="h-full w-full animate-pulse rounded-xl bg-slate-50" />
                </div>
            ) : data.every((d) => d.count === 0) ? (
                <div className="flex h-56 flex-col items-center justify-center gap-2 text-slate-300">
                    <Users className="h-8 w-8" />
                    <p className="text-xs font-medium text-slate-400">No registrations in this range yet</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={224}>
                    <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <defs>
                            <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDateLabel}
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                            minTickGap={40}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                            width={28}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#2563eb"
                            strokeWidth={2}
                            fill="url(#userGrowthGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}