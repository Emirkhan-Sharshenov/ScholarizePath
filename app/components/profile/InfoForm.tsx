'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ArrowRight, Check, ChevronDown, Loader2 } from 'lucide-react';
import { COUNTRY_LIST } from './countryList';

type EnglishTest = 'ielts' | 'toefl';

interface FormState {
    age: string;
    nationality: string;
    gpa: string;
    satScore: string;
    englishScore: string;
    fieldOfStudy: string;
    country: string;
    programLevel: string;
}

const STEPS = ['About you', 'Academics', 'Your goals'] as const;
const PROGRAM_LEVELS = ['Bachelor', 'Master', 'PhD'] as const;

const inputClass = (invalid?: boolean) =>
    `h-12 w-full rounded-[10px] border px-4 text-[15px] text-ink shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-4 ${invalid
        ? 'border-red-400 bg-red-50/60 focus:border-red-500 focus:ring-red-100'
        : 'border-slate-200 bg-white hover:border-slate-300 focus:border-brand focus:ring-brand/10'
    }`;

// Range checks for each step — all fields stay optional (as before), but a
// value that is filled in must make sense before moving on.
function validateStep(step: number, f: FormState, test: EnglishTest): Partial<Record<keyof FormState, string>> {
    const errors: Partial<Record<keyof FormState, string>> = {};
    const outOfRange = (v: string, min: number, max: number) => v !== '' && (Number.isNaN(Number(v)) || Number(v) < min || Number(v) > max);

    if (step === 0 && outOfRange(f.age, 10, 100)) errors.age = 'Enter an age between 10 and 100';
    if (step === 1) {
        if (outOfRange(f.gpa, 0, 4)) errors.gpa = 'Enter a value between 0 and 4';
        if (outOfRange(f.satScore, 400, 1600)) errors.satScore = 'SAT scores range from 400 to 1600';
        if (test === 'ielts' && outOfRange(f.englishScore, 0, 9)) errors.englishScore = 'IELTS bands range from 0 to 9';
        if (test === 'toefl' && outOfRange(f.englishScore, 0, 120)) errors.englishScore = 'TOEFL scores range from 0 to 120';
    }
    return errors;
}

function Field({ id, label, hint, error, optional, children }: {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    optional?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <label htmlFor={id} className="text-sm font-semibold text-ink">
                    {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
                </label>
                {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
            </div>
            {children}
            {error && (
                <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" /> {error}
                </p>
            )}
        </div>
    );
}

function SelectBox({ id, value, onChange, placeholder, children }: {
    id: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${inputClass()} appearance-none pr-10 ${value ? '' : 'text-slate-400'}`}
            >
                <option value="">{placeholder}</option>
                {children}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
    );
}

export default function AdditionalInfoForm() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [englishTestType, setEnglishTestType] = useState<EnglishTest>('ielts');

    const [formData, setFormData] = useState<FormState>({
        age: '',
        nationality: 'Kyrgyzstan',
        gpa: '',
        satScore: '',
        englishScore: '',
        fieldOfStudy: '',
        country: '',
        programLevel: '',
    });

    const set = (name: keyof FormState, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleTestTypeChange = (type: EnglishTest) => {
        setEnglishTestType(type);
        set('englishScore', '');
    };

    const submit = async () => {
        setLoading(true);
        setError(null);

        const payload = {
            age: formData.age ? Number(formData.age) : null,
            nationality: formData.nationality || null,
            gpa: formData.gpa ? Number(formData.gpa) : null,
            sat: formData.satScore ? Number(formData.satScore) : null,
            englishTest: {
                type: englishTestType.toUpperCase(), // "IELTS" | "TOEFL"
                score: formData.englishScore ? Number(formData.englishScore) : null,
            },
            preferredField: formData.fieldOfStudy || null,
            preferredCountry: formData.country || null,
            programLevel: formData.programLevel || null,
        };

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to submit form');
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        const errors = validateStep(step, formData, englishTestType);
        setFieldErrors(errors);
        if (Object.keys(errors).length) return;
        if (step < STEPS.length - 1) setStep(step + 1);
        else submit();
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] font-body text-ink">
            <header className="border-b border-slate-200/70 bg-white">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                    <Image src="/images/logo.png" alt="ScholarizePath" width={240} height={48} className="h-8 w-auto object-contain sm:h-9" priority />
                    <div className="w-40 sm:w-64">
                        <div className="mb-1.5 flex justify-between text-xs font-medium">
                            <span className="hidden text-slate-500 sm:inline">Profile setup</span>
                            <span className="ml-auto font-semibold text-brand">Step {step + 1} of {STEPS.length}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 items-start justify-center px-4 py-8 pb-28 sm:items-center sm:py-12 sm:pb-12">
                <form onSubmit={handleNext} noValidate className="w-full max-w-[640px] sm:rounded-3xl sm:border sm:border-slate-200/80 sm:bg-white sm:p-10 sm:shadow-[0_10px_30px_rgba(10,26,63,0.06)]">
                    {/* Stepper */}
                    <ol className="mb-8 flex items-center">
                        {STEPS.map((label, i) => {
                            const done = i < step;
                            const active = i === step;
                            return (
                                <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${done ? 'bg-brand text-white' : active ? 'bg-brand text-white ring-4 ring-brand/15' : 'bg-slate-100 text-slate-400'}`}>
                                            {done ? <Check aria-hidden="true" className="h-4 w-4" /> : i + 1}
                                        </span>
                                        <span className={`whitespace-nowrap text-xs font-medium ${active ? 'text-brand' : 'text-slate-500'}`}>{label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && <span className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${done ? 'bg-brand' : 'bg-slate-200'}`} />}
                                </li>
                            );
                        })}
                    </ol>

                    <h1 className="font-display text-3xl font-bold tracking-tight sm:text-[2.25rem]">Set up your profile</h1>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
                        We use this to match you with universities and scholarships. You can change it later.
                    </p>

                    {error && (
                        <div role="alert" className="mt-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ duration: 0.2 }}
                            className="mt-7 space-y-5"
                        >
                            {step === 0 && (
                                <>
                                    <Field id="age" label="Age" error={fieldErrors.age}>
                                        <input id="age" type="number" inputMode="numeric" min={10} max={100} placeholder="e.g. 19" value={formData.age} onChange={(e) => set('age', e.target.value)} className={inputClass(!!fieldErrors.age)} />
                                    </Field>
                                    <Field id="nationality" label="Nationality">
                                        <SelectBox id="nationality" value={formData.nationality} onChange={(v) => set('nationality', v)} placeholder="Select your nationality…">
                                            {COUNTRY_LIST.map((c) => <option key={`nat-${c.name}`} value={c.name}>{c.flag} {c.name}</option>)}
                                        </SelectBox>
                                    </Field>
                                </>
                            )}

                            {step === 1 && (
                                <>
                                    <Field id="gpa" label="GPA" hint="on a 4.0 scale" error={fieldErrors.gpa}>
                                        <input id="gpa" type="number" inputMode="decimal" step="0.01" min={0} max={4} placeholder="e.g. 3.6" value={formData.gpa} onChange={(e) => set('gpa', e.target.value)} className={inputClass(!!fieldErrors.gpa)} />
                                    </Field>
                                    <Field id="satScore" label="SAT score" optional hint="leave empty if you haven't taken it" error={fieldErrors.satScore}>
                                        <input id="satScore" type="number" inputMode="numeric" min={400} max={1600} placeholder="e.g. 1450" value={formData.satScore} onChange={(e) => set('satScore', e.target.value)} className={inputClass(!!fieldErrors.satScore)} />
                                    </Field>
                                    <Field id="englishScore" label="English proficiency" error={fieldErrors.englishScore}>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div role="radiogroup" aria-label="English test" className="grid h-12 grid-cols-2 rounded-[10px] bg-slate-100 p-1">
                                                {(['ielts', 'toefl'] as const).map((t) => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={englishTestType === t}
                                                        onClick={() => handleTestTypeChange(t)}
                                                        className={`rounded-lg text-sm font-semibold uppercase transition-colors ${englishTestType === t ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:text-ink'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <input
                                                    id="englishScore"
                                                    type="number"
                                                    inputMode="decimal"
                                                    step={englishTestType === 'ielts' ? '0.5' : '1'}
                                                    min={0}
                                                    max={englishTestType === 'ielts' ? 9 : 120}
                                                    placeholder={englishTestType === 'ielts' ? 'e.g. 7.5' : 'e.g. 100'}
                                                    value={formData.englishScore}
                                                    onChange={(e) => set('englishScore', e.target.value)}
                                                    className={`${inputClass(!!fieldErrors.englishScore)} pr-16`}
                                                />
                                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                    / {englishTestType === 'ielts' ? '9.0' : '120'}
                                                </span>
                                            </div>
                                        </div>
                                    </Field>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <Field id="fieldOfStudy" label="Field of study">
                                        <input id="fieldOfStudy" type="text" placeholder="e.g. Computer Science" value={formData.fieldOfStudy} onChange={(e) => set('fieldOfStudy', e.target.value)} className={inputClass()} />
                                    </Field>
                                    <Field id="country" label="Target country">
                                        <SelectBox id="country" value={formData.country} onChange={(v) => set('country', v)} placeholder="Where do you want to study?">
                                            {COUNTRY_LIST.map((c) => <option key={`tgt-${c.name}`} value={c.name}>{c.flag} {c.name}</option>)}
                                        </SelectBox>
                                    </Field>
                                    <fieldset>
                                        <legend className="mb-1.5 text-sm font-semibold text-ink">Program level</legend>
                                        <div className="grid grid-cols-3 gap-3">
                                            {PROGRAM_LEVELS.map((level) => {
                                                const selected = formData.programLevel === level;
                                                return (
                                                    <button
                                                        key={level}
                                                        type="button"
                                                        aria-pressed={selected}
                                                        onClick={() => set('programLevel', selected ? '' : level)}
                                                        className={`flex h-12 items-center justify-center gap-1.5 rounded-[10px] border text-sm font-semibold transition-colors ${selected ? 'border-brand bg-brand text-white shadow-sm' : 'border-slate-200 bg-white text-ink hover:border-slate-300'}`}
                                                    >
                                                        {selected && <Check aria-hidden="true" className="h-4 w-4" />}
                                                        {level}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* On phones the buttons stick to the bottom of the screen */}
                    <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:static sm:mt-10 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                        {step > 0 ? (
                            <button type="button" onClick={() => { setFieldErrors({}); setStep(step - 1); }} className="inline-flex h-12 items-center gap-2 rounded-[10px] px-4 text-[15px] font-semibold text-ink transition-colors hover:bg-slate-100 sm:-ml-4">
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back
                            </button>
                        ) : <span />}
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-brand px-7 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(0,88,189,0.25)] transition-all hover:bg-[#004a9f] active:scale-[0.99] disabled:opacity-60 sm:flex-none"
                        >
                            {loading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
                            {step < STEPS.length - 1 ? 'Continue' : loading ? 'Saving…' : 'Finish setup'}
                            {!loading && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
