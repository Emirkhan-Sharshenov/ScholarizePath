'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, HelpCircle, RotateCw, Sparkles, XCircle } from 'lucide-react';
import { buttonClass, DetailCard } from '@/components/common/detailUi';
import { useI18n } from '@/i18n/I18nProvider';
import { apiMessage } from '@/i18n/format';

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

const VERDICT_CLASS: Record<Verdict, string> = {
    high: 'bg-emerald-50 text-emerald-700',
    moderate: 'bg-amber-50 text-amber-700',
    low: 'bg-rose-50 text-rose-700',
};

export function AIEligibilityExplanation({ scholarshipId, signedIn, className }: AIEligibilityExplanationProps) {
    const [explanation, setExplanation] = useState<EligibilityExplanation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t, locale } = useI18n();
    const m = t.scholarships.ai;
    const criterionIcon: Record<CriterionStatus, React.ReactNode> = {
        match: <CheckCircle2 aria-label={m.meets} className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />,
        partial: <HelpCircle aria-label={m.partly} className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />,
        mismatch: <XCircle aria-label={m.doesnt} className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />,
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/ai/eligibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ scholarshipId, locale }),
            });

            const data = await res.json();

            if (res.status === 429) {
                setError(apiMessage(t, data.message, m.limit));
                return;
            }

            if (!res.ok || !data.success) {
                setError(apiMessage(t, data.message, m.failed));
                return;
            }

            setExplanation({ verdict: data.verdict, summary: data.summary, criteria: data.criteria });
        } catch {
            setError(m.unreachable);
        } finally {
            setIsLoading(false);
        }
    };

    const verdict = explanation ? { label: m.verdict[explanation.verdict], className: VERDICT_CLASS[explanation.verdict] } : null;

    return (
        <DetailCard
            icon={Sparkles}
            tone="violet"
            title={m.title}
            subtitle={m.subtitle}
            action={verdict && <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${verdict.className}`}>{verdict.label}</span>}
            className={className}
        >
            {isLoading ? (
                <div aria-live="polite" className="space-y-3">
                    <span className="sr-only">{m.generating}</span>
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
                                {criterionIcon[c.status]}
                                <div className="min-w-0 text-sm">
                                    <p className="font-semibold text-ink">{c.label}</p>
                                    <p className="mt-0.5 text-slate-500">{c.explanation}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <p className="text-xs text-slate-400">{m.disclaimer}</p>
                        <button type="button" onClick={handleGenerate} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                            <RotateCw aria-hidden="true" className="h-3.5 w-3.5" /> {m.regenerate}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-5">
                    {signedIn ? (
                        <>
                            <p className="text-sm text-slate-600">
                                {m.intro}
                            </p>
                            {error && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <button type="button" onClick={handleGenerate} className={`${buttonClass.primary} h-10`}>
                                    <Sparkles aria-hidden="true" className="h-4 w-4" /> {error ? m.tryAgain : m.generate}
                                </button>
                                <span className="text-xs text-slate-500">{m.usesProfile}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-slate-600">{m.signInText}</p>
                            <Link href="/login" className={`${buttonClass.secondary} mt-4 h-10`}>{m.signIn}</Link>
                        </>
                    )}
                </div>
            )}
        </DetailCard>
    );
}
