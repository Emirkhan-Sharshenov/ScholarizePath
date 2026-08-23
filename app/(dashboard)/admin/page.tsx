import React from "react";
import AdminOverview from "@/components/admin/AdminOverview";

export default function AdminDashboardPage() {
    return (
        <main className="min-h-screen bg-[rgb(246,247,251)] p-6 font-sans md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Overview of platform activity and key metrics.
                    </p>
                </div>

                <AdminOverview />
            </div>
        </main>
    );
}