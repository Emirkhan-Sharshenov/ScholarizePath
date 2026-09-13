'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Building2, Award, Loader2, Heart } from 'lucide-react';

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

export default function AddApplicationModal({
    open,
    onClose,
    favorites,
    loadingFavorites,
    onAdd,
}: AddApplicationModalProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [deadline, setDeadline] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    if (typeof document === 'undefined') return null;

    const selectedFavorite = favorites.find((f) => `${f.itemType}:${f.itemId}` === selected) ?? null;

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
                    transition={{ duration: 0.2 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Add application to tracker"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        key="add-app-panel"
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
                            <h3 className="text-sm font-bold text-slate-900">Track a new application</h3>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="overflow-y-auto px-5 py-4 flex-1">
                            {loadingFavorites ? (
                                <div className="flex items-center justify-center py-10 text-slate-400">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            ) : favorites.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <Heart className="h-6 w-6 text-slate-300" />
                                    <p className="text-sm text-slate-500">
                                        All your favorites are already being tracked, or you haven&apos;t saved any yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {favorites.map((fav) => {
                                        const key = `${fav.itemType}:${fav.itemId}`;
                                        const Icon = fav.itemType === 'university' ? Building2 : Award;
                                        const isSelected = selected === key;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setSelected(key)}
                                                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${isSelected
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-100 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-brand' : 'text-slate-400'}`} />
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-slate-800">
                                                        {fav.itemName}
                                                    </div>
                                                    {fav.itemSubtitle && (
                                                        <div className="truncate text-xs text-slate-400">{fav.itemSubtitle}</div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedFavorite && (
                                <div className="mt-4">
                                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                                        Deadline (optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 px-5 py-4 shrink-0">
                            <button
                                type="button"
                                disabled={!selectedFavorite || submitting}
                                onClick={handleSubmit}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Start tracking
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
