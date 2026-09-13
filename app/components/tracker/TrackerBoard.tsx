'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, ClipboardList } from 'lucide-react';
import TrackerCard from './TrackerCard';
import AddApplicationModal, { AvailableFavorite } from './AddApplicationModal';
import { STATUS_COLUMNS, TrackedApplication, ApplicationStatus, daysUntil } from './trackerConstants';

export default function TrackerBoard() {
    const [applications, setApplications] = useState<TrackedApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalKey, setModalKey] = useState(0);
    const [favorites, setFavorites] = useState<AvailableFavorite[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);

    const loadApplications = useCallback(async () => {
        const res = await fetch('/api/tracker');
        if (res.status === 401) {
            window.location.href = '/login';
            return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) setApplications(data.applications);
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

    const handleStatusChange = async (id: string, status: ApplicationStatus) => {
        setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
        await fetch(`/api/tracker/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
    };

    const handleDelete = async (id: string) => {
        const previous = applications;
        setApplications((prev) => prev.filter((a) => a._id !== id));
        const res = await fetch(`/api/tracker/${id}`, { method: 'DELETE' });
        if (!res.ok) setApplications(previous);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
        );
    }

    const urgentCount = applications.filter((a) => {
        const d = daysUntil(a.deadline);
        return d !== null && d >= 0 && d <= 7 && a.status !== 'accepted' && a.status !== 'rejected';
    }).length;

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg md:text-[20px] font-bold text-slate-900">Application Tracker</h1>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                        {applications.length === 0
                            ? 'Track every university and scholarship you apply to, in one board.'
                            : urgentCount > 0
                                ? `${urgentCount} application${urgentCount > 1 ? 's' : ''} due within a week.`
                                : 'All caught up — no deadlines in the next 7 days.'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add application
                </button>
            </div>

            {applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                    <ClipboardList className="h-8 w-8 text-slate-300" />
                    <p className="max-w-xs text-sm text-slate-500">
                        Nothing tracked yet. Favorite a university or scholarship, then add it here to follow its status.
                    </p>
                    <button
                        type="button"
                        onClick={handleOpenModal}
                        className="mt-1 text-sm font-semibold text-brand hover:underline"
                    >
                        Add your first application
                    </button>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {STATUS_COLUMNS.map((col) => {
                        const items = applications
                            .filter((a) => a.status === col.id)
                            .sort((a, b) => {
                                const da = daysUntil(a.deadline);
                                const db = daysUntil(b.deadline);
                                if (da === null) return 1;
                                if (db === null) return -1;
                                return da - db;
                            });

                        return (
                            <div key={col.id} className="w-[260px] shrink-0 md:w-[280px]">
                                <div className="mb-3 flex items-center gap-2 px-1">
                                    <span className={`h-2 w-2 rounded-full ${col.dotClass}`} />
                                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                        {col.label}
                                    </h3>
                                    <span className="text-xs font-semibold text-slate-300">{items.length}</span>
                                </div>

                                <div className="space-y-2.5 rounded-2xl bg-slate-50/70 p-2 min-h-[80px]">
                                    {items.map((app) => (
                                        <TrackerCard
                                            key={app._id}
                                            application={app}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AddApplicationModal
                key={modalKey}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                favorites={favorites}
                loadingFavorites={loadingFavorites}
                onAdd={handleAdd}
            />
        </div>
    );
}
