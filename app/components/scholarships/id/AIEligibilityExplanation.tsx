'use client';

import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, XCircle, Sparkles } from 'lucide-react';

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
}

const VERDICT_LABEL: Record<Verdict, string> = {
    high: 'High Chance',
    moderate: 'Moderate Chance',
    low: 'Low Chance',
};

export function AIEligibilityExplanation({ scholarshipId }: AIEligibilityExplanationProps) {
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

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    AI Eligibility Explanation
                </h2>

                {!explanation && (
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Thinking…' : 'Explain with AI'}
                    </button>
                )}
            </div>

            {!explanation && !isLoading && !error && (
                <p className="text-xs text-slate-500">
                    Get a plain-language, AI-generated explanation of exactly why you do or don&apos;t
                    meet each requirement for this scholarship.
                </p>
            )}

            {error && <p className="text-xs text-rose-500">{error}</p>}

            {explanation && (
                <div>
                    <div className="mb-4 rounded-xl bg-slate-50/80 p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                            {VERDICT_LABEL[explanation.verdict]}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-700">{explanation.summary}</p>
                    </div>

                    <div className="space-y-3">
                        {explanation.criteria.map((c, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                                {c.status === 'match' && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />}
                                {c.status === 'partial' && <HelpCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />}
                                {c.status === 'mismatch' && <XCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />}
                                <div>
                                    <p className="font-semibold text-slate-700">{c.label}</p>
                                    <p className="text-slate-500 mt-0.5">{c.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-4 text-[10px] text-slate-400 text-center">
                        AI-generated estimate — always double-check against the official scholarship criteria.
                    </p>
                </div>
            )}
        </div>
    );
}
