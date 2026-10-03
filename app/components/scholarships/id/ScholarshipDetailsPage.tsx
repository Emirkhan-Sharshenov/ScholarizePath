"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlarmClock, ArrowUpRight, BookOpen, Briefcase, CalendarClock, CalendarDays, CalendarX, Check, CheckCircle2, CircleDashed,
    ClipboardList, Coins, ExternalLink, FileCheck2, Globe2, GraduationCap, Heart, HeartPulse, Home, Info, ListChecks,
    Loader2, Lock, Plane, Plus, Scale, ShieldCheck, User, Wallet, XCircle, type LucideIcon,
} from "lucide-react";
import { Scholarship } from "@/types/scholarship";
import { useCompare } from "@/lib/useCompare";
import { useUniList } from "@/lib/useUniList";
import { useFavorites } from "@/lib/useFavorites";
import { formatAmount, getDeadlineInfo } from "@/lib/scholarshipDisplay";
import { formatCheckedAt } from "@/lib/verification";
import { flagFor } from "@/components/profile/countryList";
import {
    buttonClass, Chip, DataSourcesCard, DeadlineTimeline, DetailCard, DetailTopBar, ExpandableText, MobileActionBar,
    monogram, NoData, StatusPill, TONES, useStudentProfile, VerifiedPill, type CheckStatus, type StudentProfile,
} from "@/components/common/detailUi";
import { AIEligibilityExplanation } from "./AIEligibilityExplanation";
import { useI18n } from "@/i18n/I18nProvider";
import { localizeCountry } from "@/i18n/countries";
import { formatNumber, intlLocale } from "@/i18n/format";
import type { Messages } from "@/i18n/messages";

type D = Messages["scholarships"]["detail"];

// Fields the scholarship documents carry beyond the shared Scholarship type.
type ScholarshipDoc = Scholarship & {
    requirements?: Scholarship["requirements"] & {
        nationality?: { eligibleCountries?: string | null };
        experience?: { required?: boolean | null; years?: number | null; description?: string | null };
    };
    universities?: string[];
    numberOfAwards?: number | null;
    sources?: string[];
    sourcesCheckedAt?: string | null;
};

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const VALIDITY_MS = 365 * 24 * 60 * 60 * 1000;

/** "Sep 2026" when the sources were checked within the last 12 months, else null. */
function freshCheckLabel(checkedAt: string | null | undefined, loc: string): string | null {
    if (!checkedAt) return null;
    const age = Date.now() - new Date(checkedAt).getTime();
    return age >= 0 && age < VALIDITY_MS ? formatCheckedAt(checkedAt, loc) : null;
}

// ── Eligibility ─────────────────────────────────────────────────────────────

interface Criterion {
    key: string;
    icon: LucideIcon;
    label: string;
    requirement: React.ReactNode;
    status: CheckStatus;
    statusLabel: string;
}

/** "Master's", "Masters", "Postgraduate (Master)" → "Master" so levels can be compared with the profile. */
function normalizeLevel(level: string): string | null {
    if (/post-?doc/i.test(level)) return "Postdoc";
    if (/ph\.?d|doctor/i.test(level)) return "PhD";
    if (/master|msc|mba/i.test(level)) return "Master";
    if (/bachelor|undergrad/i.test(level)) return "Bachelor";
    return null;
}

function buildCriteria(s: ScholarshipDoc, profile: StudentProfile | null, d: D, levelLabel: (l: string) => string): Criterion[] {
    const req = s.requirements ?? {};
    const signedIn = profile !== null;
    const rows: Criterion[] = [];
    const notStated = <NoData>{d.noRequirement}</NoData>;

    rows.push({
        key: "education", icon: GraduationCap, label: d.education,
        requirement: req.education?.minimumDegree ? d.minimum(req.education.minimumDegree) : notStated,
        status: "none", statusLabel: "",
    });

    // Study level vs the level the student is applying for.
    const levels = (Array.isArray(s.studyLevel) ? s.studyLevel : s.studyLevel ? [s.studyLevel] : []).filter(Boolean);
    let level: [CheckStatus, string] = ["none", ""];
    if (levels.length && signedIn) {
        if (!profile?.programLevel) level = ["unknown", d.addToProfile];
        else if (levels.some((l) => normalizeLevel(l) === profile.programLevel)) level = ["met", d.matchesLevel];
        else level = ["below", d.notFor(levelLabel(profile.programLevel))];
    }
    rows.push({ key: "level", icon: BookOpen, label: d.studyLevel, requirement: levels.length ? levels.map(levelLabel).join(", ") : notStated, status: level[0], statusLabel: level[1] });

    // Field of study — free text, so only an explicit match or "all fields" counts.
    const field = s.fieldOfStudy?.trim();
    let fieldStatus: [CheckStatus, string] = ["none", ""];
    if (field && signedIn) {
        if (/\b(all|any)\b.*\b(fields?|disciplines?|subjects?)\b/i.test(field)) fieldStatus = ["met", d.openAllFields];
        else if (!profile?.preferredField) fieldStatus = ["unknown", d.addToProfile];
        else if (field.toLowerCase().includes(profile.preferredField.toLowerCase())) fieldStatus = ["met", d.matchesField];
        else fieldStatus = ["check", d.checkFields];
    }
    rows.push({ key: "field", icon: ClipboardList, label: d.fieldOfStudy, requirement: field || notStated, status: fieldStatus[0], statusLabel: fieldStatus[1] });

    // Nationality lists are free text ("Citizens of 183 eligible countries") — can't be checked automatically.
    const nationality = req.nationality?.eligibleCountries?.trim();
    let nat: [CheckStatus, string] = ["none", ""];
    if (nationality && signedIn) {
        nat = /open to all|all (countries|nationalities)|any nationality/i.test(nationality) ? ["met", d.openToAll] : ["check", d.checkCountries];
    }
    rows.push({ key: "nationality", icon: Globe2, label: d.nationality, requirement: nationality || notStated, status: nat[0], statusLabel: nat[1] });

    // Age
    const maxAge = num(req.age?.max);
    const ageText = req.age?.description || (maxAge !== null ? d.upToAge(maxAge) : null);
    let age: [CheckStatus, string] = ["none", ""];
    if (ageText && signedIn) {
        const userAge = num(profile?.age);
        if (maxAge === null) age = ["check", d.checkManually];
        else if (userAge === null) age = ["unknown", d.addToProfile];
        else {
            const strict = /under|younger|below|less than/i.test(req.age?.description ?? "");
            age = (strict ? userAge < maxAge : userAge <= maxAge) ? ["met", d.youMeet] : ["below", d.overAge];
        }
    }
    rows.push({ key: "age", icon: User, label: d.ageLimit, requirement: ageText || notStated, status: age[0], statusLabel: age[1] });

    // GPA — the profile is on a 4.0 scale; percentages aren't converted (the mapping varies by country).
    const minGpa = num(req.gpa?.minimum);
    const gpaText = req.gpa?.description || (minGpa !== null ? d.minGpa(`${minGpa}${minGpa <= 4 ? " / 4.0" : "%"}`) : null);
    let gpa: [CheckStatus, string] = ["none", ""];
    if (gpaText && signedIn) {
        const userGpa = num(profile?.gpa);
        if (minGpa === null) gpa = ["check", d.checkManually];
        else if (minGpa > 4) gpa = ["check", d.differentScale];
        else if (userGpa === null) gpa = ["unknown", d.addToProfile];
        else gpa = userGpa >= minGpa ? ["met", d.youMeet] : ["below", d.yourGpa(userGpa)];
    }
    rows.push({ key: "gpa", icon: FileCheck2, label: d.gpa, requirement: gpaText || notStated, status: gpa[0], statusLabel: gpa[1] });

    // Language
    const test = req.language?.test?.trim();
    const minScore = req.language?.minimumScore ? parseFloat(String(req.language.minimumScore)) : NaN;
    const langText = [test, req.language?.minimumScore && d.minimumScore(String(req.language.minimumScore))].filter(Boolean).join(", ") || req.language?.description;
    let lang: [CheckStatus, string] = ["none", ""];
    if (langText && signedIn && !/none required|not required/i.test(langText)) {
        const userTest = profile?.englishTest?.type;
        const userScore = num(profile?.englishTest?.score);
        const sameTest = userTest && test && new RegExp(userTest, "i").test(test);
        if (!Number.isNaN(minScore) && sameTest && userScore !== null) lang = userScore >= minScore ? ["met", d.youMeet] : ["below", d.yourTest(userTest, userScore)];
        else lang = ["check", d.checkManually];
    }
    rows.push({ key: "language", icon: Info, label: d.language, requirement: langText || notStated, status: lang[0], statusLabel: lang[1] });

    const exp = req.experience;
    if (exp?.required) {
        rows.push({
            key: "experience", icon: Briefcase, label: d.workExperience,
            requirement: exp.description || (num(exp.years) !== null ? d.atLeastYears(exp.years!) : d.required),
            status: signedIn ? "check" : "none", statusLabel: d.checkManually,
        });
    }
    return rows;
}

// ── Hero tiles ──────────────────────────────────────────────────────────────

function DeadlineTile({ deadlines }: { deadlines: Scholarship["deadlines"] }) {
    const { t, locale } = useI18n();
    const d = t.scholarships.detail;
    const info = getDeadlineInfo(deadlines);
    const box = "rounded-2xl p-4";
    const label = <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"><CalendarClock aria-hidden="true" className="h-3.5 w-3.5" /> {d.deadline}</p>;

    if (!info.date && info.approxText) {
        return (
            <div title={d.estimated} className={`${box} border border-dashed border-amber-300 bg-amber-50/60 text-amber-800`}>
                {label}
                <p className="mt-1.5 font-display text-sm font-bold leading-snug sm:text-base">
                    {/* Non-breaking hyphens keep "2027-02-20" on one line */}
                    ≈ {info.approxText.replace(/\s*\((approximate|varies|based)[^)]*\)/i, "").replace(/(\d{4})-(\d{2})-(\d{2})/g, "$1‑$2‑$3")}
                </p>
                <p className="mt-1 text-xs text-amber-700/80">{d.estimated}</p>
            </div>
        );
    }
    if (!info.date) {
        return (
            <div className={`${box} bg-slate-50 text-slate-500`}>
                {label}
                <p className="mt-1.5 flex items-center gap-1.5 font-display text-base font-bold"><CalendarX aria-hidden="true" className="h-4 w-4" /> {d.datesNotAnnounced}</p>
                <p className="mt-1 text-xs">{d.checkWebsite}</p>
            </div>
        );
    }
    const dateText = new Date(info.date).toLocaleDateString(intlLocale(locale), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    if (info.passed) {
        return (
            <div className={`${box} bg-slate-50 text-slate-500`}>
                {label}
                <p className="mt-1.5 flex items-center gap-1.5 font-display text-base font-bold"><Lock aria-hidden="true" className="h-4 w-4" /> {d.closed}</p>
                <p className="mt-1 text-xs">{d.lastDeadline(dateText)}</p>
            </div>
        );
    }
    const urgent = (info.daysLeft ?? 0) < 30;
    return (
        <div className={`${box} ${urgent ? "bg-red-50 text-red-600" : "bg-blue-50 text-brand"}`}>
            {label}
            <p className="mt-1.5 flex items-center gap-1.5 font-display text-lg font-bold">
                {urgent && <AlarmClock aria-hidden="true" className="h-4 w-4" />}
                {info.daysLeft === 0 ? d.closesToday : d.daysLeft(info.daysLeft ?? 0)}
            </p>
            <p className="mt-1 text-xs opacity-80">{dateText}</p>
        </div>
    );
}

const COVERAGE: { key: "tuition" | "stipend" | "travel" | "insurance" | "arrivalAllowance"; icon: LucideIcon }[] = [
    { key: "tuition", icon: GraduationCap },
    { key: "stipend", icon: Wallet },
    { key: "travel", icon: Plane },
    { key: "insurance", icon: HeartPulse },
    { key: "arrivalAllowance", icon: Home },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function ScholarshipDetailsPage({ scholarship: raw }: { scholarship: Scholarship }) {
    const s = raw as ScholarshipDoc;
    const router = useRouter();
    const { t, locale } = useI18n();
    const d = t.scholarships.detail;
    const loc = intlLocale(locale);
    const levelLabel = (l: string) => t.scholarships.studyLevels[l] ?? t.profile.programLevels[l] ?? l;
    const { scholarshipCompareList, addToScholarshipCompare, removeFromScholarshipCompare } = useCompare();
    const { toggleInList, isInList } = useUniList();

    const id = String(s?._id ?? "");
    const name = s?.scholarshipName || d.fallbackName;
    const { isFavorite, toggleFavorite, loading: favLoading } = useFavorites(id, "scholarship");
    const isCompared = scholarshipCompareList.some((item: { id?: string; _id?: string }) => (item.id || item._id) === id);
    const inList = isInList(id, "scholarship");

    const profileState = useStudentProfile();
    const profile = profileState.status === "ready" ? profileState.profile : null;
    const criteria = buildCriteria(s, profile, d, levelLabel);
    const checked = criteria.filter((c) => c.status === "met" || c.status === "below");
    const metCount = checked.filter((c) => c.status === "met").length;
    const manualCount = criteria.filter((c) => c.status === "check").length;

    const value = s?.award?.estimatedValue;
    const amount = value && (value.min || value.max)
        ? value.min && value.max && value.min !== value.max
            ? `${formatAmount(value.min, value.currency, loc)} – ${formatAmount(value.max, value.currency, loc)}`
            : formatAmount((value.max || value.min) as number, value.currency, loc)
        : null;
    const covered = COVERAGE.filter((c) => s?.award?.[c.key] === true).map((c) => d.coverageShort[c.key]);
    const levels = (Array.isArray(s?.studyLevel) ? s.studyLevel : s?.studyLevel ? [s.studyLevel] : []).filter(Boolean);
    const fullyFunded = /fully/i.test(s?.award?.type ?? "");

    const checkedAt = freshCheckLabel(s?.sourcesCheckedAt, loc);
    const applyUrl = s?.applicationLink || s?.officialWebsite || null;
    const steps = (s?.applicationProcess ?? []).filter(Boolean);
    const documents = (s?.requiredDocuments ?? []).filter(Boolean);
    const other = (s?.requirements?.other ?? []).filter(Boolean);
    const universities = (s?.universities ?? []).filter(Boolean);

    const facts: [string, React.ReactNode][] = [
        [d.provider, s?.provider?.name ? `${s.provider.name}${s.provider.type ? ` (${s.provider.type})` : ""}` : <NoData key="p">{d.notStated}</NoData>],
        ...(s?.fundingOrganization && s.fundingOrganization !== s?.provider?.name ? [[d.fundedBy, s.fundingOrganization] as [string, React.ReactNode]] : []),
        [d.duration, s?.duration || <NoData key="d">{d.notStated}</NoData>],
        [d.intake, s?.intake || <NoData key="i">{d.notStated}</NoData>],
        ...(num(s?.numberOfAwards) !== null ? [[d.awards, d.perYear(formatNumber(locale, s.numberOfAwards!))] as [string, React.ReactNode]] : []),
        ...(universities.length ? [[d.whereToStudy, universities.join(", ")] as [string, React.ReactNode]] : []),
    ];

    const handleCompare = () => {
        if (isCompared) removeFromScholarshipCompare(id);
        else {
            addToScholarshipCompare(s);
            router.push("/compare");
        }
    };
    const handleAddToList = () => id && toggleInList(id, "scholarship", name);

    const saveButton = (compact: boolean) => (
        <button
            type="button"
            onClick={toggleFavorite}
            aria-label={isFavorite ? d.removeSaved : d.save}
            aria-pressed={isFavorite}
            disabled={!id}
            className={compact ? (isFavorite ? buttonClass.savedIcon : buttonClass.icon) : isFavorite ? `${buttonClass.secondary} border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-50` : buttonClass.secondary}
        >
            {favLoading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Heart aria-hidden="true" className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />}
            {!compact && (isFavorite ? d.saved : d.save)}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f7f9fc] px-4 pb-24 pt-5 font-body md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">
                <DetailTopBar
                    backHref="/scholarships"
                    backLabel={d.back}
                    title={name}
                    actions={
                        <>
                            <button type="button" onClick={handleAddToList} className={inList ? buttonClass.success : buttonClass.secondary}>
                                {inList ? <Check aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}
                                {inList ? d.inList : d.addToList}
                            </button>
                            {saveButton(false)}
                            <button type="button" onClick={handleCompare} className={isCompared ? buttonClass.success : buttonClass.secondary}>
                                <Scale aria-hidden="true" className="h-4 w-4" /> {isCompared ? d.inComparison : d.compare}
                            </button>
                        </>
                    }
                    mobileActions={
                        <>
                            <button type="button" onClick={handleAddToList} aria-label={inList ? d.removeFromList : d.addToList} aria-pressed={inList} className={inList ? `${buttonClass.icon} border-emerald-200 bg-emerald-50 text-emerald-700` : buttonClass.icon}>
                                {inList ? <Check aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}
                            </button>
                            <button type="button" onClick={handleCompare} aria-label={isCompared ? d.removeComparison : d.compare} aria-pressed={isCompared} className={isCompared ? `${buttonClass.icon} border-emerald-200 bg-emerald-50 text-emerald-700` : buttonClass.icon}>
                                <Scale aria-hidden="true" className="h-4 w-4" />
                            </button>
                        </>
                    }
                />

                {/* Hero */}
                <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-4">
                                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-brand font-display text-lg font-bold text-white shadow-md shadow-violet-900/10 sm:h-[72px] sm:w-[72px] sm:text-xl">
                                    {monogram(name)}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm text-slate-500">
                                        {[s?.provider?.name, s?.country && localizeCountry(s.country, locale)].filter(Boolean).join(" · ")} {flagFor(s?.country)}
                                    </p>
                                    <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">{name}</h1>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-1.5">
                                {checkedAt && (
                                    <VerifiedPill
                                        label={d.sourcesChecked(checkedAt)}
                                        title={d.sourcesCheckedTitle}
                                    />
                                )}
                                {s?.award?.type && (
                                    <Chip className={fullyFunded ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${fullyFunded ? "bg-emerald-500" : "bg-amber-500"}`} /> {fullyFunded ? t.ui.fundingFull : /partial/i.test(s.award.type) ? t.ui.fundingPartial : s.award.type}
                                    </Chip>
                                )}
                                {s?.provider?.type && <Chip><ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" /> {s.provider.type}</Chip>}
                                {levels.map((l) => <Chip key={l} className="bg-blue-50 text-brand">{levelLabel(l)}</Chip>)}
                            </div>

                            {s?.description && <ExpandableText text={s.description} className="mt-4 max-w-2xl" />}
                        </div>

                        <div className="grid w-full grid-cols-2 gap-3 lg:w-[340px] lg:shrink-0">
                            <div className="rounded-2xl bg-violet-50/70 p-4 text-violet-700">
                                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"><Coins aria-hidden="true" className="h-3.5 w-3.5" /> {d.award}</p>
                                {amount ? (
                                    <>
                                        <p className="mt-1.5 break-words font-display text-lg font-bold leading-snug text-ink">{amount}</p>
                                        <p className="mt-1 text-xs text-violet-700/80">{d.estimatedValue}</p>
                                    </>
                                ) : (
                                    <p className="mt-1.5 font-display text-base font-bold leading-snug text-slate-500">{t.scholarships.seeWebsite}</p>
                                )}
                            </div>
                            <DeadlineTile deadlines={s?.deadlines} />
                            {covered.length > 0 && (
                                <p className="col-span-2 rounded-xl bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-700">
                                    {d.covers(covered.join(" · "))}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Main */}
                <div className="mt-5 flex flex-col gap-4 md:mt-6 md:gap-6 lg:grid lg:grid-cols-12 lg:items-start">
                    <div className="contents lg:col-span-8 lg:flex lg:flex-col lg:gap-6">
                        <DetailCard icon={Wallet} tone="emerald" title={d.whatsCovered} defaultOpen className="order-1 lg:order-none">
                            <ul className="grid gap-2.5 sm:grid-cols-2">
                                {COVERAGE.map(({ key, icon: Icon }) => {
                                    const v = s?.award?.[key];
                                    const state = v === true
                                        ? { text: d.covered, className: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 }
                                        : v === false
                                            ? { text: d.notCovered, className: "bg-rose-50 text-rose-600", icon: XCircle }
                                            : { text: d.notStated, className: "bg-slate-100 text-slate-500", icon: CircleDashed };
                                    return (
                                        <li key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3">
                                            <span className="flex items-center gap-3 text-sm font-medium text-ink">
                                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONES.emerald}`}><Icon aria-hidden="true" className="h-4 w-4" /></span>
                                                {d.coverage[key]}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${state.className}`}>
                                                <state.icon aria-hidden="true" className="h-3.5 w-3.5" /> {state.text}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </DetailCard>

                        <DetailCard
                            icon={ListChecks}
                            tone="blue"
                            title={d.criteria}
                            subtitle={d.criteriaSubtitle}
                            defaultOpen
                            className="order-2 lg:order-none"
                        >
                            {profileState.status === "guest" && (
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50/70 px-4 py-3 text-sm text-slate-600">
                                    {d.signInToCheck}
                                    <Link href="/login" className="font-semibold text-brand hover:underline">{d.signIn}</Link>
                                </div>
                            )}
                            {profileState.status === "ready" && (checked.length > 0 || manualCount > 0) && (
                                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                                    {checked.length > 0 && (
                                        <span className={`font-semibold ${metCount === checked.length ? "text-emerald-700" : "text-amber-700"}`}>
                                            {d.criteriaMet(metCount, checked.length)}
                                        </span>
                                    )}
                                    {manualCount > 0 && <span className="text-slate-500">{d.toCheck(manualCount)}</span>}
                                </div>
                            )}
                            <ul className="divide-y divide-slate-100">
                                {criteria.map((c) => (
                                    <li key={c.key} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES.slate}`}><c.icon aria-hidden="true" className="h-4 w-4" /></span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                                                <p className="text-sm font-semibold text-ink">{c.label}</p>
                                                {c.status !== "none" && <StatusPill status={c.status} label={c.statusLabel} />}
                                            </div>
                                            <p className="mt-0.5 text-sm text-slate-600">{c.requirement}</p>
                                        </div>
                                    </li>
                                ))}
                                {other.length > 0 && (
                                    <li className="flex items-start gap-3 py-3.5 last:pb-0">
                                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONES.slate}`}><ListChecks aria-hidden="true" className="h-4 w-4" /></span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-ink">{d.otherRequirements}</p>
                                            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-600">
                                                {other.map((o) => <li key={o}>{o}</li>)}
                                            </ul>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </DetailCard>

                        <AIEligibilityExplanation scholarshipId={id} signedIn={profileState.status === "ready"} className="order-3 lg:order-none" />

                        <DetailCard icon={ClipboardList} tone="sky" title={d.howToApply} className="order-4 lg:order-none">
                            {steps.length > 0 ? (
                                <ol className="space-y-3">
                                    {steps.map((step, i) => (
                                        <li key={i} className="flex gap-3">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand font-display text-xs font-bold text-white">{i + 1}</span>
                                            <p className="pt-0.5 text-sm text-slate-700">{step}</p>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <NoData>{d.noSteps}</NoData>
                            )}

                            <h3 className="mb-3 mt-6 font-display text-sm font-bold text-ink">{d.documents}</h3>
                            {documents.length > 0 ? (
                                <ul className="grid gap-2 sm:grid-cols-2">
                                    {documents.map((doc) => (
                                        <li key={doc} className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-700">
                                            <FileCheck2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" /> {doc}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <NoData>{d.noDocuments}</NoData>
                            )}
                        </DetailCard>
                    </div>

                    <div className="contents lg:sticky lg:top-6 lg:col-span-4 lg:flex lg:flex-col lg:gap-6">
                        <section className="order-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6 lg:order-none">
                            <h2 className="font-display text-lg font-bold text-ink">{d.apply}</h2>
                            <p className="mt-1 text-sm text-slate-500">{d.applyNote}</p>
                            {applyUrl ? (
                                <div className="mt-4 space-y-2.5">
                                    <a href={applyUrl} target="_blank" rel="noopener noreferrer" className={`${buttonClass.primary} w-full`}>
                                        {d.applyOfficial} <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                                    </a>
                                    {s?.officialWebsite && s.officialWebsite !== applyUrl && (
                                        <a href={s.officialWebsite} target="_blank" rel="noopener noreferrer" className={`${buttonClass.secondary} w-full`}>
                                            {d.officialWebsite} <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-4"><NoData>{d.noLink}</NoData></p>
                            )}
                            <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100 text-sm">
                                {facts.map(([label, value]) => (
                                    <div key={label} className="flex justify-between gap-4 py-2.5">
                                        <dt className="shrink-0 text-slate-500">{label}</dt>
                                        <dd className="text-right font-medium text-ink">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </section>

                        <DetailCard icon={CalendarDays} tone="rose" title={d.keyDates} className="order-6 lg:order-none">
                            <DeadlineTimeline items={s?.deadlines ?? []} emptyText={d.keyDatesEmpty} />
                        </DetailCard>

                        <div className="order-7 lg:order-none">
                            <DataSourcesCard
                                checkedLabel={checkedAt}
                                sources={s?.sources ?? []}
                                emptyText={d.sourcesEmpty}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <MobileActionBar>
                {saveButton(true)}
                {applyUrl ? (
                    <a href={applyUrl} target="_blank" rel="noopener noreferrer" className={`${buttonClass.primary} flex-1`}>
                        {d.applyOfficial} <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </a>
                ) : (
                    <span className={`${buttonClass.secondary} flex-1 text-slate-400`}>{d.noLinkShort}</span>
                )}
            </MobileActionBar>
        </div>
    );
}
