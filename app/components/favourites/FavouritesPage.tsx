'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
    ArrowUpRight, Award, BadgeCheck, Building2, Check, ClipboardList, Heart, ListPlus, Loader2, MapPin, Scale,
    Search, Trophy, X, type LucideIcon,
} from 'lucide-react';
import { useCompare } from '@/lib/useCompare';
import { useUniList } from '@/lib/useUniList';
import { formatCheckedAt, getVerification } from '@/lib/verification';
import { formatAmount, getDeadlineInfo } from '@/lib/scholarshipDisplay';
import { flagFor } from '@/components/profile/countryList';
import { buttonClass, monogram, NoData, TONES, useIsClient } from '@/components/common/detailUi';
import { CardSkeleton, SelectField } from '@/components/common/listUi';
import { DeadlinePill, FundingPill } from '@/components/scholarships/pills';

/* eslint-disable @typescript-eslint/no-explicit-any -- university/scholarship documents are schemaless */

type ItemType = 'university' | 'scholarship';
type Ids = { universities: string[]; scholarships: string[] };
const keyOf = (type: ItemType): keyof Ids => (type === 'university' ? 'universities' : 'scholarships');
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

async function saveIds(ids: Ids): Promise<boolean> {
    try {
        const res = await fetch('/api/auth/self', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favoriteUniversities: ids.universities, favoriteScholarships: ids.scholarships }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

// ── Card pieces ─────────────────────────────────────────────────────────────

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-400">{label}</p>
            <div className="mt-0.5 line-clamp-2 break-words text-sm font-semibold text-ink">{children}</div>
        </div>
    );
}

function Action({ icon: Icon, label, activeLabel, short, active, onClick, href, busy }: {
    icon: LucideIcon; label: string; activeLabel: string; short: string; active: boolean; onClick?: () => void; href?: string; busy?: boolean;
}) {
    const className = `inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-colors sm:flex-none sm:px-3 sm:text-sm ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'}`;
    const content = (
        <>
            {busy ? <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin" /> : active ? <Check aria-hidden="true" className="h-4 w-4 shrink-0" /> : <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />}
            {/* Phones get one-word labels; the check icon shows the active state */}
            <span className="truncate sm:hidden">{short}</span>
            <span className="hidden truncate sm:inline">{active ? activeLabel : label}</span>
        </>
    );
    if (href) return <Link href={href} className={className}>{content}</Link>;
    return <button type="button" onClick={onClick} disabled={busy} aria-pressed={active} className={className}>{content}</button>;
}

interface CardActions {
    inCompare: boolean;
    inList: boolean;
    tracked: boolean;
    tracking: boolean;
    onCompare: () => void;
    onList: () => void;
    onTrack: () => void;
    onRemove: () => void;
}

function CardShell({ children, actions, extra }: { children: React.ReactNode; actions: CardActions; extra?: React.ReactNode }) {
    return (
        <article className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] transition-shadow hover:shadow-[0_10px_24px_rgba(10,26,63,0.08)] sm:p-6">
            {children}
            <div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 sm:gap-2">
                <Action icon={Scale} label="Compare" activeLabel="Comparing" short="Compare" active={actions.inCompare} onClick={actions.onCompare} />
                <Action icon={ListPlus} label="Add to List" activeLabel="In list" short="List" active={actions.inList} onClick={actions.onList} />
                {actions.tracked
                    ? <Action icon={ClipboardList} label="Track" activeLabel="Tracked" short="Tracked" active href="/tracker" />
                    : <Action icon={ClipboardList} label="Track" activeLabel="Tracked" short="Track" active={false} busy={actions.tracking} onClick={actions.onTrack} />}
                {extra}
            </div>
        </article>
    );
}

function RemoveHeart({ name, onRemove }: { name: string; onRemove: () => void }) {
    return (
        <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name} from favourites`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100"
        >
            <Heart aria-hidden="true" className="h-[18px] w-[18px] fill-rose-500" />
        </button>
    );
}

function UniversityCard({ doc, actions }: { doc: any; actions: CardActions }) {
    const name: string = doc?.name || 'University';
    const verification = getVerification(doc);
    const world = num(doc?.ranking?.global);
    const national = num(doc?.ranking?.national);
    const tuition = num(doc?.tuition?.bachelor) ?? num(doc?.tuition?.master) ?? num(doc?.tuition?.phd);
    const total = num(doc?.students?.total);
    const languages: string[] = Array.isArray(doc?.languages) ? doc.languages : [];
    const country: string = doc?.location?.country ?? '';

    return (
        <CardShell actions={actions}>
            <div className="flex gap-3.5 sm:gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[#1d7fe0] font-display text-sm font-bold text-white sm:h-14 sm:w-14 sm:text-base">
                    {monogram(name)}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {verification.isVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" /> Verified · {formatCheckedAt(verification.checkedAt)}
                            </span>
                        )}
                        {doc?.type && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{doc.type}</span>}
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-ink sm:text-lg">
                        <Link href={`/universities/${doc._id}`} className="hover:text-brand">{name}</Link>
                    </h3>
                </div>
                <RemoveHeart name={name} onRemove={actions.onRemove} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <MapPin aria-hidden="true" className="h-4 w-4 text-slate-400" />
                    {[doc?.location?.city, country].filter(Boolean).join(', ')} {flagFor(country)}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${world !== null ? 'bg-amber-50 text-amber-800' : national !== null ? 'bg-blue-50 text-brand' : 'bg-slate-100 text-slate-500'}`}>
                    <Trophy aria-hidden="true" className="h-3.5 w-3.5" />
                    {world !== null ? `World #${world}` : national !== null ? `National #${national}` : 'Not ranked'}
                </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Stat label="Tuition / yr">{tuition === null ? <NoData /> : tuition === 0 ? 'Free' : formatAmount(tuition, doc?.tuition?.currency || 'USD')}</Stat>
                <Stat label="Acceptance">{num(doc?.acceptanceRate) !== null ? `${doc.acceptanceRate}%` : <NoData />}</Stat>
                <Stat label={languages.length > 1 ? 'Languages' : 'Language'}>{languages.length ? languages.join(', ') : total !== null ? total.toLocaleString('en-US') : <NoData />}</Stat>
            </div>
        </CardShell>
    );
}

function ScholarshipCard({ doc, actions }: { doc: any; actions: CardActions }) {
    const name: string = doc?.scholarshipName || 'Scholarship';
    const v = doc?.award?.estimatedValue;
    const amount = v && (v.min || v.max)
        ? v.min && v.max && v.min !== v.max ? `${formatAmount(v.min, v.currency)} – ${formatAmount(v.max, v.currency)}` : formatAmount(v.max || v.min, v.currency)
        : null;
    const covered = [['tuition', 'Tuition'], ['stipend', 'Stipend'], ['travel', 'Travel'], ['insurance', 'Insurance']]
        .filter(([k]) => doc?.award?.[k] === true).map(([, l]) => l);
    const levels: string[] = Array.isArray(doc?.studyLevel) ? doc.studyLevel : doc?.studyLevel ? [doc.studyLevel] : [];
    const applyUrl: string | null = doc?.applicationLink || doc?.officialWebsite || null;

    return (
        <CardShell
            actions={actions}
            extra={applyUrl && (
                <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="ml-auto hidden items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#004a9f] sm:inline-flex">
                    Apply <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
            )}
        >
            <div className="flex gap-3.5 sm:gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-brand font-display text-sm font-bold text-white sm:h-14 sm:w-14 sm:text-base">
                    {monogram(name)}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <FundingPill type={doc?.award?.type} />
                        <DeadlinePill deadlines={doc?.deadlines} />
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-ink sm:text-lg">
                        <Link href={`/scholarships/${doc._id}`} className="hover:text-brand">{name}</Link>
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500">{[doc?.provider?.name, doc?.country].filter(Boolean).join(' · ')} {flagFor(doc?.country)}</p>
                </div>
                <RemoveHeart name={name} onRemove={actions.onRemove} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Stat label="Award">{amount ?? <NoData>See website</NoData>}</Stat>
                <Stat label="Covers">{covered.length ? covered.join(', ') : <NoData>Not stated</NoData>}</Stat>
                <Stat label="Levels">{levels.length ? levels.join(', ') : <NoData />}</Stat>
            </div>
        </CardShell>
    );
}

/** A saved id whose record couldn't be loaded (e.g. archived) — still removable. */
function MissingCard({ onRemove }: { onRemove: () => void }) {
    return (
        <article className="flex items-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/60 p-5">
            <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-slate-500">No longer available</p>
                <p className="mt-0.5 text-sm text-slate-400">This item was removed from our catalogue.</p>
            </div>
            <RemoveHeart name="this item" onRemove={onRemove} />
        </article>
    );
}

// ── Page ────────────────────────────────────────────────────────────────────

type Toast = { type: ItemType; id: string; index: number; name: string };

export default function FavouritesPage() {
    const [auth, setAuth] = useState<'loading' | 'guest' | 'ready'>('loading');
    const [ids, setIds] = useState<Ids>({ universities: [], scholarships: [] });
    const [docs, setDocs] = useState<Record<string, any | null>>({});
    const [tracked, setTracked] = useState<Set<string>>(new Set());
    const [tracking, setTracking] = useState<string | null>(null);
    const [tab, setTab] = useState<ItemType | null>(null);
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<'recent' | 'name'>('recent');
    const [toast, setToast] = useState<Toast | null>(null);
    const isClient = useIsClient();

    const { compareList, scholarshipCompareList, addToCompare, removeFromCompare, addToScholarshipCompare, removeFromScholarshipCompare } = useCompare();
    const { isInList, toggleInList } = useUniList();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await fetch('/api/auth/self').catch(() => null);
            const data = res?.ok ? await res.json() : null;
            if (cancelled) return;
            if (!data?.success || !data.user) {
                setAuth('guest');
                return;
            }
            const loaded: Ids = { universities: data.user.favoriteUniversities ?? [], scholarships: data.user.favoriteScholarships ?? [] };
            const fetchDoc = (kind: string, id: string) => fetch(`/api/${kind}/${id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
            const [uniDocs, schDocs, trackerData] = await Promise.all([
                Promise.all(loaded.universities.map((id) => fetchDoc('universities', id))),
                Promise.all(loaded.scholarships.map((id) => fetchDoc('scholarships', id))),
                fetch('/api/tracker').then((r) => (r.ok ? r.json() : null)).catch(() => null),
            ]);
            if (cancelled) return;
            const map: Record<string, any | null> = {};
            loaded.universities.forEach((id, i) => { map[`university:${id}`] = uniDocs[i]; });
            loaded.scholarships.forEach((id, i) => { map[`scholarship:${id}`] = schDocs[i]; });
            setDocs(map);
            setIds(loaded);
            setTracked(new Set((trackerData?.applications ?? []).map((a: { itemType: string; itemId: string }) => `${a.itemType}:${a.itemId}`)));
            setAuth('ready');
        })();
        return () => { cancelled = true; };
    }, []);

    // Toast disappears on its own after a few seconds.
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 6000);
        return () => clearTimeout(t);
    }, [toast]);

    const remove = useCallback(async (type: ItemType, id: string, name: string) => {
        const key = keyOf(type);
        const index = ids[key].indexOf(id);
        const next = { ...ids, [key]: ids[key].filter((x) => x !== id) };
        setIds(next);
        setToast({ type, id, index, name });
        if (!(await saveIds(next))) {
            setIds(ids);
            setToast(null);
        }
    }, [ids]);

    const undo = useCallback(async () => {
        if (!toast) return;
        const key = keyOf(toast.type);
        const list = [...ids[key]];
        list.splice(Math.max(0, toast.index), 0, toast.id);
        const next = { ...ids, [key]: list };
        setIds(next);
        setToast(null);
        if (!(await saveIds(next))) setIds(ids);
    }, [toast, ids]);

    const track = useCallback(async (type: ItemType, doc: any) => {
        const k = `${type}:${doc._id}`;
        setTracking(k);
        try {
            // A scholarship's next exact deadline is pre-filled; universities have none on file.
            const info = type === 'scholarship' ? getDeadlineInfo(doc.deadlines) : null;
            const res = await fetch('/api/tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemType: type,
                    itemId: doc._id,
                    itemName: type === 'university' ? doc.name : doc.scholarshipName,
                    itemSubtitle: type === 'university'
                        ? [doc.location?.city, doc.location?.country].filter(Boolean).join(', ')
                        : doc.provider?.name || doc.fundingOrganization || null,
                    deadline: info?.date && !info.passed ? info.date : null,
                }),
            });
            // 409 = already tracked.
            if (res.ok || res.status === 409) setTracked((prev) => new Set(prev).add(k));
        } finally {
            setTracking(null);
        }
    }, []);

    const activeTab: ItemType = tab ?? (ids.universities.length === 0 && ids.scholarships.length > 0 ? 'scholarship' : 'university');
    const items = useMemo(() => {
        const list = [...ids[keyOf(activeTab)]].reverse(); // newest first
        const q = query.trim().toLowerCase();
        const withDocs = list.map((id) => ({ id, doc: docs[`${activeTab}:${id}`] ?? null }));
        const nameOf = (d: any) => String((activeTab === 'university' ? d?.name : d?.scholarshipName) ?? '');
        const filtered = q ? withDocs.filter(({ doc }) => nameOf(doc).toLowerCase().includes(q)) : withDocs;
        const sorted = sort === 'name' ? [...filtered].sort((a, b) => nameOf(a.doc).localeCompare(nameOf(b.doc))) : filtered;
        // Records that no longer load go last.
        return [...sorted.filter((x) => x.doc), ...sorted.filter((x) => !x.doc)];
    }, [ids, docs, activeTab, query, sort]);

    const actionsFor = (type: ItemType, doc: any): CardActions => {
        const id = String(doc._id);
        const name = type === 'university' ? doc.name : doc.scholarshipName;
        const compareIds = (type === 'university' ? compareList : scholarshipCompareList).map((x: any) => String(x._id ?? x.id));
        const inCompare = compareIds.includes(id);
        return {
            inCompare,
            inList: isInList(id, type),
            tracked: tracked.has(`${type}:${id}`),
            tracking: tracking === `${type}:${id}`,
            onCompare: () => {
                if (type === 'university') {
                    if (inCompare) removeFromCompare(id);
                    else addToCompare(doc);
                } else if (inCompare) removeFromScholarshipCompare(id);
                else addToScholarshipCompare(doc);
            },
            onList: () => toggleInList(id, type, name),
            onTrack: () => track(type, doc),
            onRemove: () => remove(type, id, name),
        };
    };

    const tabs: [ItemType, string, LucideIcon][] = [['university', 'Universities', Building2], ['scholarship', 'Scholarships', Award]];

    return (
        <div className="min-h-screen bg-[#f7f9fc] px-4 pb-10 pt-5 font-body md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-5 md:mb-6">
                    <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Favourites</h1>
                    <p className="mt-1 text-sm text-slate-500">Universities and scholarships you&apos;ve saved with the heart.</p>
                </div>

                {auth === 'guest' ? (
                    <div className="flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center">
                        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${TONES.rose}`}><Heart aria-hidden="true" className="h-6 w-6" /></span>
                        <h2 className="mt-4 font-display text-lg font-bold text-ink">Sign in to see your favourites</h2>
                        <p className="mt-1 max-w-sm text-sm text-slate-500">Saved universities and scholarships are kept in your account.</p>
                        <Link href="/login" className={`${buttonClass.primary} mt-5`}>Sign in</Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white p-2 shadow-[0_4px_12px_rgba(10,26,63,0.04)] md:flex-row md:items-center">
                            <div role="tablist" aria-label="Favourites type" className="grid grid-cols-2 gap-1 md:w-[340px]">
                                {tabs.map(([t, labelText, Icon]) => {
                                    const count = ids[keyOf(t)].length;
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            role="tab"
                                            aria-selected={activeTab === t}
                                            onClick={() => setTab(t)}
                                            className={`flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors ${activeTab === t ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'}`}
                                        >
                                            <Icon aria-hidden="true" className="h-4 w-4" /> {labelText}
                                            <span className={`rounded-full px-1.5 text-xs ${activeTab === t ? 'bg-white/20' : 'bg-slate-100'}`}>{auth === 'ready' ? count : '–'}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex flex-1 gap-2 px-1 pb-1 md:p-0 md:pr-1">
                                <label className="relative min-w-0 flex-1">
                                    <span className="sr-only">Search favourites</span>
                                    <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="search"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search saved…"
                                        className="h-11 w-full rounded-[10px] border border-slate-200 bg-white pl-10 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                                    />
                                </label>
                                <div className="w-[168px] shrink-0 sm:w-[190px]">
                                    <SelectField name="sort" value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'name')} ariaLabel="Sort favourites">
                                        <option value="recent">Recently saved</option>
                                        <option value="name">Name A–Z</option>
                                    </SelectField>
                                </div>
                            </div>
                        </div>

                        {auth === 'loading' ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">{[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center">
                                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${TONES.rose}`}><Heart aria-hidden="true" className="h-6 w-6" /></span>
                                {query ? (
                                    <>
                                        <h2 className="mt-4 font-display text-lg font-bold text-ink">Nothing matches “{query}”</h2>
                                        <button type="button" onClick={() => setQuery('')} className="mt-3 text-sm font-semibold text-brand hover:underline">Clear search</button>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="mt-4 font-display text-lg font-bold text-ink">No saved {activeTab === 'university' ? 'universities' : 'scholarships'} yet</h2>
                                        <p className="mt-1 max-w-sm text-sm text-slate-500">Tap the heart on any {activeTab} to keep it here.</p>
                                        <Link href={activeTab === 'university' ? '/universities' : '/scholarships'} className={`${buttonClass.primary} mt-5`}>
                                            Browse {activeTab === 'university' ? 'universities' : 'scholarships'}
                                        </Link>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                                {items.map(({ id, doc }) => (doc ? (
                                    activeTab === 'university'
                                        ? <UniversityCard key={id} doc={doc} actions={actionsFor('university', doc)} />
                                        : <ScholarshipCard key={id} doc={doc} actions={actionsFor('scholarship', doc)} />
                                ) : (
                                    <MissingCard key={id} onRemove={() => remove(activeTab, id, 'Item')} />
                                )))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {isClient && toast && createPortal(
                <div role="status" className="fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 font-body text-sm text-white shadow-[0_20px_40px_rgba(10,26,63,0.25)] md:bottom-6">
                    <Heart aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-300" />
                    <span className="min-w-0 flex-1 truncate">Removed {toast.name}</span>
                    <button type="button" onClick={undo} className="font-semibold text-blue-200 underline-offset-2 hover:underline">Undo</button>
                    <button type="button" onClick={() => setToast(null)} aria-label="Dismiss" className="text-white/60 hover:text-white"><X aria-hidden="true" className="h-4 w-4" /></button>
                </div>,
                document.body,
            )}
        </div>
    );
}
