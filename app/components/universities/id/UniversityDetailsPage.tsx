'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    BookOpen, CalendarDays, Check, ClipboardCheck, ClipboardList, ExternalLink, Globe2, GraduationCap, Heart,
    Info, Languages, Loader2, MapPin, Percent, Plus, Scale, Search, Trophy, Users, Wallet,
} from 'lucide-react';
import { useCompare } from '@/lib/useCompare';
import { useFavorites } from '@/lib/useFavorites';
import { useUniList } from '@/lib/useUniList';
import { formatCheckedAt, getVerification, type KeyField } from '@/lib/verification';
import { formatAmount } from '@/lib/scholarshipDisplay';
import { flagFor } from '@/components/profile/countryList';
import {
    buttonClass, Chip, DataSourcesCard, DeadlineTimeline, DetailCard, DetailTopBar, ExpandableText, FactTile,
    MobileActionBar, monogram, NoData, StatusPill, useStudentProfile, VerifiedPill,
    type CheckStatus, type ProfileState, type StudentProfile,
} from '@/components/common/detailUi';
import UnverifiedTag from './UnverifiedTag';

/* eslint-disable @typescript-eslint/no-explicit-any -- university documents are schemaless (strict: false) */

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// ── Eligibility: the student's scores against the published figures ─────────

interface EligibilityRow {
    key: string;
    label: string;
    required: React.ReactNode;
    yours: React.ReactNode;
    status: CheckStatus;
    statusLabel: string;
    unverified: boolean;
}

function buildEligibility(uni: any, profile: StudentProfile | null, isUnverified: (f: KeyField) => boolean): EligibilityRow[] {
    const req = uni.admissionRequirements ?? {};
    const rows: EligibilityRow[] = [];
    const signedIn = profile !== null;

    // GPA — only comparable when the university uses the same 4.0 scale as the profile.
    const gpaMin = num(req.gpa?.min);
    const scale = num(req.gpa?.scale) ?? 4;
    const userGpa = num(profile?.gpa);
    let gpa: [CheckStatus, string] = ['none', ''];
    if (gpaMin !== null && signedIn) {
        if (scale !== 4) gpa = ['check', 'Different scale'];
        else if (userGpa === null) gpa = ['unknown', 'Add to profile'];
        else gpa = userGpa >= gpaMin ? ['met', 'Meets minimum'] : ['below', 'Below minimum'];
    }
    rows.push({
        key: 'gpa', label: 'GPA',
        required: gpaMin !== null ? `${gpaMin} / ${scale}` : <NoData />,
        yours: userGpa !== null ? `${userGpa} / 4.0` : '—',
        status: gpa[0], statusLabel: gpa[1],
        unverified: isUnverified('admissionRequirements.gpa.min'),
    });

    // English — IELTS scores are compared with the IELTS minimum only, TOEFL with TOEFL.
    const ielts = num(req.ielts?.min);
    const toefl = num(req.toefl?.min);
    const test = profile?.englishTest?.type ?? null;
    const score = num(profile?.englishTest?.score);
    let english: [CheckStatus, string] = ['none', ''];
    if ((ielts !== null || toefl !== null) && signedIn) {
        const needed = test === 'IELTS' ? ielts : test === 'TOEFL' ? toefl : null;
        if (!test || score === null) english = ['unknown', 'Add to profile'];
        else if (needed === null) english = ['check', `No ${test} minimum`];
        else english = score >= needed ? ['met', 'Meets minimum'] : ['below', 'Below minimum'];
    }
    rows.push({
        key: 'english', label: 'English (IELTS / TOEFL)',
        required: [ielts !== null && `IELTS ${ielts}`, toefl !== null && `TOEFL ${toefl}`].filter(Boolean).join(' · ') || <NoData />,
        yours: test && score !== null ? `${test} ${score}` : '—',
        status: english[0], statusLabel: english[1],
        unverified: isUnverified('admissionRequirements.ielts.min') || isUnverified('admissionRequirements.toefl.min'),
    });

    // SAT — usually published as the middle 50% of admitted students, not a hard minimum.
    const satMin = num(req.sat?.min);
    const satMax = num(req.sat?.max);
    if (satMin !== null) {
        const userSat = num(profile?.sat);
        let sat: [CheckStatus, string] = ['none', ''];
        if (signedIn) {
            if (userSat === null) sat = ['unknown', 'Add to profile'];
            else if (satMax !== null) sat = userSat >= satMax ? ['met', 'Above range'] : userSat >= satMin ? ['met', 'In range'] : ['below', 'Below range'];
            else sat = userSat >= satMin ? ['met', 'Meets minimum'] : ['below', 'Below minimum'];
        }
        rows.push({
            key: 'sat', label: satMax !== null ? 'SAT (middle 50%)' : 'SAT',
            required: satMax !== null ? `${satMin}–${satMax}` : `${satMin}+`,
            yours: userSat !== null ? String(userSat) : '—',
            status: sat[0], statusLabel: sat[1],
            unverified: isUnverified('admissionRequirements.sat.min'),
        });
    }

    const actMin = num(req.act?.min);
    const actMax = num(req.act?.max);
    if (actMin !== null) {
        rows.push({
            key: 'act', label: actMax !== null ? 'ACT (middle 50%)' : 'ACT',
            required: actMax !== null ? `${actMin}–${actMax}` : `${actMin}+`,
            yours: signedIn ? 'Not in profile' : '—',
            status: 'none', statusLabel: '', unverified: false,
        });
    }
    return rows;
}

type Outlook = { level: 'reach' | 'target' | 'likely'; reason: string };

/** A rough category, not a probability: selectivity plus whether the student meets the published figures. */
function admissionOutlook(acceptanceRate: number | null, rows: EligibilityRow[]): Outlook | null {
    const checked = rows.filter((r) => r.status === 'met' || r.status === 'below');
    if (acceptanceRate === null || checked.length === 0) return null;
    if (checked.some((r) => r.status === 'below')) return { level: 'reach', reason: "You're below at least one published figure." };
    if (acceptanceRate < 20) return { level: 'reach', reason: `Highly selective (${acceptanceRate}% admitted) — most qualified applicants aren't admitted.` };
    if (acceptanceRate < 50) return { level: 'target', reason: `You meet the published figures; ${acceptanceRate}% of applicants are admitted.` };
    return { level: 'likely', reason: `You meet the published figures and ${acceptanceRate}% of applicants are admitted.` };
}

function Ring({ met, total }: { met: number; total: number }) {
    const r = 30;
    const c = 2 * Math.PI * r;
    const all = met === total;
    return (
        <div className="relative h-[76px] w-[76px] shrink-0">
            <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="38" cy="38" r={r} strokeWidth="7" fill="none" className="stroke-slate-100" />
                <circle cx="38" cy="38" r={r} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (met / total) * c} className={all ? 'stroke-emerald-500' : 'stroke-amber-500'} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-ink">{met}/{total}</span>
        </div>
    );
}

const OUTLOOK_STEPS = [
    { level: 'reach', label: 'Reach', active: 'bg-rose-500', text: 'text-rose-600' },
    { level: 'target', label: 'Target', active: 'bg-brand', text: 'text-brand' },
    { level: 'likely', label: 'Likely', active: 'bg-emerald-500', text: 'text-emerald-600' },
] as const;

function FitPanel({ state, rows, outlook, rateUnverified }: { state: ProfileState; rows: EligibilityRow[]; outlook: Outlook | null; rateUnverified: boolean }) {
    const box = 'rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5';
    if (state.status === 'loading') {
        return <div className={`${box} flex items-center justify-center py-10`}><Loader2 aria-label="Loading your profile" className="h-5 w-5 animate-spin text-slate-400" /></div>;
    }
    if (state.status === 'guest') {
        return (
            <div className={box}>
                <p className="font-display text-base font-bold text-ink">See how you compare</p>
                <p className="mt-1 text-sm text-slate-500">Sign in to compare your GPA, English and SAT scores with this university&apos;s published figures.</p>
                <Link href="/login" className={`${buttonClass.primary} mt-4 h-10`}>Sign in</Link>
            </div>
        );
    }
    const checked = rows.filter((r) => r.status === 'met' || r.status === 'below');
    const met = checked.filter((r) => r.status === 'met').length;
    if (checked.length === 0) {
        const universityHasFigures = rows.some((r) => r.status !== 'none');
        return (
            <div className={box}>
                <p className="font-display text-base font-bold text-ink">Your fit</p>
                <p className="mt-1 text-sm text-slate-500">
                    {universityHasFigures
                        ? 'Add your GPA and test scores to your profile to see how you compare.'
                        : "This university hasn't published minimum scores we can compare against."}
                </p>
                {universityHasFigures && <Link href="/student" className={`${buttonClass.secondary} mt-4 h-10`}>Update profile</Link>}
            </div>
        );
    }
    return (
        <div className={`${box} space-y-5`}>
            <div className="flex items-center gap-4">
                <Ring met={met} total={checked.length} />
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Eligibility</p>
                    <p className={`font-display text-base font-bold ${met === checked.length ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {met === checked.length ? 'Meets all checked figures' : `Meets ${met} of ${checked.length}`}
                    </p>
                    <p className="text-xs text-slate-500">Based on your profile</p>
                </div>
            </div>
            <div>
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Admission outlook</p>
                    <span title="A rough guide from the acceptance rate and the published figures, not a prediction." className="text-slate-400">
                        <Info aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                </div>
                {outlook ? (
                    <>
                        <div className="mt-2 grid grid-cols-3 gap-1.5">
                            {OUTLOOK_STEPS.map((s) => (
                                <div key={s.level}>
                                    <div className={`h-1.5 rounded-full ${outlook.level === s.level ? s.active : 'bg-slate-200'}`} />
                                    <p className={`mt-1.5 text-center text-xs font-semibold ${outlook.level === s.level ? s.text : 'text-slate-400'}`}>{s.label}</p>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                            {outlook.reason}{rateUnverified && ' The acceptance rate is unverified.'}
                        </p>
                    </>
                ) : (
                    <p className="mt-1 text-xs text-slate-500">Not enough data — the acceptance rate isn&apos;t published.</p>
                )}
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const LEVELS = [['bachelor', 'Bachelor'], ['master', 'Master'], ['phd', 'PhD']] as const;
type Level = (typeof LEVELS)[number][0];
const PROGRAMS_PREVIEW = 12;

export default function UniversityDetailsPage({ university }: { university: any }) {
    const router = useRouter();
    const { addToCompare, compareList } = useCompare();
    const { toggleInList, isInList } = useUniList();

    const uniId = String(university?._id ?? '');
    const name: string = university?.name || 'Unknown university';
    const { isFavorite, toggleFavorite, loading: favLoading } = useFavorites(uniId, 'university');
    const inList = isInList(uniId, 'university');
    const isCompared = compareList.some((item) => (item.id || item._id) === uniId);

    const profileState = useStudentProfile();
    const profile = profileState.status === 'ready' ? profileState.profile : null;

    const verification = getVerification(university);
    const unverified = verification.isUnverified;
    const checkedLabel = verification.checkedAt ? formatCheckedAt(verification.checkedAt) : null;

    const city: string = university?.location?.city ?? '';
    const country: string = university?.location?.country ?? '';
    const coords = university?.location?.coordinates;
    const mapHref = num(coords?.lat) !== null && num(coords?.lng) !== null
        ? `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=15/${coords.lat}/${coords.lng}`
        : null;

    const worldRank = num(university?.ranking?.global);
    const nationalRank = num(university?.ranking?.national);
    const rankYear = String(university?.ranking?.source ?? '').match(/QS\D*(\d{4})/)?.[1];
    const acceptanceRate = num(university?.acceptanceRate);
    const totalStudents = num(university?.students?.total);
    const intlStudents = num(university?.students?.international);
    const languages: string[] = Array.isArray(university?.languages) ? university.languages : [];
    const programs: string[] = Array.isArray(university?.programs) ? university.programs : [];
    const degreeLevels: string[] = Array.isArray(university?.degreeLevels) ? university.degreeLevels : [];
    const otherExams: string[] = Array.isArray(university?.admissionRequirements?.otherExams) ? university.admissionRequirements.otherExams : [];
    const deadlines = Array.isArray(university?.applicationDeadlines) ? university.applicationDeadlines : [];
    const admissionsUrl: string | null = university?.applicationLink || university?.website || null;
    const institution = [university?.type, (university?.institutionType || 'University').toLowerCase()].filter(Boolean).join(' ');

    const rows = buildEligibility(university, profile, unverified);
    const outlook = admissionOutlook(acceptanceRate, rows);

    // Cost — tuition per degree level; default to the level in the student's profile.
    const tuitionOf = (l: Level) => num(university?.tuition?.[l]);
    const availableLevels = LEVELS.filter(([l]) => tuitionOf(l) !== null);
    const preferredLevel = LEVELS.find(([, label]) => label === profile?.programLevel)?.[0];
    const [pickedLevel, setPickedLevel] = useState<Level | null>(null);
    const level: Level = pickedLevel
        ?? (preferredLevel && tuitionOf(preferredLevel) !== null ? preferredLevel : availableLevels[0]?.[0] ?? 'bachelor');
    const tuition = tuitionOf(level);
    const currency: string = university?.tuition?.currency || 'USD';
    const original = university?.tuition?.original;
    const livingMin = num(university?.livingCostUSD?.min);
    const livingMax = num(university?.livingCostUSD?.max);
    const money = (v: number) => formatAmount(v, currency);
    const range = (a: number, b: number) => (a === b ? money(a) : `${money(a)} – ${money(b)}`);

    const [programQuery, setProgramQuery] = useState('');
    const [showAllPrograms, setShowAllPrograms] = useState(false);
    const filteredPrograms = programs.filter((p) => p.toLowerCase().includes(programQuery.trim().toLowerCase()));
    const visiblePrograms = showAllPrograms || programQuery ? filteredPrograms : filteredPrograms.slice(0, PROGRAMS_PREVIEW);

    const sources = [
        ...Object.values((university?.verification?.fields ?? {}) as Record<string, { source?: string[] }>).flatMap((f) => f.source ?? []),
        ...(Array.isArray(university?.sources) ? university.sources : []),
    ];

    const handleAddToList = () => uniId && toggleInList(uniId, 'university', name);
    const handleCompare = () => {
        addToCompare(university);
        router.push('/compare');
    };

    const saveButton = (compact: boolean) => (
        <button
            type="button"
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'Remove from saved' : 'Save'}
            aria-pressed={isFavorite}
            className={compact ? (isFavorite ? buttonClass.savedIcon : buttonClass.icon) : isFavorite ? `${buttonClass.secondary} border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-50` : buttonClass.secondary}
        >
            {favLoading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Heart aria-hidden="true" className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />}
            {!compact && (isFavorite ? 'Saved' : 'Save')}
        </button>
    );
    const listButton = (
        <button type="button" onClick={handleAddToList} className={`${inList ? buttonClass.success : buttonClass.secondary} flex-1 md:flex-none`}>
            {inList ? <Check aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}
            {inList ? 'In your list' : 'Add to List'}
        </button>
    );
    const compareButton = (
        <button type="button" onClick={handleCompare} className={`${isCompared ? buttonClass.success : buttonClass.primary} flex-1 md:flex-none`}>
            <Scale aria-hidden="true" className="h-4 w-4" /> {isCompared ? 'In comparison' : 'Compare'}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f7f9fc] px-4 pb-24 pt-5 font-body md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">
                <DetailTopBar
                    backHref="/universities"
                    backLabel="Universities"
                    title={name}
                    actions={<>{listButton}{saveButton(false)}{compareButton}</>}
                    mobileActions={saveButton(true)}
                />

                {/* Hero */}
                <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-4">
                                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[#1d7fe0] font-display text-lg font-bold text-white shadow-md shadow-blue-900/10 sm:h-[72px] sm:w-[72px] sm:text-xl">
                                    {monogram(name)}
                                </span>
                                <div className="min-w-0">
                                    <h1 className="font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">{name}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        {verification.isVerified && checkedLabel && (
                                            <VerifiedPill
                                                label={`Verified · ${checkedLabel}`}
                                                title="Every key figure on this page was checked against the university's official sources on this date. Rechecked yearly."
                                            />
                                        )}
                                        {institution && <Chip>{institution}</Chip>}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600">
                                {(city || country) && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin aria-hidden="true" className="h-4 w-4 text-slate-400" />
                                        {mapHref ? (
                                            <a href={mapHref} target="_blank" rel="noopener noreferrer" className="hover:text-brand hover:underline">{[city, country].filter(Boolean).join(', ')}</a>
                                        ) : [city, country].filter(Boolean).join(', ')}
                                        {' '}{flagFor(country)}
                                    </span>
                                )}
                                {worldRank !== null ? (
                                    <Chip className="bg-amber-50 text-amber-800">
                                        <Trophy aria-hidden="true" className="h-3.5 w-3.5" /> World rank #{worldRank}{rankYear && ` · QS ${rankYear}`}
                                        <UnverifiedTag show={unverified('ranking.global')} />
                                    </Chip>
                                ) : nationalRank !== null ? (
                                    <Chip className="bg-blue-50 text-brand"><Trophy aria-hidden="true" className="h-3.5 w-3.5" /> National rank #{nationalRank}</Chip>
                                ) : (
                                    <Chip className="bg-slate-100 text-slate-500"><Trophy aria-hidden="true" className="h-3.5 w-3.5" /> Not ranked</Chip>
                                )}
                            </div>

                            {university?.description && <ExpandableText text={university.description} className="mt-4 max-w-2xl" />}

                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                                {university?.website && (
                                    <a href={university.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand hover:underline">
                                        <Globe2 aria-hidden="true" className="h-4 w-4" /> Official website <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {university?.applicationLink && university.applicationLink !== university.website && (
                                    <a href={university.applicationLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brand hover:underline">
                                        <ClipboardCheck aria-hidden="true" className="h-4 w-4" /> Admissions <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:w-[320px] lg:shrink-0">
                            <FitPanel state={profileState} rows={rows} outlook={outlook} rateUnverified={unverified('acceptanceRate')} />
                        </div>
                    </div>
                </section>

                {/* Key facts */}
                <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:gap-4 lg:grid-cols-4">
                    <FactTile icon={Percent} tone="violet" label="Acceptance rate">
                        {acceptanceRate !== null ? <>{acceptanceRate}%<UnverifiedTag show={unverified('acceptanceRate')} /></> : <NoData />}
                    </FactTile>
                    <FactTile icon={Users} tone="sky" label="Students">
                        {totalStudents !== null ? <>{totalStudents.toLocaleString('en-US')}<UnverifiedTag show={unverified('students.total')} /></> : <NoData />}
                    </FactTile>
                    <FactTile icon={Globe2} tone="emerald" label="International">
                        {intlStudents !== null ? (
                            <>
                                {intlStudents.toLocaleString('en-US')}
                                {totalStudents ? <span className="ml-1 text-xs font-medium text-slate-400">({Math.round((intlStudents / totalStudents) * 100)}%)</span> : null}
                                <UnverifiedTag show={unverified('students.international')} />
                            </>
                        ) : <NoData />}
                    </FactTile>
                    <FactTile icon={Languages} tone="amber" label={languages.length > 1 ? 'Languages' : 'Language'}>
                        {languages.length ? <span className="text-sm">{languages.join(', ')}</span> : <NoData />}
                    </FactTile>
                </div>

                {/* Main: two columns on desktop; one column in reading order on phones */}
                <div className="mt-5 flex flex-col gap-4 md:mt-6 md:gap-6 lg:grid lg:grid-cols-12 lg:items-start">
                    <div className="contents lg:col-span-8 lg:flex lg:flex-col lg:gap-6">
                        <DetailCard
                            icon={ClipboardList}
                            tone="blue"
                            title="Your eligibility"
                            subtitle="Your profile against the university's published figures"
                            defaultOpen
                            className="order-1 lg:order-none"
                        >
                            <div className="overflow-hidden rounded-2xl border border-slate-200/80 text-sm">
                                <div aria-hidden="true" className="hidden grid-cols-[1.3fr_1fr_1fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:grid">
                                    <span>Criterion</span><span>Required</span><span>Your score</span><span className="w-32 text-right">Status</span>
                                </div>
                                <ul className="divide-y divide-slate-100">
                                    {rows.map((row) => (
                                        <li key={row.key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 px-4 py-3 sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:gap-4 sm:py-3.5">
                                            <span className="font-semibold text-ink">{row.label}</span>
                                            <span className="col-start-1 text-slate-600 sm:col-start-auto">
                                                <span className="text-xs text-slate-400 sm:hidden">Required </span>{row.required}
                                                <UnverifiedTag show={row.unverified} />
                                            </span>
                                            <span className="col-start-1 text-slate-600 sm:col-start-auto">
                                                <span className="text-xs text-slate-400 sm:hidden">You </span>{row.yours}
                                            </span>
                                            <span className="col-start-2 row-span-3 row-start-1 text-right sm:col-start-auto sm:row-span-1 sm:row-start-auto sm:w-32">
                                                <StatusPill status={row.status} label={row.statusLabel} />
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="mt-3 flex gap-2 text-xs leading-relaxed text-slate-500">
                                <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                Minimums differ between programmes. Figures tagged Unverified haven&apos;t been checked against official sources yet.
                            </p>
                        </DetailCard>

                        <DetailCard
                            icon={BookOpen}
                            tone="violet"
                            title="Programs"
                            subtitle={programs.length ? `${programs.length} listed${degreeLevels.length ? ` · ${degreeLevels.join(', ')}` : ''}` : undefined}
                            className="order-3 lg:order-none"
                        >
                            {programs.length === 0 ? (
                                <NoData>No programmes listed yet</NoData>
                            ) : (
                                <>
                                    {programs.length > PROGRAMS_PREVIEW && (
                                        <label className="relative mb-4 block">
                                            <span className="sr-only">Search programmes</span>
                                            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="search"
                                                value={programQuery}
                                                onChange={(e) => setProgramQuery(e.target.value)}
                                                placeholder="Search programmes"
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                                            />
                                        </label>
                                    )}
                                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                        {visiblePrograms.map((p) => (
                                            <li key={p} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-700">
                                                <GraduationCap aria-hidden="true" className="h-4 w-4 shrink-0 text-violet-500" /> <span className="min-w-0 truncate">{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {filteredPrograms.length === 0 && <p className="text-sm text-slate-500">No programmes match “{programQuery}”.</p>}
                                    {!programQuery && programs.length > PROGRAMS_PREVIEW && (
                                        <button type="button" onClick={() => setShowAllPrograms((s) => !s)} className="mt-3 w-full rounded-xl bg-blue-50 py-2.5 text-sm font-semibold text-brand hover:bg-blue-100">
                                            {showAllPrograms ? 'Show fewer' : `Show all ${programs.length} programmes`}
                                        </button>
                                    )}
                                </>
                            )}
                        </DetailCard>

                        <DetailCard icon={ClipboardCheck} tone="emerald" title="Application requirements" className="order-4 lg:order-none">
                            {otherExams.length > 0 && (
                                <ul className="mb-4 space-y-2">
                                    {otherExams.map((exam) => (
                                        <li key={exam} className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3 text-sm">
                                            <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-600" />
                                            <span className="font-medium text-ink">{exam}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Documents (transcripts, essays, recommendations) vary by programme and aren&apos;t in our database yet.
                                </p>
                                {admissionsUrl && (
                                    <a href={admissionsUrl} target="_blank" rel="noopener noreferrer" className={`${buttonClass.secondary} h-10 shrink-0`}>
                                        Admissions page <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </DetailCard>

                        <DetailCard icon={CalendarDays} tone="rose" title="Application deadlines" className="order-5 lg:order-none">
                            <DeadlineTimeline items={deadlines} emptyText="Dates not announced — deadlines change every year, check the admissions page." />
                        </DetailCard>
                    </div>

                    <div className="contents lg:sticky lg:top-6 lg:col-span-4 lg:flex lg:flex-col lg:gap-6">
                        <DetailCard icon={Wallet} tone="amber" title="Cost of attendance" subtitle="Estimated, per year" defaultOpen className="order-2 lg:order-none">
                            {availableLevels.length > 1 && (
                                <div role="tablist" aria-label="Degree level" className="mb-4 grid grid-flow-col gap-1 rounded-xl bg-slate-100 p-1">
                                    {availableLevels.map(([l, label]) => (
                                        <button
                                            key={l}
                                            type="button"
                                            role="tab"
                                            aria-selected={level === l}
                                            onClick={() => setPickedLevel(l)}
                                            className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${level === l ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <dl className="space-y-3 text-sm">
                                <div className="flex items-baseline justify-between gap-3">
                                    <dt className="text-slate-600">Tuition</dt>
                                    <dd className="text-right font-display text-lg font-bold text-brand">
                                        {tuition === null ? <NoData /> : tuition === 0 ? 'Free' : money(tuition)}
                                        <UnverifiedTag show={unverified(`tuition.${level}` as KeyField)} />
                                    </dd>
                                </div>
                                <div className="flex items-baseline justify-between gap-3">
                                    <dt className="text-slate-600">Living costs</dt>
                                    <dd className="text-right font-semibold text-ink">
                                        {livingMin !== null && livingMax !== null ? range(livingMin, livingMax) : <NoData />}
                                        <UnverifiedTag show={unverified('livingCostUSD.min') || unverified('livingCostUSD.max')} />
                                    </dd>
                                </div>
                            </dl>
                            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-2xl bg-blue-50/70 px-4 py-3.5">
                                <span className="text-sm font-semibold text-ink">Estimated total</span>
                                <span className="ml-auto whitespace-nowrap text-right font-display text-lg font-bold text-ink">
                                    {tuition !== null && livingMin !== null && livingMax !== null ? range(tuition + livingMin, tuition + livingMax) : <NoData />}
                                </span>
                            </div>
                            {original?.amount && original?.currency && (
                                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                                    Converted from {formatAmount(original.amount, original.currency)}{original.per ? ` per ${original.per}` : ''}
                                    {original.rateSource && ` · ${original.rateSource}`}{original.rateDate && `, ${original.rateDate}`}.
                                </p>
                            )}
                            <p className="mt-3 text-xs leading-relaxed text-slate-500">Figures are estimates — confirm with the university before planning your budget.</p>
                        </DetailCard>

                        <div className="order-6 lg:order-none">
                            <DataSourcesCard
                                checkedLabel={checkedLabel}
                                sources={sources}
                                emptyText="No sources recorded for this university yet. Figures tagged Unverified may be out of date."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <MobileActionBar>
                {listButton}
                {compareButton}
            </MobileActionBar>
        </div>
    );
}
