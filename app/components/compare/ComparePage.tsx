'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight, ArrowUpRight, Award, BadgeCheck, BookOpen, Building2, CalendarClock, CheckCircle2, CircleDashed, Clock,
    Coins, Globe2, GraduationCap, Hand, Languages, Layers, MapPin, Percent, Plus, Scale, ShieldCheck, Trophy, User,
    Users, Wallet, X, XCircle, type LucideIcon,
} from 'lucide-react';
import { useCompare } from '@/lib/useCompare';
import { getVerification } from '@/lib/verification';
import { formatAmount } from '@/lib/scholarshipDisplay';
import { flagFor } from '@/components/profile/countryList';
import { buttonClass, monogram, NoData, TONES } from '@/components/common/detailUi';
import UnverifiedTag from '@/components/universities/id/UnverifiedTag';
import { DeadlinePill, FundingPill } from '@/components/scholarships/pills';
import { useI18n } from '@/i18n/I18nProvider';
import { localizeCountry } from '@/i18n/countries';
import { formatNumber, intlLocale } from '@/i18n/format';
import type { Messages } from '@/i18n/messages';
import type { Locale } from '@/i18n/config';

type C = Messages['compare'];

/* eslint-disable @typescript-eslint/no-explicit-any -- university/scholarship documents are schemaless */

type Kind = 'universities' | 'scholarships';

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const idOf = (doc: any): string => String(doc?._id ?? doc?.id ?? '');

/**
 * The compare list in localStorage holds a snapshot taken when the item was
 * added; reload each one so the table shows current figures. Falls back to the
 * snapshot if the record can't be fetched (e.g. it was archived).
 */
function useFreshDocs(kind: Kind, snapshots: any[]): any[] {
    const ids = snapshots.map(idOf).filter(Boolean).join(',');
    const [fresh, setFresh] = useState<Record<string, any>>({});
    useEffect(() => {
        if (!ids) return;
        let cancelled = false;
        const list = ids.split(',');
        Promise.all(list.map((id) => fetch(`/api/${kind}/${id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)))
            .then((docs) => {
                if (cancelled) return;
                const next: Record<string, any> = {};
                docs.forEach((doc, i) => { if (doc) next[list[i]] = doc; });
                setFresh((prev) => ({ ...prev, ...next }));
            });
        return () => { cancelled = true; };
    }, [kind, ids]);
    return snapshots.map((s) => fresh[idOf(s)] ?? s);
}

/** Indices of the best value — only when at least two items have one and they differ. */
function bestOf(values: (number | null)[], mode: 'min' | 'max'): Set<number> {
    const present = values.filter((v): v is number => v !== null);
    if (present.length < 2 || new Set(present).size < 2) return new Set();
    const target = mode === 'min' ? Math.min(...present) : Math.max(...present);
    return new Set(values.flatMap((v, i) => (v === target ? [i] : [])));
}

// ── Grid ────────────────────────────────────────────────────────────────────

interface Row { key: string; label: string; icon: LucideIcon; cell: (i: number) => React.ReactNode; best?: Set<number> }

/** Turns a per-document renderer into a per-column one. */
const perColumn = (docs: any[]) => (fn: (doc: any, i: number) => React.ReactNode) => (i: number) => fn(docs[i], i);
interface Group { title: string; rows: Row[] }

function Best({ children }: { children: React.ReactNode }) {
    const { t } = useI18n();
    return (
        <span className="-mx-2.5 -my-1.5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-emerald-50 px-2.5 py-1.5">
            {children}
            <span className="rounded-full bg-emerald-600 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-white">{t.compare.best}</span>
        </span>
    );
}

function CompareGrid({ headers, groups, footer, addCell }: {
    headers: React.ReactNode[];
    groups: Group[];
    footer: React.ReactNode[];
    addCell: React.ReactNode;
}) {
    const { t } = useI18n();
    const n = headers.length;
    const cell = 'flex snap-start items-center border-b border-slate-100 px-3 py-3.5 text-sm text-ink sm:px-4';
    const label = 'sticky left-0 z-10 flex items-center gap-2.5 border-b border-r border-slate-100 bg-white px-3 py-3.5 text-xs font-medium text-slate-600 sm:px-4 sm:text-sm';
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_12px_rgba(10,26,63,0.04)]">
            <div className="snap-x snap-mandatory scroll-pl-[var(--label-w)] overflow-x-auto [--col-w:158px] [--label-w:108px] sm:snap-none sm:[--col-w:220px] sm:[--label-w:210px]">
                <div
                    role="table"
                    className="grid"
                    style={{ gridTemplateColumns: `var(--label-w) repeat(${n}, minmax(var(--col-w), 1fr)) var(--col-w)` }}
                >
                    {/* Header row */}
                    <div className="sticky left-0 z-10 flex items-end border-b border-r border-slate-100 bg-white px-3 pb-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:px-4">
                        {t.compare.selected(n)}
                    </div>
                    {headers.map((h, i) => <div key={i} className="relative snap-start border-b border-slate-100 p-3 sm:p-4">{h}</div>)}
                    <div className="border-b border-slate-100 p-3 sm:p-4">{addCell}</div>

                    {groups.map((group) => (
                        <React.Fragment key={group.title}>
                            <div className="col-span-full border-b border-slate-100 bg-slate-50/80">
                                <span className="sticky left-0 inline-flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-brand sm:px-4">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {group.title}
                                </span>
                            </div>
                            {group.rows.map((row) => (
                                <React.Fragment key={row.key}>
                                    <div role="rowheader" className={label}>
                                        <span className={`hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:flex ${TONES.slate}`}>
                                            <row.icon aria-hidden="true" className="h-3.5 w-3.5" />
                                        </span>
                                        <span>{row.label}</span>
                                    </div>
                                    {headers.map((_, i) => (
                                        <div key={i} role="cell" className={cell}>
                                            {row.best?.has(i) ? <Best>{row.cell(i)}</Best> : row.cell(i)}
                                        </div>
                                    ))}
                                    <div className="border-b border-slate-100" />
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    ))}

                    {/* Actions */}
                    <div className="sticky left-0 z-10 flex items-center border-r border-slate-100 bg-white px-3 py-4 text-xs font-semibold text-slate-600 sm:px-4 sm:text-sm">{t.compare.apply}</div>
                    {footer.map((f, i) => <div key={i} className="snap-start px-3 py-4 sm:px-4">{f}</div>)}
                    <div />
                </div>
            </div>
        </div>
    );
}

function ItemHeader({ href, name, subtitle, country, tone, onRemove }: {
    href: string; name: string; subtitle: string; country?: string; tone: 'uni' | 'sch'; onRemove: () => void;
}) {
    const { t } = useI18n();
    return (
        <div className="pr-7">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl font-display text-sm font-bold text-white bg-gradient-to-br ${tone === 'uni' ? 'from-brand to-[#1d7fe0]' : 'from-violet-600 to-brand'}`}>
                {monogram(name)}
            </span>
            <p className="mt-3 line-clamp-2 font-display text-sm font-bold leading-snug text-ink sm:text-base" title={name}>{name}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{subtitle} {flagFor(country)}</p>
            <Link href={href} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                {t.compare.viewDetails} <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
            <button
                type="button"
                onClick={onRemove}
                aria-label={t.compare.removeItem(name)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink sm:right-3 sm:top-3"
            >
                <X aria-hidden="true" className="h-4 w-4" />
            </button>
        </div>
    );
}

function ApplyLink({ href }: { href: string | null }) {
    const { t } = useI18n();
    if (!href) return <NoData>{t.compare.noLink}</NoData>;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`${buttonClass.primary} h-10 w-full`}>
            {t.compare.apply} <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </a>
    );
}

function AddColumn({ kind }: { kind: Kind }) {
    const { t } = useI18n();
    return (
        <Link
            href={`/${kind}`}
            className="flex h-full min-h-[132px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-center text-sm font-semibold text-slate-500 transition-colors hover:border-blue-300 hover:text-brand"
        >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-brand"><Plus aria-hidden="true" className="h-4 w-4" /></span>
            {kind === 'universities' ? t.compare.addUniversity : t.compare.addScholarship}
        </Link>
    );
}

// ── Universities ────────────────────────────────────────────────────────────

const LEVELS = [['bachelor', 'Bachelor'], ['master', 'Master'], ['phd', 'PhD']] as const;
type Level = (typeof LEVELS)[number][0];

function universityGroups(docs: any[], level: Level, c: C, t: Messages, locale: Locale): Group[] {
    const each = perColumn(docs);
    const v = docs.map((u) => getVerification(u));
    const loc = intlLocale(locale);
    const money = (u: any, x: number) => formatAmount(x, u?.tuition?.currency || 'USD', loc);
    const institution = (u: any) => {
        const instType: string = u?.institutionType || 'University';
        if (locale === 'en') return [u?.type, instType.toLowerCase()].filter(Boolean).join(' ');
        if (instType !== 'University') return t.universities.institutionTypes[instType] ?? instType;
        return [u?.type && (t.universities.detail.ownership[u.type] ?? u.type), t.universities.detail.university].filter(Boolean).join(' ');
    };
    const range = (u: any, a: number, b: number) => (a === b ? money(u, a) : `${money(u, a)} – ${money(u, b)}`);

    const world = docs.map((u) => num(u?.ranking?.global));
    const tuition = docs.map((u) => num(u?.tuition?.[level]));
    const living = docs.map((u) => [num(u?.livingCostUSD?.min), num(u?.livingCostUSD?.max)] as const);
    const totals = docs.map((_, i) => (tuition[i] !== null && living[i][0] !== null && living[i][1] !== null ? [tuition[i]! + living[i][0]!, tuition[i]! + living[i][1]!] : null));
    // Costs are only ranked against each other when they're in the same currency.
    const sameCurrency = new Set(docs.map((u) => u?.tuition?.currency || 'USD')).size === 1;

    return [
        {
            title: c.groups.overview,
            rows: [
                {
                    key: 'rank', label: c.worldRank, icon: Trophy, best: bestOf(world, 'min'),
                    cell: each((u, i) => {
                        const year = String(u?.ranking?.source ?? '').match(/QS\D*(\d{4})/)?.[1];
                        const national = num(u?.ranking?.national);
                        if (world[i] !== null) return <span className="font-display font-bold">#{world[i]}{year && <span className="ml-1.5 text-xs font-medium text-slate-400">QS {year}</span>}<UnverifiedTag show={v[i].isUnverified('ranking.global')} /></span>;
                        if (national !== null) return <span className="text-slate-600">{c.nationalRank(national)}</span>;
                        return <NoData>{c.notRanked}</NoData>;
                    }),
                },
                {
                    key: 'type', label: c.institution, icon: Building2,
                    cell: each((u) => institution(u) || <NoData />),
                },
                {
                    key: 'verified', label: c.dataCheck, icon: ShieldCheck,
                    cell: each((_, i) => (v[i].isVerified
                        ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"><BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" /> {c.verified}</span>
                        : <span className="text-xs text-slate-400">{c.notVerified}</span>)),
                },
            ],
        },
        {
            title: c.groups.costs,
            rows: [
                {
                    key: 'tuition', label: c.tuition, icon: Wallet, best: sameCurrency ? bestOf(tuition, 'min') : undefined,
                    cell: each((u, i) => {
                        const fee = tuition[i];
                        if (fee === null) return <NoData />;
                        const o = u?.tuition?.original;
                        return (
                            <span>
                                <span className="font-semibold">{fee === 0 ? c.free : money(u, fee)}</span>
                                <UnverifiedTag show={v[i].isUnverified(`tuition.${level}` as never)} />
                                {o?.amount && o?.currency && <span className="block text-xs text-slate-400">{c.from(formatAmount(o.amount, o.currency, loc))}</span>}
                            </span>
                        );
                    }),
                },
                {
                    key: 'living', label: c.living, icon: Coins,
                    cell: each((u, i) => (living[i][0] !== null && living[i][1] !== null
                        ? <span>{range(u, living[i][0]!, living[i][1]!)}<UnverifiedTag show={v[i].isUnverified('livingCostUSD.min')} /></span>
                        : <NoData />)),
                },
                {
                    key: 'total', label: c.total, icon: Layers, best: sameCurrency ? bestOf(totals.map((x) => x?.[0] ?? null), 'min') : undefined,
                    cell: each((u, i) => (totals[i] ? <span className="font-display font-bold text-brand">{range(u, totals[i]![0], totals[i]![1])}</span> : <NoData />)),
                },
            ],
        },
        {
            title: c.groups.admissions,
            rows: [
                {
                    key: 'acceptance', label: c.acceptance, icon: Percent,
                    cell: each((u, i) => (num(u?.acceptanceRate) !== null ? <span>{u.acceptanceRate}%<UnverifiedTag show={v[i].isUnverified('acceptanceRate')} /></span> : <NoData />)),
                },
                {
                    key: 'gpa', label: c.gpaMin, icon: GraduationCap,
                    cell: each((u, i) => {
                        const min = num(u?.admissionRequirements?.gpa?.min);
                        return min !== null ? <span>{min} / {num(u?.admissionRequirements?.gpa?.scale) ?? 4}<UnverifiedTag show={v[i].isUnverified('admissionRequirements.gpa.min')} /></span> : <NoData />;
                    }),
                },
                {
                    key: 'english', label: c.english, icon: Languages,
                    cell: each((u, i) => {
                        const ielts = num(u?.admissionRequirements?.ielts?.min);
                        const toefl = num(u?.admissionRequirements?.toefl?.min);
                        const text = [ielts !== null && `IELTS ${ielts}`, toefl !== null && `TOEFL ${toefl}`].filter(Boolean).join(' · ');
                        return text ? <span>{text}<UnverifiedTag show={v[i].isUnverified('admissionRequirements.ielts.min')} /></span> : <NoData />;
                    }),
                },
                {
                    key: 'sat', label: c.sat, icon: BookOpen,
                    cell: each((u) => {
                        const min = num(u?.admissionRequirements?.sat?.min);
                        const max = num(u?.admissionRequirements?.sat?.max);
                        return min !== null ? (max !== null ? `${min}–${max}` : `${min}+`) : <NoData />;
                    }),
                },
            ],
        },
        {
            title: c.groups.students,
            rows: [
                {
                    key: 'students', label: c.totalStudents, icon: Users,
                    cell: each((u, i) => (num(u?.students?.total) !== null ? <span>{formatNumber(locale, u.students.total)}<UnverifiedTag show={v[i].isUnverified('students.total')} /></span> : <NoData />)),
                },
                {
                    key: 'intl', label: c.international, icon: Globe2,
                    cell: each((u, i) => {
                        const intl = num(u?.students?.international);
                        const total = num(u?.students?.total);
                        if (intl === null) return <NoData />;
                        return <span>{formatNumber(locale, intl)}{total ? <span className="ml-1 text-xs text-slate-400">({Math.round((intl / total) * 100)}%)</span> : null}<UnverifiedTag show={v[i].isUnverified('students.international')} /></span>;
                    }),
                },
                {
                    key: 'language', label: c.teachingLanguage, icon: Languages,
                    cell: each((u) => (Array.isArray(u?.languages) && u.languages.length ? u.languages.join(', ') : <NoData />)),
                },
            ],
        },
        {
            title: c.groups.programs,
            rows: [
                {
                    key: 'programs', label: c.programs, icon: BookOpen,
                    cell: each((u) => {
                        const programs: string[] = Array.isArray(u?.programs) ? u.programs : [];
                        if (!programs.length) return <NoData />;
                        return (
                            <div className="flex flex-wrap gap-1.5">
                                {programs.slice(0, 4).map((p) => <span key={p} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-brand">{p}</span>)}
                                {programs.length > 4 && <Link href={`/universities/${idOf(u)}`} className="px-1 text-xs font-semibold text-brand hover:underline">{c.more(programs.length - 4)}</Link>}
                            </div>
                        );
                    }),
                },
            ],
        },
    ];
}

// ── Scholarships ────────────────────────────────────────────────────────────

const COVERAGE = ['tuition', 'stipend', 'travel', 'insurance', 'arrivalAllowance'] as const;

function scholarshipGroups(docs: any[], c: C, t: Messages, locale: Locale): Group[] {
    const each = perColumn(docs);
    const loc = intlLocale(locale);
    const levels = (s: any): string[] => (Array.isArray(s?.studyLevel) ? s.studyLevel : s?.studyLevel ? [s.studyLevel] : []);
    return [
        {
            title: c.groups.overview,
            rows: [
                { key: 'provider', label: c.provider, icon: Building2, cell: each((s) => s?.provider?.name ? <span>{s.provider.name}{s.provider.type && <span className="block text-xs text-slate-400">{s.provider.type}</span>}</span> : <NoData />) },
                { key: 'country', label: c.country, icon: MapPin, cell: each((s) => (s?.country ? `${flagFor(s.country)} ${localizeCountry(s.country, locale)}` : <NoData />)) },
                { key: 'funding', label: c.funding, icon: Award, cell: each((s) => (s?.award?.type ? <FundingPill type={s.award.type} /> : <NoData>{c.notStated}</NoData>)) },
                {
                    key: 'levels', label: c.studyLevels, icon: GraduationCap,
                    cell: each((s) => (levels(s).length
                        ? <div className="flex flex-wrap gap-1.5">{levels(s).map((l) => <span key={l} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-brand">{t.scholarships.studyLevels[l] ?? l}</span>)}</div>
                        : <NoData />)),
                },
            ],
        },
        {
            title: c.groups.money,
            rows: [
                {
                    // No "best" here: amounts are in different currencies and periods.
                    key: 'amount', label: c.award, icon: Coins,
                    cell: each((s) => {
                        const v = s?.award?.estimatedValue;
                        if (!v || !(v.min || v.max)) return <NoData>{c.seeWebsite}</NoData>;
                        const text = v.min && v.max && v.min !== v.max ? `${formatAmount(v.min, v.currency, loc)} – ${formatAmount(v.max, v.currency, loc)}` : formatAmount(v.max || v.min, v.currency, loc);
                        return <span className="font-display font-bold">{text}</span>;
                    }),
                },
                {
                    key: 'covered', label: c.whatsCovered, icon: Wallet,
                    cell: each((s) => (
                        <ul className="space-y-1">
                            {COVERAGE.map((k) => {
                                const val = s?.award?.[k];
                                const Icon = val === true ? CheckCircle2 : val === false ? XCircle : CircleDashed;
                                return (
                                    <li key={k} className={`flex items-center gap-1.5 text-xs ${val === true ? 'text-ink' : 'text-slate-400'}`}>
                                        <Icon aria-label={val === true ? c.covered : val === false ? c.notCovered : c.notStated} className={`h-3.5 w-3.5 shrink-0 ${val === true ? 'text-emerald-600' : val === false ? 'text-rose-500' : 'text-slate-300'}`} />
                                        {c.coverage[k]}
                                    </li>
                                );
                            })}
                        </ul>
                    )),
                },
            ],
        },
        {
            title: c.groups.eligibility,
            rows: [
                { key: 'degree', label: c.minDegree, icon: GraduationCap, cell: each((s) => s?.requirements?.education?.minimumDegree || <NoData>{c.notStated}</NoData>) },
                { key: 'age', label: c.ageLimit, icon: User, cell: each((s) => s?.requirements?.age?.description || (num(s?.requirements?.age?.max) !== null ? c.upTo(s.requirements.age.max) : <NoData>{c.notStated}</NoData>)) },
                {
                    key: 'nationality', label: c.nationality, icon: Hand,
                    cell: each((s) => {
                        const text = s?.requirements?.nationality?.eligibleCountries;
                        return text ? <span className="line-clamp-3" title={text}>{text}</span> : <NoData>{c.notStated}</NoData>;
                    }),
                },
            ],
        },
        {
            title: c.groups.dates,
            rows: [
                { key: 'deadline', label: c.deadline, icon: CalendarClock, cell: each((s) => <DeadlinePill key="d" deadlines={s?.deadlines} />) },
                { key: 'duration', label: c.duration, icon: Clock, cell: each((s) => s?.duration || <NoData>{c.notStated}</NoData>) },
                { key: 'intake', label: c.intake, icon: CalendarClock, cell: each((s) => s?.intake || <NoData>{c.notStated}</NoData>) },
            ],
        },
    ];
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ComparePage() {
    const { ready, compareList, scholarshipCompareList, removeFromCompare, removeFromScholarshipCompare, clearCompare } = useCompare();
    const [pickedTab, setPickedTab] = useState<Kind | null>(null);
    const [level, setLevel] = useState<Level>('bachelor');
    const [confirmClear, setConfirmClear] = useState(false);
    const { t, locale } = useI18n();
    const c = t.compare;

    const universities = useFreshDocs('universities', compareList);
    const scholarships = useFreshDocs('scholarships', scholarshipCompareList);
    // Open the tab that has items when the user hasn't picked one.
    const tab: Kind = pickedTab ?? (universities.length === 0 && scholarships.length > 0 ? 'scholarships' : 'universities');
    const isUni = tab === 'universities';
    const docs = isUni ? universities : scholarships;

    const switchTab = (next: Kind) => {
        setPickedTab(next);
        setConfirmClear(false);
    };

    const tabs: [Kind, string, LucideIcon, number][] = [
        ['universities', c.universities, Building2, universities.length],
        ['scholarships', c.scholarships, Award, scholarships.length],
    ];

    return (
        <div className="min-h-screen bg-[#f7f9fc] px-4 pb-10 pt-5 font-body md:px-8 md:py-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{c.title}</h1>
                        <p className="mt-1 text-sm text-slate-500">{c.lead}</p>
                    </div>
                    <div role="tablist" aria-label={c.whatToCompare} className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/60 p-1 md:w-[360px]">
                        {tabs.map(([key, labelText, Icon, count]) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={tab === key}
                                onClick={() => switchTab(key)}
                                className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${tab === key ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink'}`}
                            >
                                <Icon aria-hidden="true" className="h-4 w-4" /> {labelText}
                                <span className={`rounded-full px-1.5 text-xs ${tab === key ? 'bg-blue-50 text-brand' : 'bg-white/70 text-slate-500'}`}>{count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {!ready ? (
                    <div className="h-80 animate-pulse rounded-3xl border border-slate-200/80 bg-white" />
                ) : docs.length === 0 ? (
                    <div className="flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-[0_4px_12px_rgba(10,26,63,0.04)]">
                        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${TONES.blue}`}><Scale aria-hidden="true" className="h-6 w-6" /></span>
                        <h2 className="mt-4 font-display text-lg font-bold text-ink">{c.emptyTitle}</h2>
                        <p className="mt-1 max-w-sm text-sm text-slate-500">{isUni ? c.emptyUniversities : c.emptyScholarships}</p>
                        <div className="mt-5 flex flex-wrap justify-center gap-3">
                            <Link href="/universities" className={isUni ? buttonClass.primary : buttonClass.secondary}>{c.browseUniversities}</Link>
                            <Link href="/scholarships" className={isUni ? buttonClass.secondary : buttonClass.primary}>{c.browseScholarships}</Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            {isUni ? (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="hidden sm:inline">{c.tuitionFor}</span>
                                    <div role="radiogroup" aria-label={c.degreeForTuition} className="flex gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/80">
                                        {LEVELS.map(([l]) => (
                                            <button
                                                key={l}
                                                type="button"
                                                role="radio"
                                                aria-checked={level === l}
                                                onClick={() => setLevel(l)}
                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${level === l ? 'bg-brand text-white' : 'text-slate-500 hover:text-ink'}`}
                                            >
                                                {t.universities.detail.levels[l]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500">{c.currencyNote}</p>
                            )}
                            {confirmClear ? (
                                <span className="flex items-center gap-3 text-sm">
                                    <span className="text-slate-600">{c.removeAll(docs.length)}</span>
                                    <button type="button" onClick={() => setConfirmClear(false)} className="font-semibold text-slate-500 hover:text-ink">{c.cancel}</button>
                                    <button
                                        type="button"
                                        onClick={() => { clearCompare(isUni ? 'university' : 'scholarship'); setConfirmClear(false); }}
                                        className="font-semibold text-rose-600 hover:underline"
                                    >
                                        {c.clearAll}
                                    </button>
                                </span>
                            ) : (
                                <button type="button" onClick={() => setConfirmClear(true)} className="text-sm font-semibold text-slate-500 hover:text-rose-600">{c.clearAll}</button>
                            )}
                        </div>
                        {docs.length > 1 && <p className="mb-2 text-xs text-slate-400 sm:hidden">{c.swipe}</p>}

                        <CompareGrid
                            headers={docs.map((d) => (isUni ? (
                                <ItemHeader
                                    key={idOf(d)} tone="uni" name={d?.name || c.university} href={`/universities/${idOf(d)}`}
                                    subtitle={[d?.location?.city, d?.location?.country && localizeCountry(d.location.country, locale)].filter(Boolean).join(', ')} country={d?.location?.country}
                                    onRemove={() => removeFromCompare(idOf(d))}
                                />
                            ) : (
                                <ItemHeader
                                    key={idOf(d)} tone="sch" name={d?.scholarshipName || c.scholarship} href={`/scholarships/${idOf(d)}`}
                                    subtitle={d?.country ? localizeCountry(d.country, locale) : ''} country={d?.country}
                                    onRemove={() => removeFromScholarshipCompare(idOf(d))}
                                />
                            )))}
                            groups={isUni ? universityGroups(docs, level, c, t, locale) : scholarshipGroups(docs, c, t, locale)}
                            footer={docs.map((d) => <ApplyLink key={idOf(d)} href={isUni ? d?.applicationLink || d?.website || null : d?.applicationLink || d?.officialWebsite || null} />)}
                            addCell={<AddColumn kind={tab} />}
                        />
                        {isUni && (
                            <p className="mt-3 text-xs text-slate-500">
                                {c.bestNote}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
