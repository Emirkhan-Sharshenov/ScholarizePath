"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    iconBg: string;
    iconColor: string;
    trend?: string; // e.g. "+12% this month" — optional
    loading?: boolean;
    children: React.ReactNode;
}

export default function StatCard({ title, value, iconBg, iconColor, trend, loading, children }: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            {/* Subtle decorative glow */}
            <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${iconBg} opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-50`} />

            <div className="relative flex items-start justify-between">
                <div className={`rounded-xl p-2.5 ${iconBg} ${iconColor}`}>
                    {children}
                </div>
                {trend && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600">
                        <ArrowUpRight className="h-3 w-3" />
                        {trend}
                    </span>
                )}
            </div>

            <div className="relative mt-4">
                <span className="text-xs font-semibold text-slate-500">{title}</span>
                {loading ? (
                    <div className="mt-2 h-7 w-16 animate-pulse rounded-md bg-slate-100" />
                ) : (
                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
                )}
            </div>
        </div>
    );
}