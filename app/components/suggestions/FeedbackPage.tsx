'use client';

import { useState, type FormEvent } from 'react';
import { AlertCircle, Bug, CheckCircle2, Lightbulb, Loader2, Send, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { apiMessage } from '@/i18n/format';

type Kind = 'bug' | 'suggestion';

// Field names match the /api/feedback body; labels and placeholders come from
// the `feedback.forms` messages.
interface FieldConfig { name: string; max: number; multiline?: boolean; rows?: number }

const FORMS: Record<Kind, { icon: LucideIcon; tone: string; fields: FieldConfig[] }> = {
    bug: {
        icon: Bug,
        tone: 'bg-rose-50 text-rose-600',
        fields: [
            { name: 'title', max: 120 },
            { name: 'description', max: 1000, multiline: true, rows: 4 },
            { name: 'steps', max: 1000, multiline: true, rows: 4 },
        ],
    },
    suggestion: {
        icon: Lightbulb,
        tone: 'bg-amber-50 text-amber-600',
        fields: [
            { name: 'title', max: 120 },
            { name: 'suggestion', max: 1000, multiline: true, rows: 4 },
            { name: 'benefit', max: 1000, multiline: true, rows: 4 },
        ],
    },
};

const inputBase = 'w-full rounded-xl border bg-white px-3.5 text-sm text-ink placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-4';

function FeedbackForm({ kind }: { kind: Kind }) {
    const { t } = useI18n();
    const m = t.feedback;
    const copy = m.forms[kind];
    const config = FORMS[kind];
    const empty = Object.fromEntries(config.fields.map((f) => [f.name, ''])) as Record<string, string>;
    const [values, setValues] = useState(empty);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [serverError, setServerError] = useState('');

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const missing = Object.fromEntries(config.fields.filter((f) => !values[f.name].trim()).map((f) => [f.name, m.fillIn(copy.fields[f.name].label)]));
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
            if (!res.ok) throw new Error(apiMessage(t, data.message, m.sendFailed));
            setStatus('sent');
            setValues(empty);
        } catch (err) {
            setServerError(err instanceof Error ? err.message : m.sendFailed);
            setStatus('error');
        }
    };

    return (
        <section className="flex w-full flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-7">
            <div className="flex items-start gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.tone}`}><config.icon aria-hidden="true" className="h-5 w-5" /></span>
                <div>
                    <h2 className="font-display text-xl font-bold text-ink">{copy.title}</h2>
                    <p className="text-sm text-slate-500">{copy.subtitle}</p>
                </div>
            </div>

            {status === 'sent' ? (
                <div role="status" className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 aria-hidden="true" className="h-7 w-7" /></span>
                    <p className="mt-4 font-display text-lg font-bold text-ink">{copy.sent}</p>
                    <p className="mt-1 text-sm text-slate-500">{m.weRead}</p>
                    <button type="button" onClick={() => setStatus('idle')} className="mt-4 text-sm font-semibold text-brand hover:underline">{m.sendAnother}</button>
                </div>
            ) : (
                <form onSubmit={submit} noValidate className="mt-6 flex flex-1 flex-col gap-5">
                    {config.fields.map((f) => {
                        const id = `${kind}-${f.name}`;
                        const error = errors[f.name];
                        const { label, placeholder } = copy.fields[f.name];
                        const cls = `${inputBase} ${error ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-brand focus:ring-brand/10'}`;
                        const onChange = (v: string) => {
                            setValues((prev) => ({ ...prev, [f.name]: v }));
                            if (error) setErrors((prev) => { const next = { ...prev }; delete next[f.name]; return next; });
                        };
                        return (
                            <div key={f.name}>
                                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                                    <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
                                    {f.multiline && <span className="text-xs text-slate-400">{values[f.name].length}/{f.max}</span>}
                                </div>
                                {f.multiline ? (
                                    <textarea id={id} rows={f.rows} maxLength={f.max} value={values[f.name]} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={`${cls} resize-y py-3 leading-relaxed`} />
                                ) : (
                                    <input id={id} type="text" maxLength={f.max} value={values[f.name]} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={`${cls} h-12`} />
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
                        {status === 'sending' ? m.sending : copy.submit}
                    </button>
                </form>
            )}
        </section>
    );
}

export default function FeedbackPage() {
    const [mobileKind, setMobileKind] = useState<Kind>('bug');
    const { t } = useI18n();
    const m = t.feedback;
    return (
        <div className="font-body">
            <div className="mb-5 md:mb-6">
                <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{m.title}</h1>
                <p className="mt-1 text-sm text-slate-500">{m.lead}</p>
            </div>

            {/* Phones: one form at a time */}
            <div role="tablist" aria-label={m.type} className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/60 p-1 md:hidden">
                {(['bug', 'suggestion'] as Kind[]).map((k) => (
                    <button
                        key={k}
                        type="button"
                        role="tab"
                        aria-selected={mobileKind === k}
                        onClick={() => setMobileKind(k)}
                        className={`h-10 rounded-xl text-sm font-semibold transition-colors ${mobileKind === k ? 'bg-white text-ink shadow-sm' : 'text-slate-500'}`}
                    >
                        {k === 'bug' ? m.bugTab : m.suggestionTab}
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
