'use client';

import { useState, type FormEvent } from 'react';
import { AlertCircle, Bug, CheckCircle2, Lightbulb, Loader2, Send, type LucideIcon } from 'lucide-react';

type Kind = 'bug' | 'suggestion';

interface FieldConfig { name: string; label: string; placeholder: string; max: number; multiline?: boolean; rows?: number }

const FORMS: Record<Kind, { title: string; subtitle: string; icon: LucideIcon; tone: string; submit: string; sent: string; fields: FieldConfig[] }> = {
    bug: {
        title: 'Report a bug',
        subtitle: 'Errors, wrong data or broken links.',
        icon: Bug,
        tone: 'bg-rose-50 text-rose-600',
        submit: 'Send bug report',
        sent: 'Thanks! Your bug report was sent.',
        fields: [
            { name: 'title', label: 'Title', placeholder: 'Briefly describe the issue', max: 120 },
            { name: 'description', label: 'What went wrong?', placeholder: 'What happened, and what did you expect?', max: 1000, multiline: true, rows: 4 },
            { name: 'steps', label: 'Steps to reproduce', placeholder: '1. Go to page…\n2. Click on…', max: 1000, multiline: true, rows: 4 },
        ],
    },
    suggestion: {
        title: 'Suggest a feature',
        subtitle: 'Tools, data or improvements that would help you.',
        icon: Lightbulb,
        tone: 'bg-amber-50 text-amber-600',
        submit: 'Send suggestion',
        sent: 'Thanks! Your suggestion was sent.',
        fields: [
            { name: 'title', label: 'Title', placeholder: 'Briefly describe your idea', max: 120 },
            { name: 'suggestion', label: 'Your idea', placeholder: 'What would you like to see?', max: 1000, multiline: true, rows: 4 },
            { name: 'benefit', label: 'Why would it help?', placeholder: 'Who would it help, and how?', max: 1000, multiline: true, rows: 4 },
        ],
    },
};

const inputBase = 'w-full rounded-xl border bg-white px-3.5 text-sm text-ink placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-4';

function FeedbackForm({ kind }: { kind: Kind }) {
    const config = FORMS[kind];
    const empty = Object.fromEntries(config.fields.map((f) => [f.name, ''])) as Record<string, string>;
    const [values, setValues] = useState(empty);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [serverError, setServerError] = useState('');

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const missing = Object.fromEntries(config.fields.filter((f) => !values[f.name].trim()).map((f) => [f.name, `Please fill in “${f.label}”`]));
        setErrors(missing);
        if (Object.keys(missing).length) return;

        setStatus('sending');
        setServerError('');
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: kind, ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])) }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Couldn't send — please try again.");
            setStatus('sent');
            setValues(empty);
        } catch (err) {
            setServerError(err instanceof Error ? err.message : "Couldn't send — please try again.");
            setStatus('error');
        }
    };

    return (
        <section className="flex w-full flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-7">
            <div className="flex items-start gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.tone}`}><config.icon aria-hidden="true" className="h-5 w-5" /></span>
                <div>
                    <h2 className="font-display text-xl font-bold text-ink">{config.title}</h2>
                    <p className="text-sm text-slate-500">{config.subtitle}</p>
                </div>
            </div>

            {status === 'sent' ? (
                <div role="status" className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 aria-hidden="true" className="h-7 w-7" /></span>
                    <p className="mt-4 font-display text-lg font-bold text-ink">{config.sent}</p>
                    <p className="mt-1 text-sm text-slate-500">We read every message.</p>
                    <button type="button" onClick={() => setStatus('idle')} className="mt-4 text-sm font-semibold text-brand hover:underline">Send another</button>
                </div>
            ) : (
                <form onSubmit={submit} noValidate className="mt-6 flex flex-1 flex-col gap-5">
                    {config.fields.map((f) => {
                        const id = `${kind}-${f.name}`;
                        const error = errors[f.name];
                        const cls = `${inputBase} ${error ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-brand focus:ring-brand/10'}`;
                        const onChange = (v: string) => {
                            setValues((prev) => ({ ...prev, [f.name]: v }));
                            if (error) setErrors((prev) => { const next = { ...prev }; delete next[f.name]; return next; });
                        };
                        return (
                            <div key={f.name}>
                                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                                    <label htmlFor={id} className="text-sm font-semibold text-ink">{f.label}</label>
                                    {f.multiline && <span className="text-xs text-slate-400">{values[f.name].length}/{f.max}</span>}
                                </div>
                                {f.multiline ? (
                                    <textarea id={id} rows={f.rows} maxLength={f.max} value={values[f.name]} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={`${cls} resize-y py-3 leading-relaxed`} />
                                ) : (
                                    <input id={id} type="text" maxLength={f.max} value={values[f.name]} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={`${cls} h-12`} />
                                )}
                                {error && <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600"><AlertCircle aria-hidden="true" className="h-3.5 w-3.5" /> {error}</p>}
                            </div>
                        );
                    })}

                    {status === 'error' && (
                        <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> {serverError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-sm transition hover:bg-[#004a9f] disabled:opacity-70"
                    >
                        {status === 'sending' ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="h-4 w-4" />}
                        {status === 'sending' ? 'Sending…' : config.submit}
                    </button>
                </form>
            )}
        </section>
    );
}

export default function FeedbackPage() {
    const [mobileKind, setMobileKind] = useState<Kind>('bug');
    return (
        <div className="font-body">
            <div className="mb-5 md:mb-6">
                <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Feedback</h1>
                <p className="mt-1 text-sm text-slate-500">Found a bug or have an idea? We read every message.</p>
            </div>

            {/* Phones: one form at a time */}
            <div role="tablist" aria-label="Feedback type" className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/60 p-1 md:hidden">
                {(['bug', 'suggestion'] as Kind[]).map((k) => (
                    <button
                        key={k}
                        type="button"
                        role="tab"
                        aria-selected={mobileKind === k}
                        onClick={() => setMobileKind(k)}
                        className={`h-10 rounded-xl text-sm font-semibold transition-colors ${mobileKind === k ? 'bg-white text-ink shadow-sm' : 'text-slate-500'}`}
                    >
                        {k === 'bug' ? 'Bug report' : 'Suggestion'}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-stretch md:gap-6">
                <div className={mobileKind === 'bug' ? 'flex' : 'hidden md:flex'}><FeedbackForm kind="bug" /></div>
                <div className={mobileKind === 'suggestion' ? 'flex' : 'hidden md:flex'}><FeedbackForm kind="suggestion" /></div>
            </div>
        </div>
    );
}
