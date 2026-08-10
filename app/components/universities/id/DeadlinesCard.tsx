'use client';

import React from 'react';

interface Deadline {
    round: string;
    date: string | Date;
}

interface DeadlinesCardProps {
    deadlines: Deadline[];
}

export default function DeadlinesCard({ deadlines }: DeadlinesCardProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-3">
            <h3 className="mb-5 text-sm font-bold text-slate-900">Application Deadlines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deadlines.length > 0 ? (
                    deadlines.map((dl, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{dl.round}</p>
                                    <p className="text-[10px] text-slate-500">
                                        {new Date(dl.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                                Upcoming
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-slate-500">No deadlines available.</p>
                )}
            </div>
        </div>
    );
}