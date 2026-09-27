import React from "react";
import { ShieldCheck } from "lucide-react";
import AdminOverview from "@/components/admin/AdminOverview";

export default function AdminDashboardPage() {
    return (
        <main className="min-h-screen w-full bg-[#f7f9fc] px-4 pb-28 pt-5 font-body md:px-8 md:pb-10 md:pt-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-5 md:mb-6">
                    <h1 className="flex flex-wrap items-center gap-3 font-display text-2xl font-bold text-ink sm:text-3xl">
                        Admin
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-body text-xs font-semibold text-slate-600">
                            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" /> Admin only
                        </span>
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Platform overview and user feedback.</p>
                </div>

                <AdminOverview />
            </div>
        </main>
    );
}
