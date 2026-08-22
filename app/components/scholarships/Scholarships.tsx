'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { FilterState } from './ScholarshipsFilter';

interface ScholarshipsListProps {
    filters: FilterState;
}

export default function ScholarshipsListUI({ filters }: ScholarshipsListProps) {
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Deadline (Earliest)');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const itemsPerPage = 5;

    // Debounce search so we don't fetch on every keystroke
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

    const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const showingEnd = Math.min(currentPage * itemsPerPage, totalCount);

    const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    const getPaginationRange = () => {
        const delta = 1;
        const range: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
            return range;
        }

        const leftSibling = Math.max(currentPage - delta, 1);
        const rightSibling = Math.min(currentPage + delta, totalPages);
        const showLeftEllipsis = leftSibling > 2;
        const showRightEllipsis = rightSibling < totalPages - 1;

        if (!showLeftEllipsis && showRightEllipsis) {
            for (let i = 1; i <= 3 + 2 * delta; i++) range.push(i);
            range.push('...');
            range.push(totalPages);
        } else if (showLeftEllipsis && !showRightEllipsis) {
            range.push(1);
            range.push('...');
            for (let i = totalPages - (3 + 2 * delta) + 1; i <= totalPages; i++) range.push(i);
        } else if (showLeftEllipsis && showRightEllipsis) {
            range.push(1);
            range.push('...');
            for (let i = leftSibling; i <= rightSibling; i++) range.push(i);
            range.push('...');
            range.push(totalPages);
        } else {
            for (let i = 1; i <= totalPages; i++) range.push(i);
        }

        return range;
    };

    if (loading && scholarships.length === 0) {
        return <div className="p-8 text-sm text-gray-500">Loading scholarships...</div>;
    }

    return (
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 font-sans shadow-sm md:p-8">
            <div className="flex flex-col items-start justify-between gap-4 pb-6 sm:flex-row sm:items-center">
                <p className="text-xs font-medium text-slate-500">
                    Showing <span className="font-semibold text-slate-800">{showingStart}</span> to{' '}
                    <span className="font-semibold text-slate-800">{showingEnd}</span> of{' '}
                    <span className="font-semibold text-slate-800">{totalCount}</span> scholarships
                </p>

                <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-xs font-semibold text-slate-700">Sort by</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={handleSort}
                            className="cursor-pointer appearance-none rounded-xl border border-gray-200/80 bg-slate-50 py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white"
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

            <div className={`my-2 w-full transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <table className="w-full table-fixed border-collapse text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold text-slate-500">
                            <th className="w-[40%] pb-4 font-semibold">Scholarship Name</th>
                            <th className="hidden w-[15%] pb-4 font-semibold sm:table-cell">Amount</th>
                            <th className="w-[18%] pb-4 font-semibold">Deadline</th>
                            <th className="hidden w-[15%] pb-4 font-semibold md:table-cell">Country</th>
                            <th className="w-[12%] pb-4 text-right font-semibold">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100/80 text-xs">
                        {scholarships.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                    No scholarships match the selected filters.
                                </td>
                            </tr>
                        ) : (
                            scholarships.map((scholarship: any) => {
                                let amountDisplay = scholarship.award?.type || 'N/A';
                                if (scholarship.award?.estimatedValue) {
                                    const { currency, min, max } = scholarship.award.estimatedValue;
                                    const currSymbol =
                                        currency === 'GBP' ? '£' : currency === 'USD' ? '$' : `${currency} `;
                                    if (min && max) {
                                        amountDisplay = `${currSymbol}${min.toLocaleString()} - ${currSymbol}${max.toLocaleString()}`;
                                    } else if (max) {
                                        amountDisplay = `${currSymbol}${max.toLocaleString()}`;
                                    }
                                } else if (scholarship.award?.amount || scholarship.amount) {
                                    amountDisplay = scholarship.award?.amount || scholarship.amount;
                                }

                                const deadlineDisplay = scholarship.deadlines?.[0]?.date || 'N/A';

                                return (
                                    <tr
                                        key={scholarship._id}
                                        className="h-[104px] transition-colors hover:bg-slate-50/40"
                                    >
                                        <td className="break-words py-5 pr-4 align-top">
                                            <div className="line-clamp-1 break-words text-sm font-bold text-slate-900">
                                                {scholarship.scholarshipName}
                                            </div>
                                            <p className="line-clamp-2 mt-1.5 overflow-hidden break-words text-xs font-normal leading-relaxed text-slate-500">
                                                {scholarship.description || scholarship.details || 'No description provided.'}
                                            </p>
                                        </td>

                                        <td className="hidden break-words py-5 pr-2 align-top text-xs font-bold text-slate-900 sm:table-cell">
                                            {amountDisplay}
                                        </td>

                                        <td className="break-words py-5 pr-2 align-top text-xs font-medium text-slate-800">
                                            {deadlineDisplay}
                                        </td>

                                        <td className="hidden break-words py-5 pr-2 align-top text-xs font-medium text-slate-800 md:table-cell">
                                            {scholarship.country || 'N/A'}
                                        </td>

                                        <td className="whitespace-nowrap py-5 text-right align-top">
                                            <Link
                                                href={`/scholarships/${scholarship._id}`}
                                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 pt-6">
                <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageClick(currentPage - 1)}
                    className="mr-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Prev
                </button>

                {getPaginationRange().map((page, idx) =>
                    page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">...</span>
                    ) : (
                        <button
                            key={`page-btn-${page}`}
                            onClick={() => handlePageClick(Number(page))}
                            className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-700 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    disabled={currentPage >= totalPages || totalPages === 0}
                    onClick={() => handlePageClick(currentPage + 1)}
                    className="ml-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}