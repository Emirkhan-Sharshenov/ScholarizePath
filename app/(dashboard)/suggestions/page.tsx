"use client"

import BugReportCard from '@/components/suggestions/BugReportCard';
import SuggestionCard from '@/components/suggestions/SuggestionCard';

export default function FeedbackPage() {
    return (
        <main className="min-h-screen bg-[rgb(246,247,251)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between">
            <div className="max-w-6xl w-full mx-auto space-y-8">
                <div className="text-left">
                    <h1 className="text-3xl  text-slate-900">
                        Report a Bug & Suggestions
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    <BugReportCard />
                    <SuggestionCard />
                </div>
            </div>

            <footer className="mt-12 text-center text-sm font-medium text-slate-500">
                Thank you for helping us improve!
            </footer>
        </main>
    );
}