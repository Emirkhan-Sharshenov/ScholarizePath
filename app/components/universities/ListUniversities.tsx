'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, MapPin, Search, SlidersHorizontal, Trophy, Wallet } from 'lucide-react';
import FilterUniversities, { FilterState, initialFilters } from './FilterUniversities';
import MobileFilterDrawer from '../common/MobileFilterDrawer';
import {
    ActiveFilterChips,
    CardSkeleton,
    EmptyState,
    FavoriteButton,
    Pagination,
    SelectField,
    useFavoriteIds,
    type ActiveFilter,
} from '../common/listUi';
import { flagFor } from '../profile/countryList';
import { monogram } from '../common/detailUi';
import { formatCheckedAt, getVerification } from '@/lib/verification';

interface UniversitiesListUIProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

interface UniversityRow {
    _id: string;
    name: string;
    location?: { city?: string; country?: string } | string;
    ranking?: number | string | { global?: number | string | null; qs?: number | null; world?: number | null; national?: number | null };
    tuition?: number | string | { bachelor?: number | null; master?: number | null; phd?: number | null };
    description?: string;
    programs?: string[];
    institutionType?: string;
    verification?: unknown;
}

const SORT_OPTIONS = [
    ['Ranking: High to Low', 'Ranking: best first'],
    ['Ranking: Low to High', 'Ranking: lowest first'],
    ['Tuition: Low to High', 'Tuition: low to high'],
    ['Tuition: High to Low', 'Tuition: high to low'],
] as const;

const ITEMS_PER_PAGE = 5;

function getLocation(uni: UniversityRow): { city: string; country: string } {
    if (typeof uni.location === 'string') return { city: uni.location, country: '' };
    return { city: uni.location?.city ?? '', country: uni.location?.country ?? '' };
}

// World rank first; a national rank is labelled as such rather than passed off as global.
function getRank(uni: UniversityRow): { label: string; value: string } | null {
    if (typeof uni.ranking === 'number' || (typeof uni.ranking === 'string' && uni.ranking !== 'N/A')) return { label: 'World rank', value: `#${uni.ranking}` };
    const r = typeof uni.ranking === 'object' && uni.ranking ? uni.ranking : undefined;
    const world = r?.global ?? r?.qs ?? r?.world;
    if (world && world !== 'N/A') return { label: 'World rank', value: `#${world}` };
    if (r?.national) return { label: 'National rank', value: `#${r.national}` };
    return null;
}

function getTuition(uni: UniversityRow): string | null {
    if (typeof uni.tuition === 'number') return uni.tuition === 0 ? 'Free' : `$${uni.tuition.toLocaleString('en-US')}/yr`;
    if (typeof uni.tuition === 'string') return uni.tuition;
    const val = uni.tuition?.bachelor ?? uni.tuition?.master ?? uni.tuition?.phd;
    if (val === 0) return 'Free';
    return val != null ? `$${val.toLocaleString('en-US')}/yr` : null;
}

function UniversityCard({ uni, favorite, onToggleFavorite, favoritesReady }: {
    uni: UniversityRow;
    favorite: boolean;
    onToggleFavorite: () => void;
    favoritesReady: boolean;
}) {
    const { city, country } = getLocation(uni);
    const rank = getRank(uni);
    const tuition = getTuition(uni);
    const verification = getVerification(uni);
    const programs = (uni.programs ?? []).slice(0, 3);

    return (
        <article className="group relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_10px_24px_rgba(10,26,63,0.08)] sm:p-6">
            <div className="flex gap-4">
                <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 font-display text-base font-bold text-brand sm:flex">
                    {monogram(uni.name)}
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="font-display text-lg font-semibold leading-snug text-ink">
                                <Link href={`/universities/${uni._id}`} className="after:absolute after:inset-0 focus:outline-none">
                                    {uni.name}
                                </Link>
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                {verification.isVerified && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                        <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" /> Verified · {formatCheckedAt(verification.checkedAt)}
                                    </span>
                                )}
                                {uni.institutionType && uni.institutionType !== 'University' && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{uni.institutionType}</span>
                                )}
                            </div>
                        </div>
                        {/* Above the card-wide link so it stays clickable */}
                        <div className="relative z-10">
                            <FavoriteButton active={favorite} onClick={onToggleFavorite} disabled={!favoritesReady} />
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        {(city || country) && (
                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                                <MapPin aria-hidden="true" className="h-4 w-4 text-slate-400" />
                                {[city, country].filter(Boolean).join(', ')} {flagFor(country)}
                            </span>
                        )}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${rank ? 'bg-blue-50 text-brand' : 'bg-slate-100 text-slate-500'}`}>
                            <Trophy aria-hidden="true" className="h-3.5 w-3.5" />
                            {rank ? `${rank.label} ${rank.value}` : 'Not ranked'}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tuition ? 'bg-slate-100 text-ink' : 'bg-slate-100 text-slate-500'}`}>
                            <Wallet aria-hidden="true" className="h-3.5 w-3.5" />
                            {tuition ? `Tuition ${tuition}` : 'Tuition: No data'}
                        </span>
                    </div>

                    {uni.description && (
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{uni.description}</p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-wrap gap-1.5">
                            {programs.map((p) => (
                                <span key={p} className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">{p}</span>
                            ))}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                            View details <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function ListUniversities({ filters, setFilters }: UniversitiesListUIProps) {
    const [universities, setUniversities] = useState<UniversityRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Ranking: High to Low');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const favorites = useFavoriteIds('university');

    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(filters.search), 350);
        return () => clearTimeout(timer);
    }, [filters.search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        debouncedSearch,
        filters.country,
        filters.minRanking,
        filters.maxRanking,
        filters.minTuition,
        filters.maxTuition,
        filters.programs,
        filters.degreeLevel,
        sortBy,
    ]);

    const fetchUniversities = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(ITEMS_PER_PAGE),
                sortBy,
            });

            if (debouncedSearch) params.set('search', debouncedSearch);
            if (filters.country && filters.country !== 'All Countries') params.set('country', filters.country);
            if (filters.minRanking) params.set('minRanking', filters.minRanking);
            if (filters.maxRanking) params.set('maxRanking', filters.maxRanking);
            if (filters.minTuition) params.set('minTuition', filters.minTuition);
            if (filters.maxTuition) params.set('maxTuition', filters.maxTuition);
            if (filters.programs && filters.programs !== 'All Programs') params.set('programs', filters.programs);
            if (filters.degreeLevel && filters.degreeLevel !== 'All Degree Levels') params.set('degreeLevel', filters.degreeLevel);

            const res = await fetch(`/api/universities?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch universities');
            const json = await res.json();

            setUniversities(json.data || []);
            setTotalCount(json.totalCount || 0);
            setTotalPages(json.totalPages || 1);
        } catch (error) {
            console.error('Fetch error:', error);
            setUniversities([]);
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [
        currentPage,
        sortBy,
        debouncedSearch,
        filters.country,
        filters.minRanking,
        filters.maxRanking,
        filters.minTuition,
        filters.maxTuition,
        filters.programs,
        filters.degreeLevel,
    ]);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    const update = (patch: Partial<FilterState>) => setFilters((prev) => ({ ...prev, ...patch }));

    const active: ActiveFilter[] = [];
    if (filters.country !== initialFilters.country) active.push({ key: 'country', label: `${flagFor(filters.country)} ${filters.country}`, onRemove: () => update({ country: initialFilters.country }) });
    if (filters.minRanking || filters.maxRanking) active.push({ key: 'rank', label: `Rank ${filters.minRanking || '1'}–${filters.maxRanking || '…'}`, onRemove: () => update({ minRanking: '', maxRanking: '' }) });
    if (filters.minTuition || filters.maxTuition) active.push({ key: 'tuition', label: `Tuition $${filters.minTuition || '0'}–${filters.maxTuition ? `$${filters.maxTuition}` : '…'}`, onRemove: () => update({ minTuition: '', maxTuition: '' }) });
    if (filters.programs !== initialFilters.programs) active.push({ key: 'programs', label: filters.programs, onRemove: () => update({ programs: initialFilters.programs }) });
    if (filters.degreeLevel !== initialFilters.degreeLevel) active.push({ key: 'degree', label: filters.degreeLevel, onRemove: () => update({ degreeLevel: initialFilters.degreeLevel }) });
    const clearAll = () => setFilters(initialFilters);

    const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const showingEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

    return (
        <div className="w-full space-y-4 font-body">
            {/* Search + sort (+ Filters button on mobile) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={filters.search}
                            onChange={(e) => update({ search: e.target.value })}
                            placeholder="Search by name, country, city…"
                            aria-label="Search universities"
                            className="h-11 w-full rounded-[10px] border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand/10"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] bg-brand px-4 text-sm font-semibold text-white lg:hidden"
                    >
                        <SlidersHorizontal aria-hidden="true" className="h-4 w-4" /> Filters
                        {active.length > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-ink">{active.length}</span>
                        )}
                    </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                        {loading ? 'Loading…' : totalCount === 0 ? 'No universities found' : (
                            <>Showing <span className="font-semibold text-ink">{showingStart}–{showingEnd}</span> of <span className="font-semibold text-ink">{totalCount.toLocaleString('en-US')}</span> universities</>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Sort by</span>
                        <div className="w-52">
                            <SelectField name="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} ariaLabel="Sort universities">
                                {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </SelectField>
                        </div>
                    </div>
                </div>

                {active.length > 0 && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                        <ActiveFilterChips filters={active} onClearAll={clearAll} />
                    </div>
                )}
            </div>

            <MobileFilterDrawer open={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} title="Filter universities">
                <FilterUniversities
                    filters={filters}
                    setFilters={setFilters}
                    onApply={() => setIsMobileFilterOpen(false)}
                    onReset={() => setIsMobileFilterOpen(false)}
                    isMobileModal
                />
            </MobileFilterDrawer>

            <div className={`space-y-4 transition-opacity ${loading && universities.length ? 'pointer-events-none opacity-60' : ''}`}>
                {loading && universities.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                ) : universities.length === 0 ? (
                    <EmptyState
                        title="No universities match these filters"
                        text="Try widening the ranking or tuition range, or choose another country."
                        onClear={active.length || filters.search ? clearAll : undefined}
                    />
                ) : (
                    universities.map((uni) => (
                        <UniversityCard
                            key={uni._id}
                            uni={uni}
                            favorite={favorites.isFavorite(uni._id)}
                            onToggleFavorite={() => favorites.toggle(uni._id)}
                            favoritesReady={favorites.ready}
                        />
                    ))
                )}
            </div>

            <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} disabled={loading} />
        </div>
    );
}
