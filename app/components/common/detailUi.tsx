'use client';

// Building blocks shared by the university and scholarship detail pages.

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
    AlertTriangle, ArrowLeft, BadgeCheck, CalendarClock, CalendarX, CheckCircle2, ChevronDown, ChevronRight,
    CircleDashed, Database, ExternalLink, Flag, HelpCircle, Lock, type LucideIcon,
} from 'lucide-react';
import { daysUntil, toIsoDate } from '@/lib/scholarshipDisplay';

export const TONES = {
    blue: 'bg-blue-50 text-brand',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
    slate: 'bg-slate-100 text-slate-600',
} as const;
export type Tone = keyof typeof TONES;

/** "Massachusetts Institute of Technology (MIT)" → "MIT"-style initials for the logo tile. */
export function monogram(name: string): string {
    // An acronym the name already carries wins: "… (UNAM)", "ETH Zurich".
    const acronym = name.match(/\(([A-Z]{2,5})\)/)?.[1] ?? name.match(/^([A-Z]{2,5})\b/)?.[1];
    if (acronym) return acronym.slice(0, 4);
    const words = name.replace(/\([^)]*\)/g, '').split(/\s+/).filter((w) => /^[A-Z]/.test(w) && !['Of', 'The', 'And'].includes(w));
    const withoutUniversity = words.filter((w) => w !== 'University');
    const picked = withoutUniversity.length >= 2 ? withoutUniversity : words;
    return (picked.length ? picked : [name]).slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}

export function NoData({ children = 'No data' }: { children?: React.ReactNode }) {
    return <span className="text-sm font-normal italic text-slate-400">{children}</span>;
}

export function VerifiedPill({ label, title }: { label: string; title: string }) {
    return (
        <span title={title} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" /> {label}
        </span>
    );
}

export function Chip({ children, className = 'bg-slate-100 text-slate-600' }: { children: React.ReactNode; className?: string }) {
    return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

export type CheckStatus = 'met' | 'below' | 'unknown' | 'check' | 'none';

const STATUS_STYLE: Record<Exclude<CheckStatus, 'none'>, { className: string; icon: LucideIcon }> = {
    met: { className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    below: { className: 'bg-amber-50 text-amber-700', icon: AlertTriangle },
    unknown: { className: 'bg-slate-100 text-slate-500', icon: CircleDashed },
    check: { className: 'bg-sky-50 text-sky-700', icon: HelpCircle },
};

export function StatusPill({ status, label }: { status: CheckStatus; label: string }) {
    if (status === 'none') return <span className="text-xs text-slate-400">—</span>;
    const { className, icon: Icon } = STATUS_STYLE[status];
    return (
        <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5" /> {label}
        </span>
    );
}

/**
 * Section card with a coloured icon tile. On phones it collapses into an
 * accordion (header toggles it); from md up it's always open.
 */
export function DetailCard({ icon: Icon, tone, title, subtitle, action, defaultOpen = false, className = '', children }: {
    icon: LucideIcon;
    tone: Tone;
    title: string;
    subtitle?: React.ReactNode;
    action?: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <section className={`rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6 ${className}`}>
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left md:pointer-events-none"
                >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
                        <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 pt-0.5">
                        <span className="block font-display text-base font-bold text-ink sm:text-lg">{title}</span>
                        {subtitle && <span className="mt-0.5 block text-xs text-slate-500 sm:text-sm">{subtitle}</span>}
                    </span>
                    <ChevronDown aria-hidden="true" className={`mt-2 h-5 w-5 shrink-0 text-slate-400 transition-transform md:hidden ${open ? 'rotate-180' : ''}`} />
                </button>
                {action && <div className={open ? '' : 'hidden md:block'}>{action}</div>}
            </div>
            <div className={open ? 'mt-5' : 'mt-5 hidden md:block'}>{children}</div>
        </section>
    );
}

/** Small tile for a single headline figure (acceptance rate, students…). */
export function FactTile({ icon: Icon, tone, label, children }: { icon: LucideIcon; tone: Tone; label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-start gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:flex-row sm:items-center sm:gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${TONES[tone]}`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0 max-w-full">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <div className="mt-0.5 font-display text-base font-bold text-ink">{children}</div>
            </div>
        </div>
    );
}

/** Description that shows two lines with a "Read more" toggle when it's long. */
export function ExpandableText({ text, className = '' }: { text: string; className?: string }) {
    const [expanded, setExpanded] = useState(false);
    const long = text.length > 180;
    return (
        <div className={className}>
            <p className={`text-sm leading-relaxed text-slate-600 ${long && !expanded ? 'line-clamp-2' : ''}`}>{text}</p>
            {long && (
                <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-1 text-sm font-semibold text-brand hover:underline">
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}
        </div>
    );
}

/** Breadcrumbs + actions on desktop; a back link + compact actions on phones. */
export function DetailTopBar({ backHref, backLabel, title, actions, mobileActions }: {
    backHref: string;
    backLabel: string;
    title: string;
    actions: React.ReactNode;
    mobileActions?: React.ReactNode;
}) {
    return (
        <div className="mb-5 flex items-center justify-between gap-4 md:mb-6">
            <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm text-slate-500 md:flex">
                <Link href={backHref} className="shrink-0 transition-colors hover:text-brand">{backLabel}</Link>
                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-300" />
                <span className="truncate font-semibold text-ink">{title}</span>
            </nav>
            <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 md:hidden">
                <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {backLabel}
            </Link>
            <div className="hidden shrink-0 items-center gap-2.5 md:flex">{actions}</div>
            {mobileActions && <div className="flex items-center gap-2 md:hidden">{mobileActions}</div>}
        </div>
    );
}

export const buttonClass = {
    primary: 'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004a9f] active:scale-[0.98]',
    secondary: 'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]',
    success: 'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]',
    savedIcon: 'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition active:scale-95',
    icon: 'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95',
};

const subscribeNoop = () => () => {};
/** True after hydration — portals need `document`. */
export function useIsClient() {
    return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

/**
 * Phone-only action bar pinned above the bottom tab bar. Portalled to <body>
 * because the dashboard shell's containment breaks position: fixed.
 */
export function MobileActionBar({ children }: { children: React.ReactNode }) {
    const isClient = useIsClient();
    if (!isClient) return null;
    return createPortal(
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-slate-200 bg-white/95 px-4 py-3 font-body backdrop-blur-md md:hidden">
            <div className="flex items-center gap-3">{children}</div>
        </div>,
        document.body,
    );
}

// ── Deadlines ────────────────────────────────────────────────────────────────

export interface DeadlineItem { name?: string; round?: string; date?: unknown }

/** One row per dated entry: upcoming / closed / opens / estimated (free-text dates). */
export function DeadlineTimeline({ items, emptyText }: { items: DeadlineItem[]; emptyText: string }) {
    if (items.length === 0) {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm text-slate-500">
                <CalendarX aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400" /> {emptyText}
            </div>
        );
    }

    const rows = items.map((item) => {
        const name = item.name || item.round || 'Deadline';
        const iso = toIsoDate(item.date);
        const opening = /open/i.test(name);
        if (!iso) {
            const text = typeof item.date === 'string' ? item.date : '';
            return { name, sortKey: '9999', dateText: text ? `≈ ${text}` : 'Date not announced', estimated: Boolean(text), status: null as null | { label: string; className: string; icon: LucideIcon } };
        }
        const days = daysUntil(iso);
        const dateText = new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
        let status: { label: string; className: string; icon: LucideIcon };
        if (opening) {
            status = days > 0
                ? { label: `Opens in ${days} day${days === 1 ? '' : 's'}`, className: 'bg-sky-50 text-sky-700', icon: CalendarClock }
                : { label: 'Open', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 };
        } else if (days < 0) {
            status = { label: 'Closed', className: 'bg-slate-100 text-slate-500', icon: Lock };
        } else {
            status = {
                label: days === 0 ? 'Closes today' : `In ${days} day${days === 1 ? '' : 's'}`,
                className: days < 30 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-brand',
                icon: CalendarClock,
            };
        }
        return { name, sortKey: iso, dateText, estimated: false, status };
    }).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    return (
        <ol className="relative space-y-3 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-slate-200">
            {rows.map((row, i) => (
                <li key={i} className="relative flex gap-4">
                    <span className={`relative z-10 mt-4 h-[15px] w-[15px] shrink-0 rounded-full border-[3px] border-white ring-1 ${row.status?.label === 'Closed' ? 'bg-slate-300 ring-slate-200' : row.estimated ? 'bg-amber-400 ring-amber-200' : 'bg-brand ring-blue-200'}`} />
                    <div className={`flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 ${row.estimated ? 'border border-dashed border-amber-300 bg-amber-50/40' : 'border border-slate-200/80 bg-slate-50/60'}`}>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink">{row.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{row.dateText}</p>
                        </div>
                        {row.status ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${row.status.className}`}>
                                <row.status.icon aria-hidden="true" className="h-3.5 w-3.5" /> {row.status.label}
                            </span>
                        ) : row.estimated ? (
                            <span title="Estimated, not an official date" className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Estimated</span>
                        ) : null}
                    </div>
                </li>
            ))}
        </ol>
    );
}

// ── Sources ──────────────────────────────────────────────────────────────────

/** "https://www.x.org/page/ (QS 2026 column)" → link labelled "x.org/page · QS 2026 column". */
function parseSource(raw: string): { href: string | null; label: string } {
    const m = raw.match(/^(https?:\/\/\S+)\s*(?:\((.*)\))?\s*$/);
    if (!m) return { href: null, label: raw };
    let short = m[1];
    try {
        const url = new URL(m[1]);
        short = `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`;
    } catch { /* keep raw */ }
    return { href: m[1], label: m[2] ? `${short} · ${m[2]}` : short };
}

export function DataSourcesCard({ checkedLabel, sources, emptyText }: {
    checkedLabel: string | null;
    sources: string[];
    emptyText: string;
}) {
    const unique = [...new Set(sources.filter(Boolean))].map(parseSource);
    return (
        <DetailCard
            icon={Database}
            tone="slate"
            title="Data sources"
            subtitle={checkedLabel ? `Last checked ${checkedLabel}` : 'Not yet checked against official sources'}
        >
            {unique.length > 0 ? (
                <ul className="space-y-2">
                    {unique.map((s, i) => (
                        <li key={i}>
                            {s.href ? (
                                <a href={s.href} title={s.label} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm text-slate-700 transition-colors hover:border-blue-200 hover:text-brand">
                                    <span className="min-w-0 truncate">{s.label}</span>
                                    <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                </a>
                            ) : (
                                <span className="block rounded-xl border border-slate-200/80 px-3 py-2.5 text-sm text-slate-700">{s.label}</span>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-500">{emptyText}</p>
            )}
            <Link href="/support" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand">
                <Flag aria-hidden="true" className="h-3.5 w-3.5" /> Report an error
            </Link>
        </DetailCard>
    );
}

// ── Student profile ──────────────────────────────────────────────────────────

export interface StudentProfile {
    age?: number | null;
    nationality?: string | null;
    gpa?: number | null;
    sat?: number | null;
    englishTest?: { type?: 'IELTS' | 'TOEFL' | null; score?: number | null } | null;
    preferredField?: string | null;
    preferredCountry?: string | null;
    programLevel?: string | null;
}

export type ProfileState =
    | { status: 'loading' }
    | { status: 'guest' }
    | { status: 'ready'; profile: StudentProfile; firstName?: string };

/** The signed-in student's profile, or 'guest' when nobody is signed in. */
export function useStudentProfile(): ProfileState {
    const [state, setState] = useState<ProfileState>({ status: 'loading' });
    useEffect(() => {
        let cancelled = false;
        fetch('/api/auth/self')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (cancelled) return;
                setState(data?.success && data.user
                    ? { status: 'ready', profile: data.user.profile ?? {}, firstName: data.user.firstName }
                    : { status: 'guest' });
            })
            .catch(() => { if (!cancelled) setState({ status: 'guest' }); });
        return () => { cancelled = true; };
    }, []);
    return state;
}

// ── Loading skeleton (used by the routes' loading.tsx) ───────────────────────

export function DetailSkeleton() {
    const bar = 'animate-pulse rounded-lg bg-slate-200/70';
    return (
        <div className="min-h-screen bg-[#f7f9fc] px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">
                <div className={`${bar} mb-6 h-5 w-64`} />
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6">
                    <div className="flex gap-4">
                        <div className={`${bar} h-16 w-16 rounded-2xl`} />
                        <div className="flex-1 space-y-3">
                            <div className={`${bar} h-7 w-2/3`} />
                            <div className={`${bar} h-4 w-1/3`} />
                            <div className={`${bar} h-4 w-5/6`} />
                        </div>
                    </div>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-8">
                        {[0, 1].map((i) => (
                            <div key={i} className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-6">
                                <div className={`${bar} h-6 w-48`} />
                                <div className={`${bar} h-10 w-full`} />
                                <div className={`${bar} h-10 w-full`} />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-6 lg:col-span-4">
                        <div className={`${bar} h-6 w-40`} />
                        <div className={`${bar} h-10 w-full`} />
                    </div>
                </div>
            </div>
        </div>
    );
}
