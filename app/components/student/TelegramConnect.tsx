'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, Send } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

interface TelegramConnectProps {
    /** From /api/auth/self: present once the student has connected the bot. */
    telegram?: { chatId?: string | null; username?: string | null } | null;
}

const POLL_MS = 3000;
// Matches the link's lifetime on the server (LINK_TTL_MS).
const WAIT_LIMIT_MS = 15 * 60 * 1000;

/**
 * Connecting is two steps: the server makes a one-time t.me link, the student
 * opens it and presses Start, and this block polls until the bot has
 * confirmed the chat.
 */
export function TelegramConnect({ telegram }: TelegramConnectProps) {
    const [linked, setLinked] = useState(Boolean(telegram?.chatId));
    const [username, setUsername] = useState<string | null>(telegram?.username ?? null);
    const [link, setLink] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useI18n();
    const m = t.telegram;

    // While a link is out, check every few seconds whether the bot got /start.
    useEffect(() => {
        if (!link) return;
        const started = Date.now();
        const timer = setInterval(async () => {
            if (Date.now() - started > WAIT_LIMIT_MS) {
                setLink(null);
                return;
            }
            const res = await fetch('/api/auth/self').catch(() => null);
            const data = res?.ok ? await res.json().catch(() => null) : null;
            if (data?.user?.telegram?.chatId) {
                setLinked(true);
                setUsername(data.user.telegram.username ?? null);
                setLink(null);
            }
        }, POLL_MS);
        return () => clearInterval(timer);
    }, [link]);

    const connect = async () => {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch('/api/telegram/link', { method: 'POST' });
            const data = await res.json().catch(() => ({}));
            if (res.status === 503) setError(m.unavailable);
            else if (!res.ok || !data.url) setError(m.error);
            else {
                setLink(data.url);
                // Usually allowed right after a click; if a blocker stops it, the button below does the job.
                window.open(data.url, '_blank', 'noopener');
            }
        } catch {
            setError(m.error);
        } finally {
            setBusy(false);
        }
    };

    const disconnect = async () => {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch('/api/telegram/link', { method: 'DELETE' });
            if (res.ok) {
                setLinked(false);
                setUsername(null);
            } else setError(m.error);
        } catch {
            setError(m.error);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold text-ink">
                        <Send aria-hidden="true" className="h-4 w-4 text-[#229ED9]" /> {m.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {linked ? <span className="font-medium text-emerald-700">{m.connected(username)}</span> : m.text}
                    </p>
                </div>

                {linked ? (
                    <button
                        type="button"
                        onClick={disconnect}
                        disabled={busy}
                        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
                    >
                        {busy && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />} {m.disconnect}
                    </button>
                ) : link ? (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#229ED9] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1c8bc0]"
                    >
                        {m.openTelegram} <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    </a>
                ) : (
                    <button
                        type="button"
                        onClick={connect}
                        disabled={busy}
                        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#229ED9] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1c8bc0] disabled:opacity-60"
                    >
                        {busy ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Send aria-hidden="true" className="h-4 w-4" />} {m.connect}
                    </button>
                )}
            </div>

            {link && !linked && (
                <p role="status" className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 px-3.5 py-2.5 text-sm text-sky-800">
                    <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin" /> {m.waiting}
                </p>
            )}
            {error && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
        </div>
    );
}
