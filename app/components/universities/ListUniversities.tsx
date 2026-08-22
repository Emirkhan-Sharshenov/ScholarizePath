'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { FilterState } from './FilterUniversities';
import Link from "next/link";

interface UniversitiesListUIProps {
    filters: FilterState;
}

export default function ListUniversities({ filters }: UniversitiesListUIProps) {
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Ranking: High to Low');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const itemsPerPage = 5;

    // Debounce only the search field so we don't fetch on every keystroke
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
        const city = uni.location?.city || '';
        const country = uni.location?.country || '';
        const parts = [city, country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

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

    if (loading && universities.length === 0) {
        return <div className="p-8 text-sm text-gray-500">Loading universities...</div>;
    }

    return (
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 font-sans shadow-sm md:p-8">
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
                            onChange={handleSort}
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
                            <th className="hidden w-[16%] pb-4 font-semibold sm:table-cell">Location</th>
                            <th className="w-[14%] pb-4 font-semibold">Ranking</th>
                            <th className="hidden w-[18%] pb-4 font-semibold md:table-cell">Tuition Fee (USD)</th>
                            <th className="hidden w-[22%] pb-4 font-semibold lg:table-cell">Description</th>
                            <th className="w-[16%] pb-4 text-right font-semibold">Action</th>
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
                                    <td className="hidden break-words py-5 pr-3 align-top text-xs font-normal text-slate-600 sm:table-cell">
                                        <div className="line-clamp-2 break-words">
                                            {formatLocation(uni)}
                                        </div>
                                    </td>
                                    <td className="break-words py-5 pr-3 align-top text-xs font-bold text-slate-900">
                                        {uni.ranking?.global ? `#${uni.ranking.global}` : 'N/A'}
                                    </td>
                                    <td className="hidden break-words py-5 pr-3 align-top text-xs font-bold text-slate-900 md:table-cell">
                                        {uni.tuition?.bachelor ? `$${uni.tuition.bachelor.toLocaleString('en-US')}` : 'N/A'}
                                    </td>
                                    <td className="hidden break-words py-5 pr-3 align-top lg:table-cell">
                                        <p className="line-clamp-2 overflow-hidden break-words text-xs font-normal leading-relaxed text-slate-500">
                                            {uni.description || 'No description provided.'}
                                        </p>
                                    </td>
                                    <td className="whitespace-nowrap py-5 text-right align-top">
                                        <Link
                                            href={`/universities/${uni._id}`}
                                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
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