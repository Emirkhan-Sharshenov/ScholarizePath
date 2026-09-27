'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Coins, Search, SlidersHorizontal } from 'lucide-react';
import { DeadlinePill, FundingPill } from './pills';
import ScholarshipsFilter, { FilterState, initialFilters } from './ScholarshipsFilter';
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
import { formatAmount } from '@/lib/scholarshipDisplay';

interface ScholarshipsListProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

interface ScholarshipRow {
    _id: string;
    scholarshipName: string;
    description?: string;
    country?: string;
    studyLevel?: string | string[];
    provider?: { name?: string };
    award?: {
        type?: string | null;
        amount?: string;
        estimatedValue?: { currency?: string | null; min?: number | null; max?: number | null } | null;
    };
    amount?: string;
    deadlines?: Array<{ name?: string; date?: unknown }>;
}

const SORT_OPTIONS = [
    ['Deadline (Earliest)', 'Deadline: earliest'],
    ['Deadline (Latest)', 'Deadline: latest'],
    ['Amount (Highest)', 'Amount: highest'],
    ['Amount (Lowest)', 'Amount: lowest'],
] as const;

const ITEMS_PER_PAGE = 5;

function amountText(s: ScholarshipRow): string | null {
    const v = s.award?.estimatedValue;
    if (v && (v.min || v.max)) {
        if (v.min && v.max && v.min !== v.max) return `${formatAmount(v.min, v.currency)} – ${formatAmount(v.max, v.currency)}`;
        return formatAmount((v.max || v.min) as number, v.currency);
    }
    return s.award?.amount || s.amount || null;
}

function ScholarshipCard({ s, favorite, onToggleFavorite, favoritesReady }: {
    s: ScholarshipRow;
    favorite: boolean;
    onToggleFavorite: () => void;
    favoritesReady: boolean;
}) {
    const amount = amountText(s);
    const levels = (Array.isArray(s.studyLevel) ? s.studyLevel : s.studyLevel ? [s.studyLevel] : []).slice(0, 4);
    const provider = s.provider?.name;

    return (
        <article className="group relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_10px_24px_rgba(10,26,63,0.08)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    <FundingPill type={s.award?.type} />
                    <DeadlinePill deadlines={s.deadlines} />
                </div>
                <div className="relative z-10">
                    <FavoriteButton active={favorite} onClick={onToggleFavorite} disabled={!favoritesReady} />
                </div>
            </div>

            <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink">
                <Link href={`/scholarships/${s._id}`} className="after:absolute after:inset-0 focus:outline-none">
                    {s.scholarshipName}
                </Link>
            </h3>
            <p className="mt-1 text-sm text-slate-500">
                {[provider, s.country].filter(Boolean).join(' · ')} {flagFor(s.country)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm">
                    <Coins aria-hidden="true" className="h-4 w-4 text-brand" />
                    {amount ? <span className="font-semibold text-ink">{amount}</span> : <span className="italic text-slate-500">See official website</span>}
                </span>
                {levels.length > 0 && (
                    <span className="flex flex-wrap gap-1.5">
                        {levels.map((l) => (
                            <span key={l} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">{l}</span>
                        ))}
                    </span>
                )}
            </div>

            <div className="mt-4 flex justify-end">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    View details <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </article>
    );
}

export default function ScholarshipsListUI({ filters, setFilters }: ScholarshipsListProps) {
    const [scholarships, setScholarships] = useState<ScholarshipRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Deadline (Earliest)');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const favorites = useFavoriteIds('scholarship');

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
        filters.studyLevel,
        filters.fieldOfStudy,
        filters.minAmount,
        filters.maxDeadline,
        sortBy,
    ]);

    const fetchScholarships = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(ITEMS_PER_PAGE),
                sortBy,
            });

            if (debouncedSearch) params.set('search', debouncedSearch);
            if (filters.country && filters.country !== 'All Countries') params.set('country', filters.country);
            if (filters.studyLevel && filters.studyLevel !== 'All Study Levels') params.set('studyLevel', filters.studyLevel);
            if (filters.fieldOfStudy && filters.fieldOfStudy !== 'All Fields') params.set('fieldOfStudy', filters.fieldOfStudy);
            if (filters.minAmount) params.set('minAmount', filters.minAmount);
            if (filters.maxDeadline) params.set('maxDeadline', filters.maxDeadline);

            const res = await fetch(`/api/scholarships?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch scholarships');
            const json = await res.json();

            setScholarships(Array.isArray(json.data) ? json.data : []);
            setTotalCount(json.totalCount || 0);
            setTotalPages(json.totalPages || 1);
        } catch (error) {
            console.error(error);
            setScholarships([]);
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
        filters.studyLevel,
        filters.fieldOfStudy,
        filters.minAmount,
        filters.maxDeadline,
    ]);

    useEffect(() => {
        fetchScholarships();
    }, [fetchScholarships]);

    const update = (patch: Partial<FilterState>) => setFilters((prev) => ({ ...prev, ...patch }));

    const active: ActiveFilter[] = [];
    if (filters.country !== initialFilters.country) active.push({ key: 'country', label: `${flagFor(filters.country)} ${filters.country}`, onRemove: () => update({ country: initialFilters.country }) });
    if (filters.studyLevel !== initialFilters.studyLevel) active.push({ key: 'level', label: filters.studyLevel, onRemove: () => update({ studyLevel: initialFilters.studyLevel }) });
    if (filters.minAmount) active.push({ key: 'amount', label: `Min ${Number(filters.minAmount).toLocaleString('en-US')}`, onRemove: () => update({ minAmount: '' }) });
    if (filters.maxDeadline) active.push({ key: 'deadline', label: `Deadline before ${filters.maxDeadline}`, onRemove: () => update({ maxDeadline: '' }) });
    const clearAll = () => setFilters(initialFilters);

    const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const showingEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

    return (
        <div className="w-full space-y-4 font-body">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-[0_4px_12px_rgba(10,26,63,0.04)] sm:p-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={filters.search}
                            onChange={(e) => update({ search: e.target.value })}
                            placeholder="Search by name, provider…"
                            aria-label="Search scholarships"
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
                        {loading ? 'Loading…' : totalCount === 0 ? 'No scholarships found' : (
                            <>Showing <span className="font-semibold text-ink">{showingStart}–{showingEnd}</span> of <span className="font-semibold text-ink">{totalCount.toLocaleString('en-US')}</span> scholarships</>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Sort by</span>
                        <div className="w-48">
                            <SelectField name="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} ariaLabel="Sort scholarships">
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

            <MobileFilterDrawer open={isMobileFilterOpen} onClose={() => setIsMobileFilterOpen(false)} title="Filter scholarships">
                <ScholarshipsFilter
                    filters={filters}
                    setFilters={setFilters}
                    onApply={() => setIsMobileFilterOpen(false)}
                    onReset={() => setIsMobileFilterOpen(false)}
                    isMobileModal
                />
            </MobileFilterDrawer>

            <div className={`space-y-4 transition-opacity ${loading && scholarships.length ? 'pointer-events-none opacity-60' : ''}`}>
                {loading && scholarships.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                ) : scholarships.length === 0 ? (
                    <EmptyState
                        title="No scholarships match these filters"
                        text="Try another study level or country, or remove the amount and deadline limits."
                        onClear={active.length || filters.search ? clearAll : undefined}
                    />
                ) : (
                    scholarships.map((s) => (
                        <ScholarshipCard
                            key={s._id}
                            s={s}
                            favorite={favorites.isFavorite(s._id)}
                            onToggleFavorite={() => favorites.toggle(s._id)}
                            favoritesReady={favorites.ready}
                        />
                    ))
                )}
            </div>

            <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} disabled={loading} />
        </div>
    );
}
