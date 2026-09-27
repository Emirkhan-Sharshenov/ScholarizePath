'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, HelpCircle, RotateCw, Sparkles, XCircle } from 'lucide-react';
import { buttonClass, DetailCard } from '@/components/common/detailUi';

type CriterionStatus = 'match' | 'partial' | 'mismatch';
type Verdict = 'high' | 'moderate' | 'low';

interface Criterion {
    label: string;
    status: CriterionStatus;
    explanation: string;
}

interface EligibilityExplanation {
    verdict: Verdict;
    summary: string;
    criteria: Criterion[];
}

interface AIEligibilityExplanationProps {
    scholarshipId: string;
    signedIn: boolean;
    className?: string;
}

const VERDICT: Record<Verdict, { label: string; className: string }> = {
    high: { label: 'High chance', className: 'bg-emerald-50 text-emerald-700' },
    moderate: { label: 'Moderate chance', className: 'bg-amber-50 text-amber-700' },
    low: { label: 'Low chance', className: 'bg-rose-50 text-rose-700' },
};

const CRITERION_ICON: Record<CriterionStatus, React.ReactNode> = {
    match: <CheckCircle2 aria-label="Meets" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />,
    partial: <HelpCircle aria-label="Partly meets" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />,
    mismatch: <XCircle aria-label="Doesn't meet" className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />,
};

export function AIEligibilityExplanation({ scholarshipId, signedIn, className }: AIEligibilityExplanationProps) {
    const [explanation, setExplanation] = useState<EligibilityExplanation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/ai/eligibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ scholarshipId }),
            });

            const data = await res.json();

            if (res.status === 429) {
                setError(data.message || "You've reached your limit for AI explanations. Try again later.");
                return;
            }

            if (!res.ok || !data.success) {
                setError(data.message || "Couldn't generate an explanation right now. Please try again.");
                return;
            }

            setExplanation({ verdict: data.verdict, summary: data.summary, criteria: data.criteria });
        } catch {
            setError("Couldn't reach the AI service. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const verdict = explanation ? VERDICT[explanation.verdict] : null;

    return (
        <DetailCard
            icon={Sparkles}
            tone="violet"
            title="AI eligibility explanation"
            subtitle="Plain-language reasons you do or don't meet each requirement"
            action={verdict && <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${verdict.className}`}>{verdict.label}</span>}
            className={className}
        >
            {isLoading ? (
                <div aria-live="polite" className="space-y-3">
                    <span className="sr-only">Generating explanation…</span>
                    <div className="h-16 animate-pulse rounded-2xl bg-violet-50" />
                    {[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />)}
                </div>
            ) : explanation && verdict ? (
                <div>
                    <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                        <span className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold sm:hidden ${verdict.className}`}>{verdict.label}</span>
                        <p className="text-sm leading-relaxed text-slate-700">{explanation.summary}</p>
                    </div>
                    <ul className="mt-4 divide-y divide-slate-100">
                        {explanation.criteria.map((c, idx) => (
                            <li key={idx} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                {CRITERION_ICON[c.status]}
                                <div className="min-w-0 text-sm">
                                    <p className="font-semibold text-ink">{c.label}</p>
                                    <p className="mt-0.5 text-slate-500">{c.explanation}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-400">AI-generated — always double-check against the official criteria.</p>
                        <button type="button" onClick={handleGenerate} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                            <RotateCw aria-hidden="true" className="h-3.5 w-3.5" /> Regenerate
                        </button>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-5">
                    {signedIn ? (
                        <>
                            <p className="text-sm text-slate-600">
                                Get an AI-written explanation of how your profile matches each requirement of this scholarship.
                            </p>
                            {error && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <button type="button" onClick={handleGenerate} className={`${buttonClass.primary} h-10`}>
                                    <Sparkles aria-hidden="true" className="h-4 w-4" /> {error ? 'Try again' : 'Generate explanation'}
                                </button>
                                <span className="text-xs text-slate-500">Uses your saved profile · limited per day</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-slate-600">Sign in to get an AI-written explanation based on your profile.</p>
                            <Link href="/login" className={`${buttonClass.secondary} mt-4 h-10`}>Sign in</Link>
                        </>
                    )}
                </div>
            )}
        </DetailCard>
    );
}
