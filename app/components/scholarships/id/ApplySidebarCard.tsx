'use client';

import React from 'react';
import { ArrowRight, ExternalLink, Lightbulb, ChevronRight } from 'lucide-react';

export function ApplySidebarCard({ applyUrl }: { applyUrl: string }) {
    return (
        <div className="space-y-6">
            {/* Карточка подачи */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <span className="text-xl">📄</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">Ready to apply?</h3>
                <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                    You have a high chance of qualifying for this scholarship.
                </p>

                <div className="mt-6 space-y-2.5">
                    <a
                        href={applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-98"
                    >
                        Apply Now <ArrowRight className="h-4 w-4" />
                    </a>

                    <a
                        href={applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-98"
                    >
                        Visit Official Website <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </a>
                </div>
            </div>

            {/* Подсказки */}
            <div className="rounded-2xl border border-slate-200/80 bg-amber-50/40 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    Application Tips
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Make sure to review all requirements and submit a strong application.
                </p>
                <button className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition">
                    View Tips <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}