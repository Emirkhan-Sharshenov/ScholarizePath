'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function UniversitiesListUI() {
    const [universities, setUniversities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("Ranking: Low to High");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 7;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentUniversities = universities.slice(startIndex, endIndex);

    useEffect(() => {
        async function fetchUniversities() {
            try {
                const res = await fetch("/api/universities");

                if (!res.ok) {
                    throw new Error("Failed to fetch universities");
                }

                const data = await res.json();
                setUniversities(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchUniversities();
    }, []);

    const totalCount = universities.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const showingStart = totalCount === 0 ? 0 : startIndex + 1;
    const showingEnd = Math.min(endIndex, totalCount);

    const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    // Функция для генерации умного диапазона страниц
    const getPaginationRange = () => {
        const delta = 1; // Сколько страниц показывать слева и справа от текущей
        const range: (number | string)[] = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            range.unshift('...');
        }
        if (currentPage + delta < totalPages - 1) {
            range.push('...');
        }

        range.unshift(1);
        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    if (loading) {
        return <div className="p-8 text-sm text-gray-500">Loading...</div>;
    }

    return (
        <div className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 font-sans flex flex-col justify-between">

            {/* Top Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 flex-shrink-0">
                <p className="text-xs font-medium text-slate-500">
                    Showing <span className="font-semibold text-slate-800">{showingStart}</span> to{' '}
                    <span className="font-semibold text-slate-800">{showingEnd}</span> of{' '}
                    <span className="font-semibold text-slate-800">{totalCount}</span> universities
                </p>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-700 font-semibold whitespace-nowrap">Sort by</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={handleSort}
                            className="appearance-none bg-slate-50 border border-gray-200/80 rounded-xl py-2 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white cursor-pointer"
                        >
                            <option value="Ranking: Low to High">Ranking: Low to High</option>
                            <option value="Ranking: High to Low">Ranking: High to Low</option>
                            <option value="Tuition: Low to High">Tuition: Low to High</option>
                            <option value="Tuition: High to Low">Tuition: High to Low</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="w-full overflow-x-auto my-2">
                <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold text-slate-500">
                            <th className="pb-4 w-[20%] font-semibold">University Name</th>
                            <th className="pb-4 w-[16%] font-semibold">Location</th>
                            <th className="pb-4 w-[10%] font-semibold">Ranking</th>
                            <th className="pb-4 w-[14%] font-semibold">Tuition Fee (USD)</th>
                            <th className="pb-4 w-[10%] font-semibold">Programs</th>
                            <th className="pb-4 w-[20%] font-semibold">Description</th>
                            <th className="pb-4 w-[10%] font-semibold text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100/80 text-xs">
                        {currentUniversities.map((uni: any, index: number) => {
                            const rowKey = uni._id || uni.id || `uni-${index}`;

                            const locationText = uni.location
                                ? `${uni.location.city || ''}${uni.location.city && uni.location.country ? ', ' : ''}${uni.location.country || ''}`
                                : 'N/A';

                            const tuitionFormatted = uni.tuition?.bachelor
                                ? `$${uni.tuition.bachelor.toLocaleString('en-US')}`
                                : 'N/A';

                            const programsCount = Array.isArray(uni.programs)
                                ? uni.programs.length
                                : (uni.programs || 'N/A');

                            return (
                                <tr
                                    key={rowKey}
                                    className="h-[76px] hover:bg-slate-50/40 transition-colors"
                                >
                                    <td className="py-4 pr-3 align-top font-bold text-slate-900 text-xs break-words line-clamp-2">
                                        {uni.name}
                                    </td>

                                    <td className="py-4 pr-3 align-top font-normal text-slate-600 break-words">
                                        {locationText}
                                    </td>

                                    <td className="py-4 pr-3 align-top font-bold text-slate-900">
                                        {uni.ranking?.global ?? 'N/A'}
                                    </td>

                                    <td className="py-4 pr-3 align-top font-bold text-slate-900">
                                        {tuitionFormatted}
                                    </td>

                                    <td className="py-4 pr-3 align-top font-normal text-slate-700">
                                        {programsCount}
                                    </td>

                                    <td className="py-4 pr-3 align-top">
                                        <p className="font-normal text-slate-500 leading-relaxed line-clamp-2 overflow-hidden break-words">
                                            {uni.description || "No description provided."}
                                        </p>
                                    </td>

                                    <td className="py-4 align-top text-right whitespace-nowrap">
                                        <button className="text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Dynamic Smart Pagination Footer */}
            <div className="pt-6 border-t border-gray-100 flex justify-center items-center gap-1.5 flex-shrink-0">
                {/* Prev Button */}
                <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageClick(currentPage - 1)}
                    className="mr-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Prev
                </button>

                {/* Smart Page Numbers */}
                {getPaginationRange().map((page, idx) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={`page-btn-${page}`}
                            onClick={() => handlePageClick(Number(page))}
                            className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-transparent text-slate-600 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                {/* Next Button */}
                <button
                    disabled={currentPage >= totalPages || totalPages === 0}
                    onClick={() => handlePageClick(currentPage + 1)}
                    className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}