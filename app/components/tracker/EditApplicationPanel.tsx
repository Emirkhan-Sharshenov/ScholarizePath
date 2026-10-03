'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Award, Building2, Check, Loader2, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { timeAgo } from '@/lib/timeAgo';
import { useIsClient } from '@/components/common/detailUi';
import { STATUS_COLUMNS, toDateInput, type ApplicationStatus, type TrackedApplication } from './trackerConstants';
import { useI18n } from '@/i18n/I18nProvider';
import { intlLocale } from '@/i18n/format';

export interface ApplicationChanges {
    status: ApplicationStatus;
    deadline: string | null;
    notes: string;
}

interface EditApplicationPanelProps {
    application: TrackedApplication | null;
    onClose: () => void;
    onSave: (id: string, changes: ApplicationChanges) => Promise<boolean>;
    onRemove: (id: string) => Promise<void>;
}

const MAX_NOTES = 2000;

/**
 * Side panel on desktop, bottom sheet on phones. Remounted per application
 * (keyed by the board) so the form starts from that application's values.
 */
export default function EditApplicationPanel({ application, onClose, onSave, onRemove }: EditApplicationPanelProps) {
    const [status, setStatus] = useState<ApplicationStatus>(application?.status ?? 'not_started');
    const [deadline, setDeadline] = useState(toDateInput(application?.deadline));
    const [notes, setNotes] = useState(application?.notes ?? '');
    const [saving, setSaving] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const open = application !== null;
    const isClient = useIsClient();
    const { t, locale } = useI18n();
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

    const dirty = application !== null && (
        status !== application.status || deadline !== toDateInput(application.deadline) || notes.trim() !== (application.notes ?? '')
    );

    const handleSave = async () => {
        if (!application || !dirty || saving) return;
        setSaving(true);
        setError(null);
        const ok = await onSave(application._id, { status, deadline: deadline || null, notes: notes.trim() });
        setSaving(false);
        if (ok) onClose();
        else setError(m.saveError);
    };

    const isUniversity = application?.itemType === 'university';
    const Icon = isUniversity ? Building2 : Award;

    return createPortal(
        <AnimatePresence>
            {application && (
                <motion.div
                    key="edit-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-end bg-slate-900/40 font-body backdrop-blur-[2px] md:items-stretch md:justify-end"
                    onClick={onClose}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-application-title"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl md:h-full md:max-h-none md:w-[440px] md:rounded-none"
                    >
                        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-slate-200 md:hidden" />
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6">
                            <h2 id="edit-application-title" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                                <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-brand" /> {m.editTitle}
                            </h2>
                            <button type="button" onClick={onClose} aria-label={m.close} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-ink">
                                <X aria-hidden="true" className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 md:px-6">
                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isUniversity ? 'bg-brand text-white' : 'bg-violet-600 text-white'}`}>
                                    <Icon aria-hidden="true" className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isUniversity ? 'bg-blue-100 text-brand' : 'bg-violet-100 text-violet-700'}`}>
                                        {isUniversity ? m.university : m.scholarship}
                                    </span>
                                    <p className="mt-1 font-semibold leading-snug text-ink">{application.itemName}</p>
                                    {application.itemSubtitle && <p className="truncate text-xs text-slate-500">{application.itemSubtitle}</p>}
                                </div>
                            </div>

                            <fieldset>
                                <legend className="mb-2 text-sm font-semibold text-ink">{m.statusField}</legend>
                                <div className="grid grid-cols-2 gap-2">
                                    {STATUS_COLUMNS.map((col) => {
                                        const selected = status === col.id;
                                        return (
                                            <button
                                                key={col.id}
                                                type="button"
                                                aria-pressed={selected}
                                                onClick={() => setStatus(col.id)}
                                                className={`flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors ${selected ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                            >
                                                {selected ? <Check aria-hidden="true" className="h-4 w-4" /> : <span className={`h-2 w-2 rounded-full ${col.dotClass}`} />}
                                                {m.status[col.id]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>

                            <div>
                                <div className="mb-2 flex items-baseline justify-between">
                                    <label htmlFor="application-deadline" className="text-sm font-semibold text-ink">{m.deadline}</label>
                                    {deadline && <button type="button" onClick={() => setDeadline('')} className="text-xs font-semibold text-brand hover:underline">{m.clearDate}</button>}
                                </div>
                                <input
                                    id="application-deadline"
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                                />
                            </div>

                            <div>
                                <label htmlFor="application-notes" className="mb-2 block text-sm font-semibold text-ink">{m.notes}</label>
                                <textarea
                                    id="application-notes"
                                    rows={5}
                                    maxLength={MAX_NOTES}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={m.notesPlaceholder}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                                />
                                <div className="mt-1 flex justify-between text-xs text-slate-400">
                                    <span>{application.updatedAt ? m.updated(timeAgo(application.updatedAt, intlLocale(locale))) : ''}</span>
                                    <span>{notes.length}/{MAX_NOTES}</span>
                                </div>
                            </div>

                            <Link
                                href={`/${isUniversity ? 'universities' : 'scholarships'}/${application.itemId}`}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                            >
                                {isUniversity ? m.openUniversity : m.openScholarship} <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                            </Link>
                            {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-6">
                            {confirmRemove ? (
                                <span className="flex items-center gap-3 text-sm">
                                    <button type="button" onClick={() => setConfirmRemove(false)} className="font-semibold text-slate-500 hover:text-ink">{m.cancel}</button>
                                    <button type="button" onClick={() => onRemove(application._id)} className="rounded-lg bg-rose-600 px-3 py-2 font-semibold text-white hover:bg-rose-700">{m.remove}</button>
                                </span>
                            ) : (
                                <button type="button" onClick={() => setConfirmRemove(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:underline">
                                    <Trash2 aria-hidden="true" className="h-4 w-4" /> {m.remove}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!dirty || saving}
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004a9f] disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                {saving && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />} {m.saveChanges}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
