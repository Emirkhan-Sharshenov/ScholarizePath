'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';
import ScholarshipsFilter, { FilterState } from './ScholarshipsFilter';

interface ScholarshipsListProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function ScholarshipsListUI({ filters, setFilters }: ScholarshipsListProps) {
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Deadline (Earliest)');
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
                limit: String(itemsPerPage),
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

    const getAmountDisplay = (scholarship: any) => {
        if (scholarship.award?.estimatedValue) {
            const { currency, min, max } = scholarship.award.estimatedValue;
            const currSymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : `${currency} `;
            if (min && max) return `${currSymbol}${min.toLocaleString()} - ${currSymbol}${max.toLocaleString()}`;
            if (max) return `${currSymbol}${max.toLocaleString()}`;
        }
        if (scholarship.award?.amount || scholarship.amount) {
            return scholarship.award?.amount || scholarship.amount;
        }
        return scholarship.award?.type || 'N/A';
    };

    return (
        <div className="w-full max-w-full font-sans">
            {/* MOBILE SEARCH & FILTER BAR */}
            <div className="mb-4 flex items-center gap-2.5 md:hidden">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                        placeholder="Search by name, provider..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 hover:bg-blue-700"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* MOBILE FILTER MODAL */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-0 sm:items-center sm:justify-center sm:p-4 md:hidden">
                    <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-900">Filter Scholarships</h3>
                            <button
                                type="button"
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <ScholarshipsFilter
                            filters={filters}
                            setFilters={setFilters}
                            onApply={() => setIsMobileFilterOpen(false)}
                            onReset={() => setIsMobileFilterOpen(false)}
                            isMobileModal
                        />
                    </div>
                </div>
            )}

            {/* MAIN CONTAINER */}
            <div className="w-full rounded-2xl border-none bg-transparent p-0 md:border md:border-slate-100 md:bg-white md:p-8 md:shadow-sm">

                {/* TOP META CONTROLS */}
                <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center md:mb-6">
                    <p className="text-xs font-medium text-slate-500">
                        Showing <span className="font-bold text-slate-900">{totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
                        <span className="font-bold text-slate-900">{totalCount}</span> scholarships
                    </p>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="whitespace-nowrap text-xs font-semibold text-slate-600">Sort by</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-600"
                            >
                                <option value="Deadline (Earliest)">Deadline (Earliest)</option>
                                <option value="Deadline (Latest)">Deadline (Latest)</option>
                                <option value="Amount (Highest)">Amount (Highest)</option>
                                <option value="Amount (Lowest)">Amount (Lowest)</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>
                </div>

                {/* CARDS FOR MOBILE (md:hidden) */}
                <div className="block md:hidden">
                    {loading ? (
                        <div className="py-12 text-center text-xs font-medium text-slate-400">Loading scholarships...</div>
                    ) : scholarships.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
                            No scholarships found matching your filters.
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {scholarships.map((scholarship: any) => {
                                const amountDisplay = getAmountDisplay(scholarship);
                                const deadlineDisplay = scholarship.deadlines?.[0]?.date || 'N/A';

                                return (
                                    <div
                                        key={scholarship._id}
                                        className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs"
                                    >
                                        <div>
                                            {/* Title */}
                                            <h3 className="text-sm font-bold leading-snug text-slate-900">
                                                {scholarship.scholarshipName}
                                            </h3>

                                            {/* Info Row */}
                                            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                                                <div>
                                                    <span className="font-semibold text-slate-900">Amount:</span> {amountDisplay}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-slate-900">Country:</span> {scholarship.country || 'N/A'}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                                                {scholarship.description || scholarship.details || 'No description provided.'}
                                            </p>
                                        </div>

                                        {/* Bottom Action Button */}
                                        <div className="mt-4 pt-1">
                                            <Link
                                                href={`/scholarships/${scholarship._id}`}
                                                className="block w-full rounded-xl bg-blue-600 py-2.5 text-center text-xs font-semibold text-white shadow-xs transition active:scale-[0.98] hover:bg-blue-700"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* TABLE FOR DESKTOP (hidden md:block) */}
                <div className="hidden md:block">
                    <table className="w-full table-fixed border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                                <th className="w-[40%] pb-4">Scholarship Name</th>
                                <th className="w-[15%] pb-4">Amount</th>
                                <th className="w-[18%] pb-4">Deadline</th>
                                <th className="w-[15%] pb-4">Country</th>
                                <th className="w-[12%] pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {scholarships.map((scholarship: any) => (
                                <tr key={scholarship._id} className="h-[96px]">
                                    <td className="py-4 pr-4 align-top">
                                        <div className="line-clamp-1 text-sm font-bold text-slate-900">
                                            {scholarship.scholarshipName}
                                        </div>
                                        <p className="line-clamp-2 mt-1 text-xs text-slate-500">
                                            {scholarship.description || scholarship.details || 'No description provided.'}
                                        </p>
                                    </td>
                                    <td className="py-4 pr-2 align-top font-bold text-slate-900">
                                        {getAmountDisplay(scholarship)}
                                    </td>
                                    <td className="py-4 pr-2 align-top text-slate-800">
                                        {scholarship.deadlines?.[0]?.date || 'N/A'}
                                    </td>
                                    <td className="py-4 pr-2 align-top text-slate-800">
                                        {scholarship.country || 'N/A'}
                                    </td>
                                    <td className="py-4 text-right align-top">
                                        <Link
                                            href={`/scholarships/${scholarship._id}`}
                                            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="mt-6 flex items-center justify-center gap-1 border-t border-slate-100 pt-5">
                    <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="px-3 text-xs font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>

            </div>
        </div>
    );
}