'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from "react";
import ScholarshipsListUI from "./ScholarshipsListUI";
import ScholarshipRow from "./ScholarshipRow";

interface ScholarshipsListUIProps {
    scholarships: any[]; // Automatically calculates counts
    itemsPerPage?: number;
    onPageChange?: (page: number) => void;
    onSortChange?: (sortBy: string) => void;
    children?: React.ReactNode;
}

export default function ScholarshipsListUI({
    scholarships = [],
    itemsPerPage = 10,
    onPageChange,
    onSortChange,
    children,
}: ScholarshipsListUIProps) {
    const [sortBy, setSortBy] = useState('Deadline (Earliest)');
    const [currentPage, setCurrentPage] = useState(1);

    // Dynamic calculations (no hardcoded numbers)
    const totalCount = scholarships.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
    const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const showingEnd = Math.min(currentPage * itemsPerPage, totalCount);

    const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSortBy(value);
        if (onSortChange) onSortChange(value);
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
        if (onPageChange) onPageChange(page);
    };

    return (
        /* Set fixed height container (e.g., h-[750px] or h-[calc(100vh-6rem)]) */
        <div className="w-full h-[605px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 font-sans flex flex-col justify-between">

            {/* Top Header Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100 flex-shrink-0">
                <p className="text-xs font-semibold text-slate-700">
                    Showing <span className="font-bold text-slate-900">{showingStart}</span> to{' '}
                    <span className="font-bold text-slate-900">{showingEnd}</span> of{' '}
                    <span className="font-bold text-slate-900">{totalCount}</span> scholarships
                </p>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={handleSort}
                            className="appearance-none bg-slate-50 border border-gray-200 rounded-lg py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:bg-white cursor-pointer"
                        >
                            <option value="Deadline (Earliest)">Deadline (Earliest)</option>
                            <option value="Deadline (Latest)">Deadline (Latest)</option>
                            <option value="Amount (Highest)">Amount (Highest)</option>
                            <option value="Amount (Lowest)">Amount (Lowest)</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* Scrollable Table Area */}
            <div className="w-full flex-grow overflow-y-auto overflow-x-auto my-2 pr-1 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-100 text-xs font-bold text-blue-600">
                            <th className="pb-3 w-1/2 font-semibold">Scholarship Name</th>
                            <th className="pb-3 w-1/8 font-semibold">Amount</th>
                            <th className="pb-3 w-1/8 font-semibold">Deadline</th>
                            <th className="pb-3 w-1/8 font-semibold">Country</th>
                            <th className="pb-3 w-1/8 text-right font-semibold"></th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {children}
                    </tbody>
                </table>
            </div>

            {/* Dynamic Pagination Footer (Sticky to bottom) */}
            <div className="pt-4 border-t border-gray-100 flex justify-center items-center gap-1.5 flex-shrink-0">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-transparent text-slate-600 hover:bg-gray-100'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                {totalPages > 5 && (
                    <>
                        <span className="px-1 text-slate-400 text-xs">...</span>
                        <button
                            onClick={() => handlePageClick(totalPages)}
                            className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${currentPage === totalPages
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-transparent text-slate-600 hover:bg-gray-100'
                                }`}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageClick(currentPage + 1)}
                    className="ml-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}