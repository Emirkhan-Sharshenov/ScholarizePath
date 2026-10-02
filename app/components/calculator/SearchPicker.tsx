'use client';

import { useEffect, useId, useState } from 'react';
import { Heart, Loader2, Search, X } from 'lucide-react';
import { monogram } from '@/components/common/detailUi';
import type { PickerItem } from './calculatorTypes';
import { useI18n } from '@/i18n/I18nProvider';

interface SearchPickerProps {
    label: string;
    placeholder: string;
    tone: 'blue' | 'violet';
    /** Returns up to ~6 matches for a query of 2+ characters. */
    search: (query: string) => Promise<PickerItem[]>;
    /** Shortcuts shown under the field (the user's favourites). */
    favorites: PickerItem[];
    selected: PickerItem | null;
    onSelect: (item: PickerItem) => void;
    onClear: () => void;
    loadingSelected?: boolean;
}

/** Search-as-you-type combobox with a "From your favourites" shortcut row. */
export default function SearchPicker({ label, placeholder, tone, search, favorites, selected, onSelect, onClear, loadingSelected }: SearchPickerProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PickerItem[]>([]);
    const [searching, setSearching] = useState(false);
    const [active, setActive] = useState(-1);
    const listId = useId();
    const { t } = useI18n();
    const m = t.calculator;

    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) return;
        let cancelled = false;
        const t = setTimeout(async () => {
            setSearching(true);
            try {
                const items = await search(q);
                if (!cancelled) { setResults(items); setActive(-1); }
            } finally {
                if (!cancelled) setSearching(false);
            }
        }, 300);
        return () => { cancelled = true; clearTimeout(t); };
    }, [query, search]);

    const open = query.trim().length >= 2 && (results.length > 0 || !searching);
    const tile = tone === 'blue' ? 'from-brand to-[#1d7fe0]' : 'from-violet-600 to-brand';

    const pick = (item: PickerItem) => {
        setQuery('');
        setResults([]);
        onSelect(item);
    };

    if (selected) {
        return (
            <div>
                <p className="mb-2 text-sm font-semibold text-ink">{label}</p>
                <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-display text-xs font-bold text-white ${tile}`}>{monogram(selected.name)}</span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{selected.name}</p>
                        {selected.subtitle && <p className="truncate text-xs text-slate-500">{selected.subtitle}</p>}
                    </div>
                    {loadingSelected && <Loader2 aria-label={m.loading} className="h-4 w-4 animate-spin text-slate-400" />}
                    <button type="button" onClick={onClear} aria-label={m.change(label)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-ink">
                        <X aria-hidden="true" className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <label htmlFor={`${listId}-input`} className="mb-2 block text-sm font-semibold text-ink">{label}</label>
            <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    id={`${listId}-input`}
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                    autoComplete="off"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
                        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                        else if (e.key === 'Enter' && active >= 0 && results[active]) { e.preventDefault(); pick(results[active]); }
                        else if (e.key === 'Escape') setQuery('');
                    }}
                    placeholder={placeholder}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                />
                {searching && <Loader2 aria-hidden="true" className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
                {open && (
                    <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-20 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_32px_rgba(10,26,63,0.12)]">
                        {results.length === 0 ? (
                            <li className="px-3 py-3 text-sm text-slate-500">{m.noMatches(query.trim())}</li>
                        ) : results.map((item, i) => (
                            <li key={item.id} id={`${listId}-${i}`} role="option" aria-selected={active === i}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => pick(item)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left ${active === i ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                >
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br font-display text-[11px] font-bold text-white ${tile}`}>{monogram(item.name)}</span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-ink">{item.name}</span>
                                        {item.subtitle && <span className="block truncate text-xs text-slate-500">{item.subtitle}</span>}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {favorites.length > 0 && (
                <div className="mt-3">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400"><Heart aria-hidden="true" className="h-3 w-3" /> {m.fromFavourites}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {favorites.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => pick(item)}
                                className="max-w-full truncate rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-brand"
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
