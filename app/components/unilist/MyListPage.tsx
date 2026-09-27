'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    AlertTriangle, ArrowUpRight, Award, Building2, CalendarDays, CheckCircle2, Download, FileText, ListPlus, Loader2,
    MapPin, Share2, Trash2, type LucideIcon,
} from 'lucide-react';
import { useUniList, type UniListItem, type UniListItemType } from '@/lib/useUniList';
import { buttonClass, MobileActionBar, monogram, TONES, useIsClient } from '@/components/common/detailUi';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const FILENAME = 'unilist-report.docx';

/** What the generated report contains — kept in sync with lib/uniListDocx.ts. */
const REPORT_SECTIONS = [
    'Overview & world ranking',
    'Tuition & living costs',
    'GPA and language test minimums',
    'Application deadlines',
    'Official website links',
];

function canShareFiles(): boolean {
    if (typeof navigator.canShare !== 'function') return false;
    return navigator.canShare({ files: [new File([''], FILENAME, { type: DOCX_MIME })] });
}

const formatAdded = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : `Added ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

/** City/country or provider for each row — the list itself only stores id, type and name. */
function useSubtitles(list: UniListItem[]): Record<string, string> {
    const key = list.map((i) => `${i.type}:${i.id}`).join(',');
    const [subtitles, setSubtitles] = useState<Record<string, string>>({});
    useEffect(() => {
        if (!key) return;
        let cancelled = false;
        const items = key.split(',');
        Promise.all(items.map((k) => {
            const [type, id] = k.split(':');
            return fetch(`/api/${type === 'university' ? 'universities' : 'scholarships'}/${id}`)
                .then((r) => (r.ok ? r.json() : null))
                .catch(() => null);
        })).then((docs) => {
            if (cancelled) return;
            const next: Record<string, string> = {};
            docs.forEach((doc, i) => {
                if (!doc) return;
                next[items[i]] = items[i].startsWith('university:')
                    ? [doc.location?.city, doc.location?.country].filter(Boolean).join(', ')
                    : [doc.provider?.name, doc.country].filter(Boolean).join(' · ');
            });
            setSubtitles((prev) => ({ ...prev, ...next }));
        });
        return () => { cancelled = true; };
    }, [key]);
    return subtitles;
}

function ListGroup({ title, icon: Icon, tone, items, type, subtitles, onRemove }: {
    title: string;
    icon: LucideIcon;
    tone: 'blue' | 'violet';
    items: UniListItem[];
    type: UniListItemType;
    subtitles: Record<string, string>;
    onRemove: (item: UniListItem) => void;
}) {
    if (items.length === 0) return null;
    return (
        <section>
            <h3 className={`flex items-center gap-2 px-1 text-sm font-semibold ${tone === 'blue' ? 'text-brand' : 'text-violet-700'}`}>
                <Icon aria-hidden="true" className="h-4 w-4" /> {title}
                <span className="rounded-full bg-slate-100 px-2 text-xs text-slate-500">{items.length}</span>
            </h3>
            <ul className="mt-3 space-y-2">
                {items.map((item) => {
                    const subtitle = subtitles[`${item.type}:${item.id}`];
                    return (
                        <li key={item.id} className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/30 sm:gap-4 sm:p-3.5">
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-display text-xs font-bold text-white sm:h-12 sm:w-12 sm:text-sm ${tone === 'blue' ? 'from-brand to-[#1d7fe0]' : 'from-violet-600 to-brand'}`}>
                                {monogram(item.name)}
                            </span>
                            <div className="min-w-0 flex-1">
                                <Link href={`/${type === 'university' ? 'universities' : 'scholarships'}/${item.id}`} className="block truncate text-sm font-semibold text-ink hover:text-brand sm:text-base">
                                    {item.name}
                                </Link>
                                <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5" /> {formatAdded(item.addedAt)}</span>
                                    {subtitle && <span className="inline-flex min-w-0 items-center gap-1"><MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{subtitle}</span></span>}
                                </p>
                            </div>
                            <Link href={`/${type === 'university' ? 'universities' : 'scholarships'}/${item.id}`} className="hidden items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-brand hover:bg-blue-50 sm:inline-flex">
                                View <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => onRemove(item)}
                                aria-label={`Remove ${item.name} from your list`}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            >
                                <Trash2 aria-hidden="true" className="h-4 w-4" />
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

export default function MyListPage() {
    const { ready, list, universities, scholarships, removeFromList, clearList } = useUniList();
    const subtitles = useSubtitles(list);
    const [confirmClear, setConfirmClear] = useState(false);
    const [busy, setBusy] = useState<'download' | 'share' | null>(null);
    const [error, setError] = useState<string | null>(null);
    // File sharing exists on most phones but not on desktop browsers; checked after hydration.
    const canShare = useIsClient() && canShareFiles();

    const total = list.length;
    const reportHref = useMemo(() => {
        if (total === 0) return null;
        const params = new URLSearchParams({ items: JSON.stringify(list.map((i) => ({ id: i.id, type: i.type }))) });
        return `/api/unilist/report?${params.toString()}`;
    }, [list, total]);

    async function fetchReport(): Promise<Blob> {
        const res = await fetch(reportHref!, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to generate report');
        return res.blob();
    }

    async function handleDownload() {
        if (!reportHref || busy) return;
        setBusy('download');
        setError(null);
        try {
            const url = URL.createObjectURL(await fetchReport());
            const a = document.createElement('a');
            a.href = url;
            a.download = FILENAME;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 10_000);
        } catch {
            setError("Couldn't generate the report. Please try again.");
        } finally {
            setBusy(null);
        }
    }

    async function handleShare() {
        if (!reportHref || busy) return;
        setBusy('share');
        setError(null);
        try {
            const file = new File([await fetchReport()], FILENAME, { type: DOCX_MIME });
            await navigator.share({ files: [file], title: 'My university & scholarship list' });
        } catch (err) {
            if ((err as Error)?.name !== 'AbortError') setError("Couldn't share the file. Use Download instead.");
        } finally {
            setBusy(null);
        }
    }

    const downloadButton = (className: string) => (
        <button type="button" onClick={handleDownload} disabled={!reportHref || busy !== null} className={`${buttonClass.primary} disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none ${className}`}>
            {busy === 'download' ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Download aria-hidden="true" className="h-4 w-4" />}
            {busy === 'download' ? 'Preparing report…' : `Download DOCX${total ? ` (${total})` : ''}`}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f7f9fc] px-4 pb-28 pt-5 font-body md:px-8 md:pb-10 md:pt-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-5 md:mb-6">
                    <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">My List</h1>
                    <p className="mt-1 text-sm text-slate-500">Collect the universities and scholarships you&apos;re considering and download them as one Word report.</p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start lg:gap-6">
                    {/* List */}
                    <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6 lg:col-span-8">
                        <div className="flex items-start gap-3">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES.blue}`}><ListPlus aria-hidden="true" className="h-5 w-5" /></span>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-display text-lg font-bold text-ink">Your list</h2>
                                <p className="text-sm text-slate-500">{total ? `${total} item${total === 1 ? '' : 's'} · saved on this device` : 'Saved on this device'}</p>
                            </div>
                        </div>

                        {!ready ? (
                            <div className="mt-5 space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-slate-100" />)}</div>
                        ) : total === 0 ? (
                            <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
                                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${TONES.blue}`}><ListPlus aria-hidden="true" className="h-6 w-6" /></span>
                                <h3 className="mt-3 font-display text-base font-bold text-ink">Your list is empty</h3>
                                <p className="mt-1 max-w-sm text-sm text-slate-500">Use <span className="font-semibold text-ink">Add to List</span> on any university or scholarship page.</p>
                                <div className="mt-5 flex flex-wrap justify-center gap-3">
                                    <Link href="/universities" className={buttonClass.primary}>Browse universities</Link>
                                    <Link href="/scholarships" className={buttonClass.secondary}>Browse scholarships</Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mt-5 space-y-6">
                                    <ListGroup title="Universities" icon={Building2} tone="blue" type="university" items={universities} subtitles={subtitles} onRemove={(i) => removeFromList(i.id, i.type)} />
                                    <ListGroup title="Scholarships" icon={Award} tone="violet" type="scholarship" items={scholarships} subtitles={subtitles} onRemove={(i) => removeFromList(i.id, i.type)} />
                                </div>
                                <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                                    {confirmClear ? (
                                        <div role="alertdialog" aria-label="Clear the whole list" className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-2.5 text-sm">
                                            <span className="inline-flex items-center gap-1.5 font-medium text-rose-700"><AlertTriangle aria-hidden="true" className="h-4 w-4" /> Remove all {total} items?</span>
                                            <button type="button" onClick={() => setConfirmClear(false)} className="font-semibold text-slate-600 hover:text-ink">Cancel</button>
                                            <button type="button" onClick={() => { clearList(); setConfirmClear(false); }} className="rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-700">Clear</button>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => setConfirmClear(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-rose-600">
                                            <Trash2 aria-hidden="true" className="h-4 w-4" /> Clear all
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </section>

                    {/* Report */}
                    <aside className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6 lg:sticky lg:top-6 lg:col-span-4">
                        <div className="flex items-start justify-between gap-3">
                            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONES.amber}`}><FileText aria-hidden="true" className="h-5 w-5" /></span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Word · .docx</span>
                        </div>
                        <h2 className="mt-4 font-display text-lg font-bold text-ink">Report</h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">One Word document with the details of every item in your list — easy to edit, print or send to a counsellor.</p>
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Included</p>
                            <ul className="mt-2.5 space-y-2">
                                {REPORT_SECTIONS.map((s) => (
                                    <li key={s} className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-600" /> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {error && <p role="alert" className="mt-4 text-sm font-medium text-rose-600">{error}</p>}
                        <div className="mt-5 hidden space-y-2.5 md:block">
                            {downloadButton('w-full')}
                            {canShare && (
                                <button type="button" onClick={handleShare} disabled={!reportHref || busy !== null} className={`${buttonClass.secondary} w-full disabled:opacity-50`}>
                                    {busy === 'share' ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Share2 aria-hidden="true" className="h-4 w-4" />} Share file
                                </button>
                            )}
                        </div>
                        {!reportHref && ready && <p className="mt-3 text-xs text-slate-400">Add items to your list to generate a report.</p>}
                    </aside>
                </div>
            </div>

            <MobileActionBar>
                {downloadButton('flex-1')}
                {canShare && (
                    <button type="button" onClick={handleShare} disabled={!reportHref || busy !== null} aria-label="Share report" className={`${buttonClass.icon} disabled:opacity-50`}>
                        {busy === 'share' ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Share2 aria-hidden="true" className="h-4 w-4" />}
                    </button>
                )}
            </MobileActionBar>
        </div>
    );
}
