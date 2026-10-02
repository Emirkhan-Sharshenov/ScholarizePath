'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle, ArrowUp, Award, Building2, Clock, GraduationCap, Info, Languages, MessageSquarePlus, RotateCw,
    Sparkles, Trophy, UserRound, Wallet, X, type LucideIcon,
} from 'lucide-react';
import type { ScholarshipCardData, UniversityCardData } from '@/lib/ai/types';
import { flagFor } from '@/components/profile/countryList';
import { monogram, TONES, useIsClient, useStudentProfile } from '@/components/common/detailUi';
import { FavoriteButton, useFavoriteIds } from '@/components/common/listUi';
import { useI18n } from '@/i18n/I18nProvider';
import { localizeCountry, localizeLocation } from '@/i18n/countries';
import { apiMessage } from '@/i18n/format';

interface Matches {
    universities: UniversityCardData[];
    scholarships: ScholarshipCardData[];
}

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    time: string;
    /** Assistant notices that aren't part of the conversation sent back to the model. */
    notice?: 'limit' | 'error' | 'signin';
    /** For an error notice: the question to resend. */
    retry?: string;
    matches?: Matches;
}

// Icons for the four starter questions; the text comes from `aibot.suggestions`.
const SUGGESTION_ICONS: LucideIcon[] = [GraduationCap, Award, Wallet, Languages];

const EMPTY: Matches = { universities: [], scholarships: [] };
const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Newest matches first, without duplicates across questions. */
function mergeMatches(prev: Matches, next: Matches): Matches {
    const merge = <T extends { id: string }>(a: T[], b: T[]) => [...b, ...a.filter((x) => !b.some((y) => y.id === x.id))];
    return { universities: merge(prev.universities, next.universities), scholarships: merge(prev.scholarships, next.scholarships) };
}

// ── Matches panel ───────────────────────────────────────────────────────────

function MatchesPanel({ matches }: { matches: Matches }) {
    const uniFav = useFavoriteIds('university');
    const schFav = useFavoriteIds('scholarship');
    const total = matches.universities.length + matches.scholarships.length;
    const { t, locale } = useI18n();
    const a = t.aibot;
    // Rank badges come from the server in English ("World #12", "National #3").
    const rankLabel = (badge: string) => {
        const n = Number(badge.match(/#(\d+)/)?.[1]);
        if (!n) return badge;
        return badge.startsWith('World') ? t.universities.detail.worldRankChip(n) : t.universities.detail.nationalRankChip(n);
    };

    if (total === 0) {
        return (
            <div className="flex flex-col items-center px-4 py-10 text-center">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${TONES.violet}`}><Sparkles aria-hidden="true" className="h-5 w-5" /></span>
                <p className="mt-3 max-w-[16rem] text-sm text-slate-500">{a.matchesEmpty}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {matches.scholarships.length > 0 && (
                <section>
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{a.scholarshipsCount(matches.scholarships.length)}</h3>
                    <ul className="space-y-2">
                        {matches.scholarships.map((s) => (
                            <li key={s.id} className="relative flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 transition-colors hover:border-violet-200">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-brand font-display text-xs font-bold text-white">{monogram(s.title)}</span>
                                <div className="min-w-0 flex-1">
                                    <Link href={`/scholarships/${s.id}`} className="line-clamp-2 text-sm font-semibold leading-snug text-ink after:absolute after:inset-0 hover:text-brand">{s.title}</Link>
                                    <p className="mt-1 text-sm font-semibold text-violet-700">{s.amount || <span className="font-normal italic text-slate-400">{a.amountVaries}</span>}</p>
                                    <p className="mt-0.5 truncate text-xs text-slate-500">{[s.level && (t.scholarships.studyLevels[s.level] ?? s.level), s.country && `${flagFor(s.country)} ${localizeCountry(s.country, locale)}`].filter(Boolean).join(' · ')}</p>
                                </div>
                                <div className="relative z-10">
                                    <FavoriteButton active={schFav.isFavorite(s.id)} onClick={() => schFav.toggle(s.id)} disabled={!schFav.ready} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            {matches.universities.length > 0 && (
                <section>
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{a.universitiesCount(matches.universities.length)}</h3>
                    <ul className="space-y-2">
                        {matches.universities.map((u) => (
                            <li key={u.id} className="relative flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 transition-colors hover:border-blue-200">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-[#1d7fe0] font-display text-xs font-bold text-white">{monogram(u.name)}</span>
                                <div className="min-w-0 flex-1">
                                    <Link href={`/universities/${u.id}`} className="line-clamp-2 text-sm font-semibold leading-snug text-ink after:absolute after:inset-0 hover:text-brand">{u.name}</Link>
                                    {u.location && <p className="mt-0.5 truncate text-xs text-slate-500">{localizeLocation(u.location, locale)} {flagFor(u.country)}</p>}
                                    {u.rankBadge && (
                                        <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${u.rankBadge.startsWith('World') ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-brand'}`}>
                                            <Trophy aria-hidden="true" className="h-3 w-3" /> {rankLabel(u.rankBadge)}
                                        </span>
                                    )}
                                </div>
                                <div className="relative z-10">
                                    <FavoriteButton active={uniFav.isFavorite(u.id)} onClick={() => uniFav.toggle(u.id)} disabled={!uniFav.ready} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

// ── Chat ────────────────────────────────────────────────────────────────────

function Notice({ message, onRetry }: { message: Message; onRetry: (text: string) => void }) {
    const { t } = useI18n();
    const styles = {
        limit: { box: 'border-amber-200 bg-amber-50 text-amber-800', icon: Clock },
        error: { box: 'border-rose-200 bg-rose-50 text-rose-700', icon: AlertTriangle },
        signin: { box: 'border-blue-200 bg-blue-50 text-brand', icon: UserRound },
    }[message.notice!];
    return (
        <div className={`mx-auto flex max-w-lg items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${styles.box}`}>
            <styles.icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0">
                <p>{message.content}</p>
                {message.notice === 'error' && message.retry && (
                    <button type="button" onClick={() => onRetry(message.retry!)} className="mt-1 inline-flex items-center gap-1 font-semibold hover:underline">
                        <RotateCw aria-hidden="true" className="h-3.5 w-3.5" /> {t.aibot.tryAgain}
                    </button>
                )}
                {message.notice === 'signin' && <Link href="/login" className="mt-1 inline-block font-semibold hover:underline">{t.aibot.signIn}</Link>}
            </div>
        </div>
    );
}

function InlineMatches({ matches, onShowAll }: { matches: Matches; onShowAll: () => void }) {
    const { t } = useI18n();
    const items = [
        ...matches.universities.map((u) => ({ id: u.id, label: u.name, href: `/universities/${u.id}`, icon: Building2 })),
        ...matches.scholarships.map((s) => ({ id: s.id, label: s.title, href: `/scholarships/${s.id}`, icon: Award })),
    ];
    if (items.length === 0) return null;
    return (
        <div className="mt-3 flex flex-wrap gap-1.5">
            {items.slice(0, 4).map((item) => (
                <Link key={item.href} href={item.href} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-200 hover:text-brand">
                    <item.icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-400" /> <span className="truncate">{item.label}</span>
                </Link>
            ))}
            {items.length > 4 && (
                <button type="button" onClick={onShowAll} className="rounded-full px-2 py-1 text-xs font-semibold text-brand hover:underline lg:hidden">{t.aibot.more(items.length - 4)}</button>
            )}
            {items.length > 4 && <span className="hidden px-2 py-1 text-xs text-slate-400 lg:inline">{t.aibot.moreInPanel(items.length - 4)}</span>}
        </div>
    );
}

export default function AIAdvisor() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<Matches>(EMPTY);
    const [sheetOpen, setSheetOpen] = useState(false);
    const profile = useStudentProfile();
    const isClient = useIsClient();
    const listRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const nextId = useRef(1);
    const { t } = useI18n();
    const a = t.aibot;

    const matchCount = matches.universities.length + matches.scholarships.length;

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, loading]);

    const push = (m: Omit<Message, 'id' | 'time'>) => setMessages((prev) => [...prev, { ...m, id: nextId.current++, time: timeNow() }]);

    /** Sends a question; `history` is the conversation before it (notices excluded). */
    const ask = async (text: string, history: Message[]) => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: history.filter((m) => !m.notice).map(({ role, content }) => ({ role, content })) }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.status === 401) {
                push({ role: 'assistant', notice: 'signin', content: a.signInNotice });
                return;
            }
            if (res.status === 429) {
                push({ role: 'assistant', notice: 'limit', content: apiMessage(t, data.message, a.limitNotice) });
                return;
            }
            if (!res.ok) throw new Error('Request failed');
            const found: Matches = { universities: data.universities ?? [], scholarships: data.scholarships ?? [] };
            push({ role: 'assistant', content: data.reply ?? a.fallbackReply, matches: found });
            setMatches((prev) => mergeMatches(prev, found));
        } catch {
            push({ role: 'assistant', notice: 'error', content: a.errorNotice, retry: text });
        } finally {
            setLoading(false);
        }
    };

    const send = (raw: string) => {
        const text = raw.trim();
        if (!text || loading) return;
        const history = messages;
        push({ role: 'user', content: text });
        setInput('');
        if (inputRef.current) inputRef.current.style.height = '';
        ask(text, history);
    };

    const retry = (text: string) => {
        if (loading) return;
        // Drop the failed notice; the question itself is already in the conversation.
        const withoutNotice = messages.filter((m) => !(m.notice === 'error' && m.retry === text));
        setMessages(withoutNotice);
        const lastUser = withoutNotice.map((m) => m.role === 'user' && m.content === text).lastIndexOf(true);
        ask(text, withoutNotice.slice(0, lastUser));
    };

    const newChat = () => {
        setMessages([]);
        setMatches(EMPTY);
        setInput('');
        inputRef.current?.focus();
    };

    return (
        <div className="bg-[#f7f9fc] px-4 py-4 font-body md:px-8 md:py-6">
            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                {/* Chat */}
                <section className="flex h-[calc(100dvh-10rem)] min-h-[460px] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_12px_rgba(10,26,63,0.04)] md:h-[calc(100dvh-3rem)] lg:max-h-[900px]">
                    <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-6">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES.violet}`}><Sparkles aria-hidden="true" className="h-5 w-5" /></span>
                        <div className="min-w-0 flex-1">
                            <h1 className="font-display text-lg font-bold leading-tight text-ink">{a.title}</h1>
                            <p className="truncate text-xs text-slate-500 sm:text-sm">{a.subtitle}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSheetOpen(true)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-violet-50 px-3 text-xs font-semibold text-violet-700 lg:hidden"
                        >
                            {a.matches} <span className="rounded-full bg-violet-600 px-1.5 text-white">{matchCount}</span>
                        </button>
                        {messages.length > 0 && (
                            <button type="button" onClick={newChat} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-brand hover:bg-blue-50 sm:text-sm">
                                <MessageSquarePlus aria-hidden="true" className="h-4 w-4" /> <span className="hidden sm:inline">{a.newChat}</span><span className="sm:hidden">{a.newShort}</span>
                            </button>
                        )}
                    </header>

                    <div ref={listRef} aria-live="polite" className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
                        {messages.length === 0 && (
                            <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-brand text-white shadow-lg shadow-violet-900/10"><Sparkles aria-hidden="true" className="h-6 w-6" /></span>
                                <h2 className="mt-4 font-display text-xl font-bold text-ink">{a.greeting}</h2>
                                <p className="mt-1 max-w-md text-sm text-slate-500">{a.greetingText}</p>
                                <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                                    {a.suggestions.map((text, i) => {
                                        const Icon = SUGGESTION_ICONS[i];
                                        return (
                                        <button
                                            key={text}
                                            type="button"
                                            onClick={() => send(text)}
                                            className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50/40 hover:text-ink"
                                        >
                                            <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-brand" /> {text}
                                        </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {messages.map((m) => (m.notice ? (
                            <Notice key={m.id} message={m} onRetry={retry} />
                        ) : m.role === 'user' ? (
                            <div key={m.id} className="flex flex-col items-end">
                                <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-brand px-4 py-3 text-sm leading-relaxed text-white sm:max-w-[70%]">{m.content}</div>
                                <span className="mt-1 pr-1 text-[11px] text-slate-400">{m.time}</span>
                            </div>
                        ) : (
                            <div key={m.id} className="flex items-start gap-3">
                                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${TONES.violet}`}><Sparkles aria-hidden="true" className="h-4 w-4" /></span>
                                <div className="min-w-0 max-w-[85%] sm:max-w-[75%]">
                                    <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tl-md border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm leading-relaxed text-slate-700">
                                        {m.content}
                                        {m.matches && <InlineMatches matches={m.matches} onShowAll={() => setSheetOpen(true)} />}
                                    </div>
                                    <span className="mt-1 block pl-1 text-[11px] text-slate-400">{m.time}</span>
                                </div>
                            </div>
                        )))}

                        {loading && (
                            <div className="flex items-center gap-3">
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${TONES.violet}`}><Sparkles aria-hidden="true" className="h-4 w-4" /></span>
                                <span className="inline-flex items-center gap-1 rounded-2xl rounded-tl-md border border-slate-200/80 bg-slate-50/70 px-4 py-3.5" aria-label={a.typing}>
                                    {[0, 1, 2].map((i) => (
                                        <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 150}ms` }} />
                                    ))}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Composer */}
                    <div className="border-t border-slate-100 px-4 pb-3 pt-3 sm:px-6 sm:pb-4">
                        {profile.status === 'ready' && (
                            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-brand">
                                <UserRound aria-hidden="true" className="h-3.5 w-3.5" /> {a.usesProfile}{' '}
                                <Link href="/student" className="font-semibold hover:underline">{a.edit}</Link>
                            </p>
                        )}
                        <form
                            onSubmit={(e) => { e.preventDefault(); send(input); }}
                            className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-2 pl-4 transition-colors focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10"
                        >
                            <label htmlFor="ai-input" className="sr-only">{a.yourQuestion}</label>
                            <textarea
                                id="ai-input"
                                ref={inputRef}
                                rows={1}
                                value={input}
                                maxLength={1000}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                                        e.preventDefault();
                                        send(input);
                                    }
                                }}
                                placeholder={a.placeholder}
                                className="max-h-[140px] min-h-[24px] flex-1 resize-none bg-transparent py-2 text-sm leading-6 text-ink placeholder:text-slate-400 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                aria-label={a.send}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm transition hover:bg-[#004a9f] active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                            >
                                <ArrowUp aria-hidden="true" className="h-5 w-5" />
                            </button>
                        </form>
                        <div className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[11px] text-slate-400">
                            <span className="inline-flex items-center gap-1"><Info aria-hidden="true" className="h-3 w-3" /> {a.disclaimer}</span>
                            <span className="hidden sm:inline">{a.newLine}</span>
                        </div>
                    </div>
                </section>

                {/* Matches — side panel on desktop */}
                <aside className="hidden max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] lg:sticky lg:top-6 lg:block">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="font-display text-lg font-bold text-ink">{a.matchesTitle}</h2>
                        {matchCount > 0 && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{a.found(matchCount)}</span>}
                    </div>
                    <MatchesPanel matches={matches} />
                </aside>
            </div>

            {/* Matches — bottom sheet on phones and tablets */}
            {isClient && createPortal(
                <AnimatePresence>
                    {sheetOpen && (
                        <motion.div
                            key="matches-sheet"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-end bg-slate-900/40 font-body backdrop-blur-[2px] lg:hidden"
                            onClick={() => setSheetOpen(false)}
                        >
                            <motion.div
                                role="dialog"
                                aria-modal="true"
                                aria-label={a.matchesTitle}
                                initial={{ y: 40 }}
                                animate={{ y: 0 }}
                                exit={{ y: 40 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                onClick={(e) => e.stopPropagation()}
                                className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-[#f7f9fc] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3"
                            >
                                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300" />
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-display text-lg font-bold text-ink">{a.matchesTitle} ({matchCount})</h2>
                                    <button type="button" onClick={() => setSheetOpen(false)} aria-label={a.close} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                                        <X aria-hidden="true" className="h-4 w-4" />
                                    </button>
                                </div>
                                <MatchesPanel matches={matches} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </div>
    );
}
