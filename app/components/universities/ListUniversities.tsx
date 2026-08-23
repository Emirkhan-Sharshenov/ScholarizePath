'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import FilterUniversities, { FilterState } from './FilterUniversities';
import Link from 'next/link';

interface UniversitiesListUIProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function ListUniversities({ filters, setFilters }: UniversitiesListUIProps) {
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Ranking: High to Low');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const itemsPerPage = 5;

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
                limit: String(itemsPerPage),
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
            console.error(error);
            setUniversities([]);
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

    const formatLocation = (uni: any): string => {
        if (typeof uni.location === 'string') return uni.location;
        const city = uni.location?.city || '';
        const country = uni.location?.country || '';
        const parts = [city, country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    const getRanking = (uni: any): string => {
        if (typeof uni.ranking === 'number' || typeof uni.ranking === 'string') return `#${uni.ranking}`;
        const rank = uni.ranking?.global || uni.ranking?.qs || uni.ranking?.world || uni.ranking?.national;
        return rank ? `#${rank}` : 'N/A';
    };

    const getTuition = (uni: any): string => {
        if (typeof uni.tuition === 'number') return `$${uni.tuition.toLocaleString('en-US')}`;
        if (typeof uni.tuition === 'string') return uni.tuition;
        const bachelor = uni.tuition?.bachelor;
        if (bachelor) return `$${bachelor.toLocaleString('en-US')}`;
        return 'N/A';
    };

    const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const showingEnd = Math.min(currentPage * itemsPerPage, totalCount);

    return (
        <div className="w-full font-sans">

            {/* MOBILE SEARCH BAR & FILTERS BUTTON */}
            <div className="mb-5 flex items-center gap-2.5 lg:hidden">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        placeholder="Search by name, provider..."
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-xs text-slate-800 outline-none shadow-2xs focus:border-blue-600"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="flex shrink-0 items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-2xs active:scale-95"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* MOBILE DRAWER */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end bg-slate-900/60 backdrop-blur-xs lg:hidden">
                    <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-900">Filter Universities</h3>
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <FilterUniversities
                            filters={filters}
                            setFilters={setFilters}
                            onApply={() => setIsMobileFilterOpen(false)}
                            onReset={() => setIsMobileFilterOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs md:block md:p-8">
                <div className="flex flex-col items-start justify-between gap-4 pb-6 sm:flex-row sm:items-center">
                    <p className="text-xs font-medium text-slate-500">
                        Showing <span className="font-semibold text-slate-800">{showingStart}</span> to{' '}
                        <span className="font-semibold text-slate-800">{showingEnd}</span> of{' '}
                        <span className="font-semibold text-slate-800">{totalCount}</span> universities
                    </p>

                    <div className="flex items-center gap-2">
                        <span className="whitespace-nowrap text-xs font-semibold text-slate-700">Sort by</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="cursor-pointer appearance-none rounded-xl border border-gray-200/80 bg-slate-50 py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white"
                            >
                                <option value="Ranking: High to Low">Ranking: High to Low</option>
                                <option value="Ranking: Low to High">Ranking: Low to High</option>
                                <option value="Tuition: Low to High">Tuition: Low to High</option>
                                <option value="Tuition: High to Low">Tuition: High to Low</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>
                </div>

                <div className={`my-2 w-full transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    <table className="w-full table-fixed border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-semibold text-slate-500">
                                <th className="w-[30%] pb-4 font-semibold">University Name</th>
                                <th className="w-[18%] pb-4 font-semibold">Location</th>
                                <th className="w-[12%] pb-4 font-semibold">Ranking</th>
                                <th className="w-[18%] pb-4 font-semibold">Tuition Fee (USD)</th>
                                <th className="w-[22%] pb-4 font-semibold">Description</th>
                                <th className="w-[14%] pb-4 text-right font-semibold">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100/80 text-xs">
                            {universities.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        No universities match the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                universities.map((uni: any) => (
                                    <tr key={uni._id} className="h-[104px] transition-colors hover:bg-slate-50/40">
                                        <td className="break-words py-5 pr-3 align-top">
                                            <div className="line-clamp-2 break-words text-sm font-bold text-slate-900">
                                                {uni.name}
                                            </div>
                                        </td>
                                        <td className="break-words py-5 pr-3 align-top text-xs font-normal text-slate-600">
                                            <div className="line-clamp-2 break-words">
                                                {formatLocation(uni)}
                                            </div>
                                        </td>
                                        <td className="break-words py-5 pr-3 align-top text-xs font-bold text-slate-900">
                                            {getRanking(uni)}
                                        </td>
                                        <td className="break-words py-5 pr-3 align-top text-xs font-bold text-slate-900">
                                            {getTuition(uni)}
                                        </td>
                                        <td className="break-words py-5 pr-3 align-top">
                                            <p className="line-clamp-2 overflow-hidden break-words text-xs font-normal leading-relaxed text-slate-500">
                                                {uni.description || 'No description provided.'}
                                            </p>
                                        </td>
                                        <td className="whitespace-nowrap py-5 text-right align-top">
                                            <Link
                                                href={`/universities/${uni._id}`}
                                                className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* DESKTOP PAGINATION */}
                <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 pt-6">
                    <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="mr-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {(() => {
                        const delta = 1;
                        const range: (number | string)[] = [];

                        if (totalPages <= 7) {
                            for (let i = 1; i <= totalPages; i++) range.push(i);
                        } else {
                            const left = Math.max(currentPage - delta, 1);
                            const right = Math.min(currentPage + delta, totalPages);

                            if (left > 2) {
                                range.push(1, '...');
                                for (let i = left; i <= right; i++) range.push(i);
                            } else {
                                for (let i = 1; i <= Math.max(3, right); i++) range.push(i);
                            }

                            if (right < totalPages - 1) {
                                range.push('...', totalPages);
                            } else if (right === totalPages - 1) {
                                range.push(totalPages);
                            }
                        }

                        return range.map((page, idx) =>
                            page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={`page-btn-${page}`}
                                    onClick={() => setCurrentPage(Number(page))}
                                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-transparent text-slate-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        );
                    })()}

                    <button
                        disabled={currentPage >= totalPages || totalPages === 0}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="ml-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="space-y-4 md:hidden">
                {universities.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-xs text-slate-400">
                        No universities match the selected filters.
                    </div>
                ) : (
                    universities.map((uni: any) => (
                        <div
                            key={uni._id}
                            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs transition active:scale-[0.99]"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-base font-bold text-slate-900 leading-snug">
                                    {uni.name}
                                </h3>
                                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                                    {getRanking(uni)}
                                </span>
                            </div>

                            <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-slate-700">
                                <span>Tuition: <strong className="text-slate-900">{getTuition(uni)}</strong></span>
                                <span className="text-slate-600">Location: <strong className="text-slate-900">{formatLocation(uni)}</strong></span>
                            </div>

                            {uni.description && (
                                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
                                    {uni.description}
                                </p>
                            )}

                            <Link
                                href={`/universities/${uni._id}`}
                                className="mt-4 block w-full rounded-2xl bg-blue-600 py-3 text-center text-xs font-bold text-white shadow-2xs transition hover:bg-blue-700 active:scale-98"
                            >
                                View Details
                            </Link>
                        </div>
                    ))
                )}

                {/* MOBILE PAGINATION */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="text-xs font-medium text-slate-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage >= totalPages || totalPages === 0}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

        </div>
    );
}