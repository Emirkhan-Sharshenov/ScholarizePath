'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AlarmClock, ClipboardList, Loader2, Plus } from 'lucide-react';
import { buttonClass, TONES, useIsClient } from '@/components/common/detailUi';
import TrackerCard from './TrackerCard';
import AddApplicationModal, { AvailableFavorite } from './AddApplicationModal';
import EditApplicationPanel, { type ApplicationChanges } from './EditApplicationPanel';
import { STATUS_COLUMNS, TrackedApplication, ApplicationStatus, daysUntil, isDueSoon } from './trackerConstants';

/** Nearest deadline first; applications without one go last. */
const byDeadline = (a: TrackedApplication, b: TrackedApplication) => {
    const da = daysUntil(a.deadline);
    const db = daysUntil(b.deadline);
    if (da === null) return db === null ? 0 : 1;
    if (db === null) return -1;
    return da - db;
};

export default function TrackerBoard() {
    const [applications, setApplications] = useState<TrackedApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [signedOut, setSignedOut] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalKey, setModalKey] = useState(0);
    const [favorites, setFavorites] = useState<AvailableFavorite[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const [editing, setEditing] = useState<TrackedApplication | null>(null);
    const [mobileStatus, setMobileStatus] = useState<ApplicationStatus | null>(null);
    const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);
    const isClient = useIsClient();

    const loadApplications = useCallback(async () => {
        const res = await fetch('/api/tracker').catch(() => null);
        if (!res) {
            setLoadFailed(true);
            return;
        }
        if (res.status === 401) {
            setSignedOut(true);
            return;
        }
        const data = res.ok ? await res.json().catch(() => null) : null;
        if (!data?.success) {
            // Shown as an error, not as an empty board that looks like data loss.
            setLoadFailed(true);
            return;
        }
        setLoadFailed(false);
        setApplications(data.applications);
    }, []);

    useEffect(() => {
        async function run() {
            try {
                await loadApplications();
            } finally {
                setLoading(false);
            }
        }
        run();
    }, [loadApplications]);

    const loadAvailableFavorites = useCallback(async () => {
        setLoadingFavorites(true);
        try {
            const selfRes = await fetch('/api/auth/self');
            if (!selfRes.ok) return;
            const selfData = await selfRes.json();
            if (!selfData.success || !selfData.user) return;

            const uniIds: string[] = selfData.user.favoriteUniversities || [];
            const scholarshipIds: string[] = selfData.user.favoriteScholarships || [];
            const trackedKeys = new Set(applications.map((a) => `${a.itemType}:${a.itemId}`));

            const uniPromises = uniIds
                .filter((id) => !trackedKeys.has(`university:${id}`))
                .map(async (id): Promise<AvailableFavorite | null> => {
                    try {
                        const res = await fetch(`/api/universities/${id}`);
                        if (!res.ok) return null;
                        const data = await res.json();
                        const uni = data.university || data;
                        return {
                            itemType: 'university',
                            itemId: uni._id || uni.id || id,
                            itemName: uni.name,
                            itemSubtitle: uni.location
                                ? `${uni.location.city || ''}${uni.location.city && uni.location.country ? ', ' : ''}${uni.location.country || ''}`
                                : undefined,
                        };
                    } catch {
                        return null;
                    }
                });

            const schPromises = scholarshipIds
                .filter((id) => !trackedKeys.has(`scholarship:${id}`))
                .map(async (id): Promise<AvailableFavorite | null> => {
                    try {
                        const res = await fetch(`/api/scholarships/${id}`);
                        if (!res.ok) return null;
                        const data = await res.json();
                        const sch = data.scholarship || data;
                        return {
                            itemType: 'scholarship',
                            itemId: sch._id || sch.id || id,
                            itemName: sch.scholarshipName || sch.title,
                            itemSubtitle: sch.provider?.name || sch.fundingOrganization,
                        };
                    } catch {
                        return null;
                    }
                });

            const results = (await Promise.all([...uniPromises, ...schPromises])).filter(
                (f): f is AvailableFavorite => f !== null
            );
            setFavorites(results);
        } finally {
            setLoadingFavorites(false);
        }
    }, [applications]);

    const handleOpenModal = () => {
        // Remounts the modal so its internal selection/deadline fields start blank
        // instead of carrying over whatever was left from the previous open.
        setModalKey((k) => k + 1);
        setModalOpen(true);
        loadAvailableFavorites();
    };

    const handleAdd = async (favorite: AvailableFavorite, deadline: string) => {
        const res = await fetch('/api/tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemType: favorite.itemType,
                itemId: favorite.itemId,
                itemName: favorite.itemName,
                itemSubtitle: favorite.itemSubtitle,
                deadline: deadline || null,
            }),
        });
        const data = await res.json();
        if (data.success) {
            setApplications((prev) => [data.application, ...prev]);
        }
    };

    const patch = async (id: string, body: Partial<ApplicationChanges>): Promise<boolean> => {
        try {
            const res = await fetch(`/api/tracker/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok || !data.success) return false;
            setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, ...data.application } : a)));
            return true;
        } catch {
            return false;
        }
    };

    // Drag & drop on the desktop board: optimistic, rolled back if the save fails.
    const moveTo = async (id: string, status: ApplicationStatus) => {
        const previous = applications;
        const current = previous.find((a) => a._id === id);
        if (!current || current.status === status) return;
        setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
        if (!(await patch(id, { status }))) setApplications(previous);
    };

    const handleRemove = async (id: string) => {
        const previous = applications;
        setApplications((prev) => prev.filter((a) => a._id !== id));
        setEditing(null);
        const res = await fetch(`/api/tracker/${id}`, { method: 'DELETE' }).catch(() => null);
        if (!res?.ok) setApplications(previous);
    };

    const closeEditor = useCallback(() => setEditing(null), []);
    const closeModal = useCallback(() => setModalOpen(false), []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 aria-label="Loading applications" className="h-6 w-6 animate-spin text-brand" />
            </div>
        );
    }

    if (signedOut) {
        return (
            <div className="mx-auto mt-6 flex max-w-lg flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${TONES.blue}`}><ClipboardList aria-hidden="true" className="h-6 w-6" /></span>
                <h1 className="mt-4 font-display text-lg font-bold text-ink">Sign in to use the tracker</h1>
                <p className="mt-1 text-sm text-slate-500">Your applications are kept in your account.</p>
                <Link href="/login" className={`${buttonClass.primary} mt-5`}>Sign in</Link>
            </div>
        );
    }

    if (loadFailed) {
        return (
            <div className="mx-auto mt-6 flex max-w-lg flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center">
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${TONES.rose}`}><ClipboardList aria-hidden="true" className="h-6 w-6" /></span>
                <h1 className="mt-4 font-display text-lg font-bold text-ink">Couldn&apos;t load your applications</h1>
                <p className="mt-1 text-sm text-slate-500">Check your connection and try again.</p>
                <button
                    type="button"
                    onClick={() => { setLoading(true); loadApplications().finally(() => setLoading(false)); }}
                    className={`${buttonClass.primary} mt-5`}
                >
                    Try again
                </button>
            </div>
        );
    }

    const dueSoon = applications.filter(isDueSoon).sort(byDeadline);
    const counts = Object.fromEntries(STATUS_COLUMNS.map((c) => [c.id, applications.filter((a) => a.status === c.id).length])) as Record<ApplicationStatus, number>;
    // Phones show one status at a time: the picked one, else the first with items.
    const activeStatus = mobileStatus ?? STATUS_COLUMNS.find((c) => counts[c.id] > 0)?.id ?? 'not_started';
    const activeColumn = STATUS_COLUMNS.find((c) => c.id === activeStatus)!;

    return (
        <div className="font-body">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4 md:mb-6">
                <div>
                    <h1 className="flex flex-wrap items-center gap-3 font-display text-2xl font-bold text-ink sm:text-3xl">
                        Application Tracker
                        {dueSoon.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 font-body text-xs font-semibold text-red-600">
                                <AlarmClock aria-hidden="true" className="h-3.5 w-3.5" /> {dueSoon.length} due this week
                            </span>
                        )}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {applications.length === 0
                            ? 'Track every university and scholarship you apply to, in one board.'
                            : dueSoon.length > 0
                                ? `${dueSoon.length} application${dueSoon.length > 1 ? 's' : ''} due within a week.`
                                : 'All caught up — no deadlines in the next 7 days.'}
                    </p>
                </div>
                {/* Phones use the floating button instead */}
                <div className="hidden md:block">
                    <button type="button" onClick={handleOpenModal} className={buttonClass.primary}>
                        <Plus aria-hidden="true" className="h-4 w-4" /> Add application
                    </button>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-6 py-16 text-center">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${TONES.blue}`}><ClipboardList aria-hidden="true" className="h-6 w-6" /></span>
                    <h2 className="mt-4 font-display text-lg font-bold text-ink">Nothing tracked yet</h2>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">Save a university or scholarship, then add it here to follow its status.</p>
                    <button type="button" onClick={handleOpenModal} className={`${buttonClass.primary} mt-5`}>
                        <Plus aria-hidden="true" className="h-4 w-4" /> Add your first application
                    </button>
                </div>
            ) : (
                <>
                    {/* Summary — static on desktop, status tabs on phones */}
                    <div className="mb-5 hidden grid-cols-3 gap-3 md:grid xl:grid-cols-6">
                        {STATUS_COLUMNS.map((col) => (
                            <div key={col.id} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(10,26,63,0.03)]">
                                <span className="flex items-center gap-2 text-sm text-slate-600"><span className={`h-2 w-2 rounded-full ${col.dotClass}`} /> {col.label}</span>
                                <span className="font-display text-lg font-bold text-ink">{counts[col.id]}</span>
                            </div>
                        ))}
                    </div>

                    {dueSoon.length > 0 && (
                        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 md:hidden">
                            <AlarmClock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                            <span><span className="font-semibold">{dueSoon.length} due this week:</span> {dueSoon.map((a) => a.itemName).join(', ')}</span>
                        </div>
                    )}

                    <div role="tablist" aria-label="Application status" className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
                        {STATUS_COLUMNS.map((col) => {
                            const selected = activeStatus === col.id;
                            return (
                                <button
                                    key={col.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    onClick={() => setMobileStatus(col.id)}
                                    className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${selected ? col.activeClass : 'border border-slate-200 bg-white text-slate-600'}`}
                                >
                                    {!selected && <span className={`h-2 w-2 rounded-full ${col.dotClass}`} />}
                                    {col.label}
                                    <span className={`rounded-full px-1.5 text-xs ${selected ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>{counts[col.id]}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Phones: the selected status as a list */}
                    <div role="tabpanel" aria-label={activeColumn.label} className="space-y-3 md:hidden">
                        {applications.filter((a) => a.status === activeStatus).sort(byDeadline).map((app) => (
                            <TrackerCard key={app._id} application={app} onOpen={setEditing} />
                        ))}
                        {counts[activeStatus] === 0 && (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
                                Nothing in “{activeColumn.label}”.
                            </p>
                        )}
                    </div>

                    {/* Desktop: Kanban board */}
                    <div className="hidden gap-4 overflow-x-auto pb-3 md:flex">
                        {STATUS_COLUMNS.map((col) => {
                            const items = applications.filter((a) => a.status === col.id).sort(byDeadline);
                            return (
                                <section
                                    key={col.id}
                                    aria-label={col.label}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
                                    onDragLeave={() => setDragOver((d) => (d === col.id ? null : d))}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOver(null);
                                        const id = e.dataTransfer.getData('text/plain');
                                        if (id) moveTo(id, col.id);
                                    }}
                                    className={`flex w-[272px] shrink-0 flex-col rounded-3xl p-3 transition-colors ${dragOver === col.id ? 'bg-blue-50 ring-2 ring-brand/30' : 'bg-slate-100/70'}`}
                                >
                                    <h2 className="mb-3 flex items-center gap-2 px-1.5 pt-1 text-sm font-semibold text-slate-700">
                                        <span className={`h-2 w-2 rounded-full ${col.dotClass}`} /> {col.label}
                                        <span className="rounded-full bg-white px-2 text-xs text-slate-500">{items.length}</span>
                                    </h2>
                                    <div className="min-h-[96px] flex-1 space-y-2.5">
                                        {items.map((app) => <TrackerCard key={app._id} application={app} onOpen={setEditing} draggable />)}
                                        {items.length === 0 && (
                                            <p className="rounded-2xl border border-dashed border-slate-300/70 px-3 py-6 text-center text-xs text-slate-400">Drop an application here</p>
                                        )}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Phones: floating add button above the tab bar */}
            {isClient && applications.length > 0 && createPortal(
                <button
                    type="button"
                    onClick={handleOpenModal}
                    aria-label="Add application"
                    className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_12px_24px_rgba(0,88,189,0.35)] transition active:scale-95 md:hidden"
                >
                    <Plus aria-hidden="true" className="h-6 w-6" />
                </button>,
                document.body,
            )}

            <AddApplicationModal
                key={modalKey}
                open={modalOpen}
                onClose={closeModal}
                favorites={favorites}
                loadingFavorites={loadingFavorites}
                onAdd={handleAdd}
            />
            <EditApplicationPanel
                key={editing?._id ?? 'none'}
                application={editing}
                onClose={closeEditor}
                onSave={(id, changes) => patch(id, changes)}
                onRemove={handleRemove}
            />
        </div>
    );
}
