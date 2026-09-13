'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Building2, Loader2, Heart } from 'lucide-react';
import { UniversitySummary } from './calculatorTypes';

interface UniversityPickerProps {
    onSelect: (id: string) => void;
    selectedName?: string;
}

export default function UniversityPicker({ onSelect, selectedName }: UniversityPickerProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UniversitySummary[]>([]);
    const [searching, setSearching] = useState(false);
    const [favorites, setFavorites] = useState<UniversitySummary[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function loadFavorites() {
            try {
                const selfRes = await fetch('/api/auth/self');
                if (!selfRes.ok) return;
                const selfData = await selfRes.json();
                const ids: string[] = selfData?.user?.favoriteUniversities || [];
                const items = await Promise.all(
                    ids.slice(0, 6).map(async (id): Promise<UniversitySummary | null> => {
                        try {
                            const res = await fetch(`/api/universities/${id}`);
                            if (!res.ok) return null;
                            const data = await res.json();
                            const uni = data.university || data;
                            return {
                                id: uni._id || uni.id || id,
                                name: uni.name,
                                location: uni.location
                                    ? [uni.location.city, uni.location.country].filter(Boolean).join(', ')
                                    : undefined,
                            };
                        } catch {
                            return null;
                        }
                    })
                );
                if (!cancelled) setFavorites(items.filter((i): i is UniversitySummary => i !== null));
            } catch {
                // favorites are a convenience shortcut — silently skip on failure
            }
        }
        loadFavorites();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setSearching(true);
            try {
                const res = await fetch(`/api/universities?search=${encodeURIComponent(query.trim())}&limit=6`);
                if (!res.ok) return;
                const data = await res.json();
                const list = Array.isArray(data.data) ? data.data : [];
                setResults(
                    list.map((uni: any) => ({
                        id: uni._id || uni.id,
                        name: uni.name,
                        location: uni.location
                            ? [uni.location.city, uni.location.country].filter(Boolean).join(', ')
                            : undefined,
                    }))
                );
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    const handlePick = (item: UniversitySummary) => {
        setQuery('');
        setResults([]);
        onSelect(item.id);
    };

    return (
        <div>
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={selectedName || 'Search a university by name...'}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-300" />
                )}
            </div>

            {results.length > 0 && (
                <div className="mt-2 space-y-1 rounded-xl border border-slate-100 bg-white p-1.5 shadow-sm">
                    {results.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handlePick(item)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
                        >
                            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-slate-800">{item.name}</div>
                                {item.location && (
                                    <div className="truncate text-xs text-slate-400">{item.location}</div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {favorites.length > 0 && (
                <div className="mt-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <Heart className="h-3 w-3" />
                        From your favorites
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {favorites.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handlePick(item)}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
