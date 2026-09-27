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
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-5">
            {/* Subtle decorative glow */}
            <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${iconBg} opacity-30 blur-2xl transition-opacity duration-300 group-hover:opacity-50`} />

            <div className="relative flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
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
                <span className="text-sm font-medium text-slate-500">{title}</span>
                {loading ? (
                    <div className="mt-2 h-7 w-16 animate-pulse rounded-md bg-slate-100" />
                ) : (
                    <p className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{typeof value === "number" ? value.toLocaleString("en-US") : value}</p>
                )}
            </div>
        </div>
    );
}