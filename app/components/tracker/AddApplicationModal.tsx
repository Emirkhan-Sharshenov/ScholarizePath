'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Building2, Check, Heart, Loader2, Search, X } from 'lucide-react';
import { useIsClient } from '@/components/common/detailUi';
import { useI18n } from '@/i18n/I18nProvider';

export interface AvailableFavorite {
    itemType: 'university' | 'scholarship';
    itemId: string;
    itemName: string;
    itemSubtitle?: string | null;
}

interface AddApplicationModalProps {
    open: boolean;
    onClose: () => void;
    favorites: AvailableFavorite[];
    loadingFavorites: boolean;
    onAdd: (favorite: AvailableFavorite, deadline: string) => Promise<void>;
}

export default function AddApplicationModal({ open, onClose, favorites, loadingFavorites, onAdd }: AddApplicationModalProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [deadline, setDeadline] = useState('');
    const [query, setQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const isClient = useIsClient();
    const { t } = useI18n();
    const m = t.tracker;

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    if (!isClient) return null;

    const selectedFavorite = favorites.find((f) => `${f.itemType}:${f.itemId}` === selected) ?? null;
    const q = query.trim().toLowerCase();
    const visible = q ? favorites.filter((f) => f.itemName.toLowerCase().includes(q)) : favorites;

    const handleSubmit = async () => {
        if (!selectedFavorite || submitting) return;
        setSubmitting(true);
        try {
            await onAdd(selectedFavorite, deadline);
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    key="add-app-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 font-body backdrop-blur-[2px] sm:items-center sm:p-4"
                    onClick={onClose}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-application-title"
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 24, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex max-h-[90vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl"
                    >
                        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">
                            <div>
                                <h2 id="add-application-title" className="font-display text-lg font-bold text-ink">{m.addTitle}</h2>
                                <p className="mt-0.5 text-sm text-slate-500">{m.addLead}</p>
                            </div>
                            <button type="button" onClick={onClose} aria-label={m.close} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-ink">
                                <X aria-hidden="true" className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 pb-4 sm:px-6">
                            {loadingFavorites ? (
                                <div className="flex justify-center py-12"><Loader2 aria-label={m.loadingSaved} className="h-6 w-6 animate-spin text-brand" /></div>
                            ) : favorites.length === 0 ? (
                                <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500"><Heart aria-hidden="true" className="h-5 w-5" /></span>
                                    <p className="mt-3 text-sm text-slate-600">{m.noSaved}</p>
                                    <Link href="/universities" onClick={onClose} className="mt-4 text-sm font-semibold text-brand hover:underline">{m.browseUniversities}</Link>
                                </div>
                            ) : (
                                <>
                                    {favorites.length > 5 && (
                                        <label className="relative mb-3 block">
                                            <span className="sr-only">{m.searchSaved}</span>
                                            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="search"
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                placeholder={m.searchSaved}
                                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                                            />
                                        </label>
                                    )}
                                    <ul role="radiogroup" aria-label={m.savedItems} className="space-y-2">
                                        {visible.map((f) => {
                                            const key = `${f.itemType}:${f.itemId}`;
                                            const isSelected = selected === key;
                                            const Icon = f.itemType === 'university' ? Building2 : Award;
                                            return (
                                                <li key={key}>
                                                    <button
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={isSelected}
                                                        onClick={() => setSelected(key)}
                                                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${isSelected ? 'border-brand bg-blue-50/60 ring-2 ring-brand/15' : 'border-slate-200 hover:border-slate-300'}`}
                                                    >
                                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.itemType === 'university' ? 'bg-blue-50 text-brand' : 'bg-violet-50 text-violet-600'}`}>
                                                            <Icon aria-hidden="true" className="h-5 w-5" />
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-sm font-semibold text-ink">{f.itemName}</span>
                                                            {f.itemSubtitle && <span className="block truncate text-xs text-slate-500">{f.itemSubtitle}</span>}
                                                        </span>
                                                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-brand bg-brand text-white' : 'border-slate-300'}`}>
                                                            {isSelected && <Check aria-hidden="true" className="h-3 w-3" />}
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                        {visible.length === 0 && <li className="py-6 text-center text-sm text-slate-500">{m.noMatch(query)}</li>}
                                    </ul>

                                    <div className="mt-5">
                                        <label htmlFor="add-deadline" className="mb-2 block text-sm font-semibold text-ink">
                                            {m.deadline} <span className="font-normal text-slate-400">{m.optional}</span>
                                        </label>
                                        <input
                                            id="add-deadline"
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
                            <button type="button" onClick={onClose} className="h-11 rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">{m.cancel}</button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!selectedFavorite || submitting}
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#004a9f] disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {submitting && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />} {m.addToTracker}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
