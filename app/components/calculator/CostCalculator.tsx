'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    AlertTriangle, ArrowUpRight, Calculator, CalendarDays, ChevronDown, Home, Info, Minus, Plus, RotateCcw,
    School, SlidersHorizontal, Wallet,
} from 'lucide-react';
import { formatAmount } from '@/lib/scholarshipDisplay';
import { buttonClass, MobileActionBar, NoData, TONES } from '@/components/common/detailUi';
import SearchPicker from './SearchPicker';
import {
    DEFAULT_DURATION, LEVELS, ProgramLevel, PickerItem, ScholarshipOffset, UniversityCostDetail,
    extractScholarshipOffset, extractUniversityCostDetail,
} from './calculatorTypes';
import { useI18n } from '@/i18n/I18nProvider';
import { localizeCountry, localizeLocation } from '@/i18n/countries';
import { intlLocale } from '@/i18n/format';
import type { Locale } from '@/i18n/config';

/* eslint-disable @typescript-eslint/no-explicit-any -- API rows are schemaless */

const MAX_YEARS = 8;

async function searchUniversities(q: string, locale: Locale): Promise<PickerItem[]> {
    const res = await fetch(`/api/universities?search=${encodeURIComponent(q)}&limit=6`).catch(() => null);
    if (!res?.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map((u: any) => ({
        id: String(u._id),
        name: u.name,
        subtitle: localizeLocation([u.location?.city, u.location?.country].filter(Boolean).join(', '), locale),
    }));
}

async function searchScholarships(q: string, locale: Locale): Promise<PickerItem[]> {
    const res = await fetch(`/api/scholarships?search=${encodeURIComponent(q)}&limit=6`).catch(() => null);
    if (!res?.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map((s: any) => ({
        id: String(s._id),
        name: s.scholarshipName,
        subtitle: [s.provider?.name, s.country && localizeCountry(s.country, locale)].filter(Boolean).join(' · '),
    }));
}

/** The user's favourites as picker shortcuts (empty when signed out). */
function useFavoriteShortcuts(locale: Locale) {
    const [favs, setFavs] = useState<{ universities: PickerItem[]; scholarships: PickerItem[] }>({ universities: [], scholarships: [] });
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const self = await fetch('/api/auth/self').then((r) => (r.ok ? r.json() : null)).catch(() => null);
            if (!self?.user) return;
            const load = (kind: string, ids: string[]) => Promise.all(ids.slice(0, 6).map((id) =>
                fetch(`/api/${kind}/${id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)));
            const [unis, schs] = await Promise.all([
                load('universities', self.user.favoriteUniversities ?? []),
                load('scholarships', self.user.favoriteScholarships ?? []),
            ]);
            if (cancelled) return;
            setFavs({
                universities: unis.filter(Boolean).map((u: any) => ({ id: String(u._id), name: u.name, subtitle: localizeLocation([u.location?.city, u.location?.country].filter(Boolean).join(', '), locale) })),
                scholarships: schs.filter(Boolean).map((s: any) => ({ id: String(s._id), name: s.scholarshipName, subtitle: [s.provider?.name, s.country && localizeCountry(s.country, locale)].filter(Boolean).join(' · ') })),
            });
        })();
        return () => { cancelled = true; };
    }, [locale]);
    return favs;
}

function Row({ icon: Icon, tone, label, hint, children }: { icon: typeof Wallet; tone: keyof typeof TONES; label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}><Icon aria-hidden="true" className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{label}</p>
                {hint && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
            <div className="text-right text-sm font-semibold text-ink">{children}</div>
        </div>
    );
}

export default function CostCalculator() {
    const { t, locale } = useI18n();
    const m = t.calculator;
    const loc = intlLocale(locale);
    const usd = (v: number) => formatAmount(Math.round(v), 'USD', loc);
    const range = (a: number, b: number) => (Math.round(a) === Math.round(b) ? usd(a) : `${usd(a)} – ${usd(b)}`);
    const levelName = (l: ProgramLevel) => t.universities.detail.levels[l];
    const favorites = useFavoriteShortcuts(locale);
    // Stable per language, so the pickers don't refetch on every render.
    const searchUnis = useCallback((q: string) => searchUniversities(q, locale), [locale]);
    const searchSchs = useCallback((q: string) => searchScholarships(q, locale), [locale]);
    const [uniPick, setUniPick] = useState<PickerItem | null>(null);
    const [university, setUniversity] = useState<UniversityCostDetail | null>(null);
    const [schPick, setSchPick] = useState<PickerItem | null>(null);
    const [scholarship, setScholarship] = useState<ScholarshipOffset | null>(null);
    const [loading, setLoading] = useState<'university' | 'scholarship' | null>(null);
    const [level, setLevel] = useState<ProgramLevel>('bachelor');
    const [years, setYears] = useState(DEFAULT_DURATION.bachelor);
    const [grant, setGrant] = useState('');
    const estimateRef = useRef<HTMLDivElement>(null);

    const pickUniversity = async (item: PickerItem) => {
        setUniPick(item);
        setUniversity(null);
        setLoading('university');
        const doc = await fetch(`/api/universities/${item.id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (doc) setUniversity(extractUniversityCostDetail(doc));
        setLoading(null);
    };

    const pickScholarship = async (item: PickerItem) => {
        setSchPick(item);
        setScholarship(null);
        setGrant('');
        setLoading('scholarship');
        const doc = await fetch(`/api/scholarships/${item.id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (doc) setScholarship(extractScholarshipOffset(doc));
        setLoading(null);
    };

    const reset = () => {
        setUniPick(null); setUniversity(null); setSchPick(null); setScholarship(null);
        setLevel('bachelor'); setYears(DEFAULT_DURATION.bachelor); setGrant('');
    };

    // ── Estimate ──
    const tuition = university ? university.tuition[level] : null;
    const tuitionCovered = scholarship?.coversTuition === true;
    const tuitionNet = tuition === null ? null : tuitionCovered ? 0 : tuition;
    const livingMin = university?.livingMin ?? null;
    const livingMax = university?.livingMax ?? livingMin;
    const grantPerYear = Math.max(0, Number(grant) || 0);
    const canEstimate = tuitionNet !== null && livingMin !== null && livingMax !== null && university?.currency === 'USD';
    const perYear = canEstimate ? [Math.max(0, tuitionNet! + livingMin! - grantPerYear), Math.max(0, tuitionNet! + livingMax! - grantPerYear)] : null;
    const total = perYear ? [perYear[0] * years, perYear[1] * years] : null;
    const whyNot = !university ? null
        : tuition === null ? m.whyTuition(levelName(level))
            : livingMin === null ? m.whyLiving
                : university.currency !== 'USD' ? m.whyCurrency(university.currency) : null;

    // Bar shares of the gross yearly cost (tuition + average living).
    const livingAvg = livingMin !== null && livingMax !== null ? (livingMin + livingMax) / 2 : null;
    const gross = (tuition ?? 0) + (livingAvg ?? 0);
    const share = (v: number) => (gross > 0 ? Math.round((v / gross) * 100) : 0);
    const deduction = (tuitionCovered ? tuition ?? 0 : 0) + grantPerYear;

    const levelLabel = levelName(level);

    return (
        <div className="font-body">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{m.title}</h1>
                    <p className="mt-1 text-sm text-slate-500">{m.lead}</p>
                </div>
                {(uniPick || schPick) && (
                    <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand">
                        <RotateCcw aria-hidden="true" className="h-4 w-4" /> {m.reset}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start lg:gap-6">
                {/* Plan */}
                <section className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6 lg:col-span-5">
                    <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES.blue}`}><SlidersHorizontal aria-hidden="true" className="h-5 w-5" /></span>
                        <div>
                            <h2 className="font-display text-lg font-bold text-ink">{m.plan}</h2>
                            <p className="text-sm text-slate-500">{m.planLead}</p>
                        </div>
                    </div>

                    <SearchPicker
                        label={m.university}
                        placeholder={m.universityPlaceholder}
                        tone="blue"
                        search={searchUnis}
                        favorites={favorites.universities}
                        selected={uniPick}
                        loadingSelected={loading === 'university'}
                        onSelect={pickUniversity}
                        onClear={() => { setUniPick(null); setUniversity(null); }}
                    />

                    <div>
                        <p className="mb-2 text-sm font-semibold text-ink">{m.degreeLevel}</p>
                        <div role="radiogroup" aria-label={m.degreeLevel} className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                            {LEVELS.map(([l]) => (
                                <button
                                    key={l}
                                    type="button"
                                    role="radio"
                                    aria-checked={level === l}
                                    onClick={() => { setLevel(l); setYears(DEFAULT_DURATION[l]); }}
                                    className={`h-10 rounded-lg text-sm font-semibold transition-colors ${level === l ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink'}`}
                                >
                                    {levelName(l)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                            <p className="text-sm font-semibold text-ink">{m.duration}</p>
                            <p className="text-xs text-slate-400">{m.typical}</p>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-2 pl-4">
                            <CalendarDays aria-hidden="true" className="h-5 w-5 text-slate-400" />
                            <span className="flex-1 text-sm font-semibold text-ink" aria-live="polite">{m.years(years)}</span>
                            <button type="button" onClick={() => setYears((y) => Math.max(1, y - 1))} disabled={years <= 1} aria-label={m.fewerYears} className={`${buttonClass.icon} h-10 w-10 disabled:opacity-40`}><Minus aria-hidden="true" className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setYears((y) => Math.min(MAX_YEARS, y + 1))} disabled={years >= MAX_YEARS} aria-label={m.moreYears} className={`${buttonClass.icon} h-10 w-10 disabled:opacity-40`}><Plus aria-hidden="true" className="h-4 w-4" /></button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <SearchPicker
                            label={m.scholarship}
                            placeholder={m.scholarshipPlaceholder}
                            tone="violet"
                            search={searchSchs}
                            favorites={favorites.scholarships}
                            selected={schPick}
                            loadingSelected={loading === 'scholarship'}
                            onSelect={pickScholarship}
                            onClear={() => { setSchPick(null); setScholarship(null); setGrant(''); }}
                        />
                        {scholarship && (
                            <div className="space-y-3 rounded-2xl bg-violet-50/50 p-4 text-sm">
                                <p className="text-slate-600">
                                    {scholarship.coversTuition === true && <span className="font-semibold text-emerald-700">{m.coversTuition}</span>}
                                    {scholarship.coversTuition === false && <span>{m.noTuition}</span>}
                                    {scholarship.coversTuition === null && <span>{m.tuitionUnknown}</span>}
                                    {scholarship.amountText && <>{m.awardOnRecord} <span className="font-semibold text-ink">{scholarship.amountText}</span>.</>}
                                </p>
                                <div>
                                    <label htmlFor="grant-per-year" className="mb-1.5 block text-xs font-semibold text-slate-600">{m.grantLabel}</label>
                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                                        <input
                                            id="grant-per-year"
                                            type="number"
                                            inputMode="numeric"
                                            min={0}
                                            value={grant}
                                            onChange={(e) => setGrant(e.target.value)}
                                            placeholder={m.grantPlaceholder}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-500">
                                        {m.grantNote(scholarship.currency && scholarship.currency !== 'USD' ? scholarship.currency : null)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Estimate */}
                <section ref={estimateRef} className="scroll-mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6 lg:sticky lg:top-6 lg:col-span-7">
                    {!uniPick ? (
                        <div className="flex flex-col items-center py-16 text-center">
                            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${TONES.blue}`}><Calculator aria-hidden="true" className="h-6 w-6" /></span>
                            <h2 className="mt-4 font-display text-lg font-bold text-ink">{m.pickTitle}</h2>
                            <p className="mt-1 max-w-sm text-sm text-slate-500">{m.pickLead}</p>
                        </div>
                    ) : !university ? (
                        <div className="space-y-3 py-6">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-slate-100" />)}</div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{m.netTotal}</p>
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand">{levelLabel} · {m.years(years)}</span>
                            </div>
                            {total ? (
                                <>
                                    <p className="mt-2 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">{range(total[0], total[1])}</p>
                                    <p className="mt-1 text-sm text-slate-500">{m.perMonth(range(perYear![0] / 12, perYear![1] / 12))}</p>
                                </>
                            ) : (
                                <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span><span className="font-semibold">{m.cantEstimate}</span> {whyNot}{m.noGuess}</span>
                                </div>
                            )}

                            <div className="mt-5 space-y-2 rounded-3xl bg-slate-50 p-2">
                                <Row icon={School} tone="blue" label={m.tuition} hint={university.original ? m.convertedFrom(formatAmount(university.original.amount, university.original.currency, loc)) : m.perYear}>
                                    {tuition === null ? <NoData /> : tuition === 0 ? m.free : <>{formatAmount(tuition, university.currency, loc)}<span className="font-normal text-slate-400">{m.yr}</span></>}
                                </Row>
                                <Row icon={Home} tone="sky" label={m.living} hint={m.livingHint}>
                                    {livingMin === null ? <NoData /> : <>{range(livingMin, livingMax ?? livingMin)}<span className="font-normal text-slate-400">{m.yr}</span></>}
                                </Row>
                                {scholarship && (tuitionCovered || grantPerYear > 0) && (
                                    <Row icon={Wallet} tone="emerald" label={scholarship.name} hint={[tuitionCovered && m.tuitionCovered, grantPerYear > 0 && m.yourAmount].filter(Boolean).join(' + ')}>
                                        <span className="text-emerald-700">−{usd(deduction)}<span className="font-normal text-emerald-600/70">{m.yr}</span></span>
                                    </Row>
                                )}
                                <div className="flex items-center justify-between gap-3 px-4 py-3">
                                    <span className="text-sm font-semibold text-ink">{m.netPerYear}</span>
                                    <span className="font-display text-lg font-bold text-brand">{perYear ? range(perYear[0], perYear[1]) : <NoData />}</span>
                                </div>
                            </div>

                            {/* Only with both figures — a one-sided split ("Tuition 100%") would mislead. */}
                            {gross > 0 && tuition !== null && livingAvg !== null && (
                                <div className="mt-5">
                                    <p className="mb-2 text-xs font-semibold text-slate-500">{m.split}</p>
                                    <div className="relative flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                                        <div className="bg-brand" style={{ width: `${share(tuition ?? 0)}%` }} />
                                        <div className="bg-sky-300" style={{ width: `${share(livingAvg ?? 0)}%` }} />
                                        {deduction > 0 && (
                                            <div className="absolute inset-y-0 right-0 bg-[repeating-linear-gradient(45deg,rgba(16,185,129,.75)_0_4px,rgba(16,185,129,.35)_4px_8px)]" style={{ width: `${Math.min(100, share(deduction))}%` }} />
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                        {tuition !== null && <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand" /> {m.splitTuition(share(tuition))}</span>}
                                        {livingAvg !== null && <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-300" /> {m.splitLiving(share(livingAvg))}</span>}
                                        {deduction > 0 && <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {m.splitScholarship(Math.min(100, share(deduction)))}</span>}
                                    </div>
                                </div>
                            )}

                            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                                    <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    {m.disclaimer}
                                </p>
                                <Link href={`/universities/${university.id}`} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline">
                                    {m.openUniversity} <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                                </Link>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {university && (
                <MobileActionBar>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{m.netTotalShort}</p>
                        <p className="truncate font-display text-base font-bold text-ink">{total ? range(total[0], total[1]) : m.cantEstimateShort}</p>
                    </div>
                    <button type="button" onClick={() => estimateRef.current?.scrollIntoView({ behavior: 'smooth' })} className={`${buttonClass.secondary} h-10`}>
                        {m.breakdown} <ChevronDown aria-hidden="true" className="h-4 w-4" />
                    </button>
                </MobileActionBar>
            )}
        </div>
    );
}
