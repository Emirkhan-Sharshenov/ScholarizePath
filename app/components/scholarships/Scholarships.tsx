'use client';

import React, { useEffect, useState, useMemo } from 'react';
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

    const itemsPerPage = 5;

    useEffect(() => {
        async function fetchScholarships() {
            try {
                const res = await fetch('/api/scholarships');
                if (!res.ok) {
                    throw new Error('Failed to fetch scholarships');
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

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const getDeadlineTime = (item: any): number | null => {
        const rawDate = item.deadlines?.[0]?.date || item.deadline;
        if (!rawDate) return null;
        const timestamp = new Date(rawDate).getTime();
        return isNaN(timestamp) ? null : timestamp;
    };

    const getAmountValue = (item: any): number | null => {
        const maxVal = item.award?.estimatedValue?.max;
        const minVal = item.award?.estimatedValue?.min;
        if (typeof maxVal === 'number') return maxVal;
        if (typeof minVal === 'number') return minVal;

        const altAmount = item.award?.amount || item.amount;
        if (typeof altAmount === 'number') return altAmount;
        if (typeof altAmount === 'string') {
            const parsed = parseFloat(altAmount.replace(/[^0-9.-]+/g, ''));
            return isNaN(parsed) ? null : parsed;
        }

        return null;
    };

    const processedScholarships = useMemo(() => {
        let list = [...scholarships];

        if (filters) {
            // 1. Поиск по названию, описанию и ключевым словам
            if (filters.search && filters.search.trim() !== '') {
                const query = filters.search.toLowerCase().trim();
                list = list.filter((item) => {
                    const nameMatch = item.scholarshipName?.toLowerCase().includes(query);
                    const descMatch = item.description?.toLowerCase().includes(query);
                    const keywordMatch =
                        Array.isArray(item.searchKeywords) &&
                        item.searchKeywords.some((k: string) =>
                            k.toLowerCase().includes(query)
                        );
                    return nameMatch || descMatch || keywordMatch;
                });
            }

            // 2. Страна
            if (filters.country && filters.country !== 'All Countries') {
                list = list.filter(
                    (item) => item.country?.toLowerCase() === filters.country.toLowerCase()
                );
            }

            // 3. Уровень обучения (Study Level)
            if (filters.studyLevel && filters.studyLevel !== 'All Study Levels') {
                list = list.filter((item) => {
                    if (Array.isArray(item.studyLevel)) {
                        return item.studyLevel.some(
                            (level: string) =>
                                level.toLowerCase() === filters.studyLevel.toLowerCase()
                        );
                    }
                    return (
                        typeof item.studyLevel === 'string' &&
                        item.studyLevel.toLowerCase() === filters.studyLevel.toLowerCase()
                    );
                });
            }

            // 4. Область знаний (Field of Study)
            if (filters.fieldOfStudy && filters.fieldOfStudy !== 'All Fields') {
                list = list.filter((item) => {
                    if (!item.fieldOfStudy) return false;
                    if (item.fieldOfStudy.toLowerCase() === 'all fields') return true;
                    return item.fieldOfStudy
                        .toLowerCase()
                        .includes(filters.fieldOfStudy.toLowerCase());
                });
            }

            // 5. Минимальная сумма (Min Amount)
            if (filters.minAmount && filters.minAmount.trim() !== '') {
                const minVal = parseFloat(filters.minAmount);
                if (!isNaN(minVal)) {
                    list = list.filter((item) => {
                        const amount = getAmountValue(item);
                        return amount !== null && amount >= minVal;
                    });
                }
            }

            // 6. Максимальный дедлайн (Max Deadline)
            if (filters.maxDeadline && filters.maxDeadline.trim() !== '') {
                const filterDeadlineTime = new Date(filters.maxDeadline).getTime();
                if (!isNaN(filterDeadlineTime)) {
                    list = list.filter((item) => {
                        const deadlineTime = getDeadlineTime(item);
                        return deadlineTime !== null && deadlineTime <= filterDeadlineTime;
                    });
                }
            }
        }

        // Сортировка
        return list.sort((a, b) => {
            const deadlineA = getDeadlineTime(a);
            const deadlineB = getDeadlineTime(b);
            const amountA = getAmountValue(a);
            const amountB = getAmountValue(b);

            switch (sortBy) {
                case 'Deadline (Earliest)': {
                    if (deadlineA == null && deadlineB == null) return 0;
                    if (deadlineA == null) return 1;
                    if (deadlineB == null) return -1;
                    return deadlineA - deadlineB;
                }
                case 'Deadline (Latest)': {
                    if (deadlineA == null && deadlineB == null) return 0;
                    if (deadlineA == null) return 1;
                    if (deadlineB == null) return -1;
                    return deadlineB - deadlineA;
                }
                case 'Amount (Highest)': {
                    if (amountA == null && amountB == null) return 0;
                    if (amountA == null) return 1;
                    if (amountB == null) return -1;
                    return amountB - amountA;
                }
                case 'Amount (Lowest)': {
                    if (amountA == null && amountB == null) return 0;
                    if (amountA == null) return 1;
                    if (amountB == null) return -1;
                    return amountA - amountB;
                }
                default:
                    return 0;
            }
        });
    }, [scholarships, filters, sortBy]);

    const totalCount = processedScholarships.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentScholarships = processedScholarships.slice(startIndex, endIndex);

    const showingStart = totalCount === 0 ? 0 : startIndex + 1;
    const showingEnd = Math.min(endIndex, totalCount);

    const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    const getPaginationRange = () => {
        const delta = 1;
        const range: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                range.push(i);
            }
            return range;
        }

        const leftSibling = Math.max(currentPage - delta, 1);
        const rightSibling = Math.min(currentPage + delta, totalPages);

        const showLeftEllipsis = leftSibling > 2;
        const showRightEllipsis = rightSibling < totalPages - 1;

        if (!showLeftEllipsis && showRightEllipsis) {
            const leftItemCount = 3 + 2 * delta;
            for (let i = 1; i <= leftItemCount; i++) {
                range.push(i);
            }
            range.push('...');
            range.push(totalPages);
        } else if (showLeftEllipsis && !showRightEllipsis) {
            const rightItemCount = 3 + 2 * delta;
            range.push(1);
            range.push('...');
            for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
                range.push(i);
            }
        } else if (showLeftEllipsis && showRightEllipsis) {
            range.push(1);
            range.push('...');
            for (let i = leftSibling; i <= rightSibling; i++) {
                range.push(i);
            }
            range.push('...');
            range.push(totalPages);
        }

        return range;
    };

    if (loading) {
        return <div className="p-8 text-sm text-gray-500">Loading scholarships...</div>;
    }

    return (
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 font-sans shadow-sm md:p-8">
            {/* Top Header Bar */}
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

            {/* Table Area */}
            <div className="my-2 w-full overflow-x-auto">
                <table className="w-full min-w-[700px] table-fixed border-collapse text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold text-slate-500">
                            <th className="w-[40%] pb-4 font-semibold">Scholarship Name</th>
                            <th className="w-[15%] pb-4 font-semibold">Amount</th>
                            <th className="w-[18%] pb-4 font-semibold">Deadline</th>
                            <th className="w-[15%] pb-4 font-semibold">Country</th>
                            <th className="w-[12%] pb-4 text-right font-semibold">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100/80 text-xs">
                        {currentScholarships.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                    No scholarships match the selected filters.
                                </td>
                            </tr>
                        ) : (
                            currentScholarships.map((scholarship: any, index: number) => {
                                const rowKey =
                                    scholarship._id || scholarship.id || `scholarship-${index}`;

                                let amountDisplay = scholarship.award?.type || 'N/A';
                                if (scholarship.award?.estimatedValue) {
                                    const { currency, min, max } = scholarship.award.estimatedValue;
                                    const currSymbol =
                                        currency === 'GBP'
                                            ? '£'
                                            : currency === 'USD'
                                                ? '$'
                                                : `${currency} `;
                                    if (min && max) {
                                        amountDisplay = `${currSymbol}${min.toLocaleString()} - ${currSymbol}${max.toLocaleString()}`;
                                    } else if (max) {
                                        amountDisplay = `${currSymbol}${max.toLocaleString()}`;
                                    }
                                } else if (scholarship.award?.amount || scholarship.amount) {
                                    amountDisplay = scholarship.award?.amount || scholarship.amount;
                                }

                                const deadlineDisplay =
                                    scholarship.deadlines?.[0]?.date ||
                                    scholarship.deadline ||
                                    'N/A';

                                return (
                                    <tr
                                        key={rowKey}
                                        className="h-[104px] transition-colors hover:bg-slate-50/40"
                                    >
                                        <td className="break-words py-5 pr-4 align-top">
                                            <div className="line-clamp-1 break-words text-sm font-bold text-slate-900">
                                                {scholarship.scholarshipName}
                                            </div>

                                            <p className="line-clamp-2 mt-1.5 overflow-hidden break-words font-normal leading-relaxed text-slate-500 text-xs">
                                                {scholarship.description ||
                                                    scholarship.details ||
                                                    'No description provided.'}
                                            </p>
                                        </td>

                                        <td className="break-words py-5 pr-2 align-top text-xs font-bold text-slate-900">
                                            {amountDisplay}
                                        </td>

                                        <td className="break-words py-5 pr-2 align-top text-xs font-medium text-slate-800">
                                            {deadlineDisplay}
                                        </td>

                                        <td className="break-words py-5 pr-2 align-top text-xs font-medium text-slate-800">
                                            {scholarship.country || 'N/A'}
                                        </td>

                                        <td className="whitespace-nowrap py-5 text-right align-top">
                                            <button className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
                                                Apply
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Dynamic Smart Pagination Footer */}
            <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 pt-6">
                <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageClick(currentPage - 1)}
                    className="mr-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Prev
                </button>

                {getPaginationRange().map((page, idx) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">
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
                                : 'bg-transparent text-slate-700 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

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