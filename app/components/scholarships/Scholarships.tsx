'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from "react";

export default function ScholarshipsListUI() {
    const [scholarships, setScholarships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("Deadline (Earliest)");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentScholarships = scholarships.slice(startIndex, endIndex);

    useEffect(() => {
        async function fetchScholarships() {
            try {
                const res = await fetch("/api/scholarships");

                if (!res.ok) {
                    throw new Error("Failed to fetch scholarships");
                }

                const data = await res.json();
                setScholarships(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchScholarships();
    }, []);

    const totalCount = scholarships.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const showingStart = totalCount === 0 ? 0 : startIndex + 1;
    const showingEnd = Math.min(endIndex, totalCount);

    const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    // Умный расчет диапазона страниц (показывает соседние страницы вокруге currentPage)
    const getPaginationRange = () => {
        const delta = 1; // Количество соседних страниц слева и справа
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
        <div className="w-full bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm font-sans flex flex-col justify-between">

            {/* Top Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 flex-shrink-0">
                <p className="text-sm font-semibold text-slate-800">
                    Showing {showingStart} to {showingEnd} of {totalCount} scholarships
                </p>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-medium whitespace-nowrap">Sort by:</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={handleSort}
                            className="appearance-none bg-slate-50/80 border border-gray-200/80 rounded-xl py-2 pl-4 pr-10 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-600 cursor-pointer"
                        >
                            <option value="Deadline (Earliest)">Deadline (Earliest)</option>
                            <option value="Deadline (Latest)">Deadline (Latest)</option>
                            <option value="Amount (Highest)">Amount (Highest)</option>
                            <option value="Amount (Lowest)">Amount (Lowest)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="w-full overflow-x-auto my-2">
                <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
                    <thead>
                        <tr className="text-xs font-bold text-blue-600">
                            <th className="pb-6 w-[40%] font-semibold">Scholarship Name</th>
                            <th className="pb-6 w-[15%] font-semibold">Amount</th>
                            <th className="pb-6 w-[18%] font-semibold">Deadline</th>
                            <th className="pb-6 w-[15%] font-semibold">Country</th>
                            <th className="pb-6 w-[12%] text-right font-semibold"></th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100/80 text-xs">
                        {currentScholarships.map((scholarship: any, index: number) => {
                            const rowKey = scholarship._id || scholarship.id || `scholarship-${index}`;

                            return (
                                <tr
                                    key={rowKey}
                                    className="h-[104px] hover:bg-slate-50/40 transition-colors"
                                >
                                    <td className="py-5 pr-4 align-top break-words">
                                        <div className="font-bold text-slate-900 text-sm break-words line-clamp-1">
                                            {scholarship.scholarshipName}
                                        </div>

                                        <p className="text-xs text-slate-500 mt-1.5 font-normal leading-relaxed line-clamp-2 overflow-hidden break-words">
                                            {scholarship.description || scholarship.details || "No description provided."}
                                        </p>
                                    </td>

                                    <td className="py-5 pr-2 align-top font-bold text-slate-900 text-xs break-words">
                                        {scholarship.award?.amount || scholarship.award?.type || scholarship.amount}
                                    </td>

                                    <td className="py-5 pr-2 align-top font-medium text-slate-800 text-xs break-words">
                                        {scholarship.deadlines?.[0]?.date || scholarship.deadline}
                                    </td>

                                    <td className="py-5 pr-2 align-top font-medium text-slate-800 text-xs break-words">
                                        {scholarship.country}
                                    </td>

                                    <td className="py-5 align-top text-right whitespace-nowrap">
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-sm">
                                            Apply
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Dynamic Smart Pagination Footer */}
            <div className="pt-6 flex justify-center items-center gap-1.5 flex-shrink-0">
                {/* Prev Button */}
                <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageClick(currentPage - 1)}
                    className="mr-2 rounded-md bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Prev
                </button>

                {/* Dynamic Smart Page Numbers */}
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
                            className={`h-8 w-8 rounded-md text-xs font-semibold transition ${currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-transparent text-slate-700 hover:bg-gray-100'
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
                    className="ml-2 rounded-md bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}