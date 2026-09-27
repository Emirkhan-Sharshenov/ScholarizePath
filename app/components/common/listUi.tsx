'use client';

// Building blocks shared by the Universities and Scholarships catalogue pages.

import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Heart, SearchX, X } from 'lucide-react';

export const inputClass =
    'h-11 w-full rounded-[10px] border border-slate-200 bg-white px-3.5 text-sm text-ink shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10';

export function FilterSection({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{label}</span>
                {hint && <span className="text-xs text-slate-400">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

export function SelectField({ name, value, onChange, children, ariaLabel }: {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    ariaLabel?: string;
}) {
    return (
        <div className="relative">
            <select name={name} value={value} onChange={onChange} aria-label={ariaLabel} className={`${inputClass} cursor-pointer appearance-none pr-9`}>
                {children}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
    );
}

/** Single-choice chips; clicking the selected chip clears it (back to `emptyValue`). */
export function ChipGroup({ options, value, emptyValue, onChange, ariaLabel }: {
    options: string[];
    value: string;
    emptyValue: string;
    onChange: (v: string) => void;
    ariaLabel: string;
}) {
    return (
        <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const selected = value === opt;
                return (
                    <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(selected ? emptyValue : opt)}
                        className={`h-9 rounded-full border px-3.5 text-sm font-medium transition-colors ${selected ? 'border-brand bg-brand text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-ink'}`}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
    );
}

export interface ActiveFilter {
    key: string;
    label: string;
    onRemove: () => void;
}

export function ActiveFilterChips({ filters, onClearAll }: { filters: ActiveFilter[]; onClearAll: () => void }) {
    if (!filters.length) return null;
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:inline">Active</span>
            {filters.map((f) => (
                <button
                    key={f.key}
                    type="button"
                    onClick={f.onRemove}
                    aria-label={`Remove filter ${f.label}`}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 text-sm font-medium text-brand transition-colors hover:bg-blue-100"
                >
                    {f.label}
                    <X aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
            ))}
            <button type="button" onClick={onClearAll} className="shrink-0 px-1 text-sm font-semibold text-brand hover:underline">
                Clear all
            </button>
        </div>
    );
}

function pageRange(current: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const range: (number | '…')[] = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) range.push('…');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push('…');
    range.push(total);
    return range;
}

export function Pagination({ page, totalPages, onChange, disabled }: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
    disabled?: boolean;
}) {
    if (totalPages <= 1) return null;
    const btn = 'inline-flex h-10 items-center gap-1.5 rounded-[10px] px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40';
    return (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_4px_12px_rgba(10,26,63,0.04)]">
            <button type="button" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)} className={`${btn} text-ink hover:bg-slate-100`}>
                <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Prev
            </button>

            <div className="hidden items-center gap-1 sm:flex">
                {pageRange(page, totalPages).map((p, i) =>
                    p === '…' ? (
                        <span key={`gap-${i}`} className="px-1.5 text-sm text-slate-400">…</span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(p)}
                            aria-current={p === page ? 'page' : undefined}
                            className={`h-10 min-w-10 rounded-[10px] px-2 text-sm font-semibold transition-colors ${p === page ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {p}
                        </button>
                    )
                )}
            </div>
            <span className="text-sm text-slate-500 sm:hidden">
                Page <span className="font-semibold text-ink">{page}</span> of {totalPages}
            </span>

            <button type="button" disabled={disabled || page >= totalPages} onClick={() => onChange(page + 1)} className={`${btn} text-ink hover:bg-slate-100`}>
                Next <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
        </nav>
    );
}

export function EmptyState({ title, text, onClear }: { title: string; text: string; onClear?: () => void }) {
    return (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand">
                <SearchX aria-hidden="true" className="h-7 w-7" />
            </span>
            <p className="mt-4 font-display text-lg font-semibold text-ink">{title}</p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">{text}</p>
            {onClear && (
                <button type="button" onClick={onClear} className="mt-5 h-11 rounded-[10px] bg-brand px-5 text-sm font-semibold text-white hover:bg-[#004a9f]">
                    Clear filters
                </button>
            )}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="animate-pulse rounded-3xl border border-slate-200/80 bg-white p-6">
            <div className="flex gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-200/70" />
                <div className="flex-1 space-y-3">
                    <div className="h-5 w-2/3 rounded bg-slate-200/70" />
                    <div className="h-4 w-1/3 rounded bg-slate-200/70" />
                    <div className="h-4 w-full rounded bg-slate-100" />
                </div>
            </div>
        </div>
    );
}

// Favorites for a whole list: loaded once, toggled optimistically. (useFavorites
// is per item and would fire one /api/auth/self request per card.)
export function useFavoriteIds(type: 'university' | 'scholarship') {
    const [ids, setIds] = useState<{ universities: string[]; scholarships: string[] } | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/auth/self')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (cancelled || !data?.user) return;
                setIds({ universities: data.user.favoriteUniversities ?? [], scholarships: data.user.favoriteScholarships ?? [] });
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    const list = ids ? (type === 'university' ? ids.universities : ids.scholarships) : [];

    const toggle = useCallback(async (id: string) => {
        if (!ids) return;
        const key = type === 'university' ? 'universities' : 'scholarships';
        const previous = ids;
        const current = ids[key];
        const next = { ...ids, [key]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id] };
        setIds(next);
        try {
            const res = await fetch('/api/auth/self', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favoriteUniversities: next.universities, favoriteScholarships: next.scholarships }),
            });
            if (!res.ok) setIds(previous);
        } catch {
            setIds(previous);
        }
    }, [ids, type]);

    return { isFavorite: (id: string) => list.includes(id), toggle, ready: ids !== null };
}

export function FavoriteButton({ active, onClick, disabled }: { active: boolean; onClick: () => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-pressed={active}
            aria-label={active ? 'Remove from favourites' : 'Add to favourites'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
        >
            <Heart aria-hidden="true" className={`h-[18px] w-[18px] ${active ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
    );
}
