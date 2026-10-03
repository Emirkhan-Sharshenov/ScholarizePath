'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { apiMessage } from '@/i18n/format';

interface DeleteAccountProps {
    email: string;
    authProvider?: string;
}

// Saved on this device only; cleared too so nothing of the account is left behind.
const LOCAL_KEYS = ['compare_universities', 'compare_scholarships', 'unilist:docx-list'];

export function DeleteAccount({ email, authProvider }: DeleteAccountProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useI18n();
    const m = t.student;

    // Google accounts have no password, so they confirm by typing their email.
    const usesEmail = authProvider === 'google';

    const close = () => {
        if (deleting) return;
        setOpen(false);
        setValue('');
        setError(null);
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim() || deleting) return;
        setDeleting(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/self', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(usesEmail ? { email: value } : { password: value }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                setError(apiMessage(t, data.message, m.deleteFailed));
                setDeleting(false);
                return;
            }
            try {
                LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
            } catch {}
            // Full reload so no signed-in state survives in memory, and
            // replace so Back doesn't return to the deleted profile.
            window.location.replace(window.location.origin);
        } catch {
            setError(m.unreachable);
            setDeleting(false);
        }
    };

    return (
        <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Trash2 aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                        <h3 className="font-display text-lg font-semibold text-ink">{m.deleteTitle}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">{m.deleteText}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                    {m.deleteButton}
                </button>
            </div>

            {createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.div
                            key="delete-account-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 font-body backdrop-blur-[2px] sm:items-center sm:p-4"
                            onClick={close}
                        >
                            <motion.form
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="delete-account-title"
                                initial={{ y: 24, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 24, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                onClick={(e) => e.stopPropagation()}
                                onSubmit={handleDelete}
                                className="w-full rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                                        <AlertTriangle aria-hidden="true" className="h-5 w-5" />
                                    </span>
                                    <button
                                        type="button"
                                        onClick={close}
                                        aria-label={m.close}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-ink"
                                    >
                                        <X aria-hidden="true" className="h-4 w-4" />
                                    </button>
                                </div>

                                <h2 id="delete-account-title" className="mt-4 font-display text-xl font-bold text-ink">
                                    {m.deleteDialog}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">{m.deletes}</p>
                                <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                                    {m.whatGoes.map((item) => (
                                        <li key={item} className="flex gap-2">
                                            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                <label className="mt-5 block">
                                    <span className="text-sm font-semibold text-ink">
                                        {usesEmail ? (
                                            <>{m.type} <span className="font-mono text-[13px]">{email}</span> {m.typeEmail}</>
                                        ) : (
                                            m.enterPassword
                                        )}
                                    </span>
                                    <input
                                        type={usesEmail ? 'email' : 'password'}
                                        autoComplete={usesEmail ? 'off' : 'current-password'}
                                        autoFocus
                                        value={value}
                                        onChange={(e) => {
                                            setValue(e.target.value);
                                            setError(null);
                                        }}
                                        aria-invalid={!!error}
                                        aria-describedby={error ? 'delete-account-error' : undefined}
                                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-ink outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                                    />
                                </label>
                                {error && (
                                    <p id="delete-account-error" role="alert" className="mt-2 text-sm text-red-600">
                                        {error}
                                    </p>
                                )}

                                <div className="mt-6 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={close}
                                        disabled={deleting}
                                        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        {m.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!value.trim() || deleting}
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {deleting && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
                                        {m.deleteForever}
                                    </button>
                                </div>
                            </motion.form>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </section>
    );
}
