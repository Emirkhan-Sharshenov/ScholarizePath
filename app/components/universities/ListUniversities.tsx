'use client';

import React, { useEffect, useState, useMemo } from 'react';
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

    const itemsPerPage = 5;

    useEffect(() => {
        async function fetchUniversities() {
            try {
                const res = await fetch('/api/universities');
                if (!res.ok) throw new Error('Failed to fetch universities');
                const data = await res.json();

                if (Array.isArray(data)) {
                    setUniversities(data);
                } else if (data && Array.isArray(data.data)) {
                    setUniversities(data.data);
                } else {
                    setUniversities([]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchUniversities();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Вспомогательные функции безопасного извлечения значений
    const getCountryName = (uni: any): string => {
        if (typeof uni.country === 'string') return uni.country;
        if (typeof uni.location === 'string') return uni.location;
        if (uni.location && typeof uni.location === 'object') {
            return uni.location.country || '';
        }
        return '';
    };

    const getCityName = (uni: any): string => {
        if (uni.location && typeof uni.location === 'object') {
            return uni.location.city || '';
        }
        return '';
    };

    const formatLocation = (uni: any): string => {
        const city = getCityName(uni);
        const country = getCountryName(uni);
        const parts = [city, country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    const getGlobalRank = (uni: any): number | null => {
        if (typeof uni.ranking === 'number') return uni.ranking;
        if (typeof uni.rank === 'number') return uni.rank;
        if (uni.ranking && typeof uni.ranking.global === 'number') return uni.ranking.global;
        return null;
    };

    const getTuitionFee = (uni: any): number | null => {
        if (typeof uni.tuition === 'number') return uni.tuition;
        if (uni.tuition && typeof uni.tuition.bachelor === 'number') return uni.tuition.bachelor;
        return null;
    };

    const processedUniversities = useMemo(() => {
        let list = [...universities];

        if (filters) {
            // 1. Поиск (название или ключевые слова)
            if (filters.search && filters.search.trim() !== '') {
                const query = filters.search.toLowerCase().trim();
                list = list.filter((uni) => {
                    const nameStr = typeof uni.name === 'string' ? uni.name : (uni.name?.name || '');
                    const nameMatch = nameStr.toLowerCase().includes(query);
                    const keywordMatch =
                        Array.isArray(uni.searchKeywords) &&
                        uni.searchKeywords.some((k: string) =>
                            typeof k === 'string' && k.toLowerCase().includes(query)
                        );
                    return nameMatch || keywordMatch;
                });
            }

            // 2. Страна
            if (filters.country && filters.country !== 'All Countries') {
                list = list.filter(
                    (uni) => getCountryName(uni).toLowerCase() === filters.country.toLowerCase()
                );
            }

            // 3. Диапазон рейтинга
            if (filters.minRanking !== '') {
                list = list.filter((uni) => {
                    const rank = getGlobalRank(uni);
                    return rank !== null && rank >= Number(filters.minRanking);
                });
            }
            if (filters.maxRanking !== '') {
                list = list.filter((uni) => {
                    const rank = getGlobalRank(uni);
                    return rank !== null && rank <= Number(filters.maxRanking);
                });
            }

            // 4. Стоимость
            if (filters.minTuition !== '') {
                list = list.filter((uni) => {
                    const tuition = getTuitionFee(uni);
                    return tuition !== null && tuition >= Number(filters.minTuition);
                });
            }
            if (filters.maxTuition !== '') {
                list = list.filter((uni) => {
                    const tuition = getTuitionFee(uni);
                    return tuition !== null && tuition <= Number(filters.maxTuition);
                });
            }

            // 5. Программы
            if (filters.programs && filters.programs !== 'All Programs') {
                list = list.filter((uni) => {
                    if (Array.isArray(uni.programs)) {
                        return uni.programs.some((p: any) => {
                            const progName = typeof p === 'string' ? p : p.name;
                            return progName?.toLowerCase() === filters.programs.toLowerCase();
                        });
                    }
                    return false;
                });
            }

            // 6. Уровень степени
            if (filters.degreeLevel && filters.degreeLevel !== 'All Degree Levels') {
                list = list.filter((uni) => {
                    if (Array.isArray(uni.degreeLevels)) {
                        return uni.degreeLevels.some(
                            (d: string) => typeof d === 'string' && d.toLowerCase() === filters.degreeLevel.toLowerCase()
                        );
                    }
                    return false;
                });
            }
        }

        // Сортировка
        return list.sort((a, b) => {
            const rankA = getGlobalRank(a);
            const rankB = getGlobalRank(b);
            const tuitionA = getTuitionFee(a);
            const tuitionB = getTuitionFee(b);

            switch (sortBy) {
                case 'Ranking: High to Low': {
                    if (rankA == null && rankB == null) return 0;
                    if (rankA == null) return 1;
                    if (rankB == null) return -1;
                    return rankA - rankB;
                }
                case 'Ranking: Low to High': {
                    if (rankA == null && rankB == null) return 0;
                    if (rankA == null) return 1;
                    if (rankB == null) return -1;
                    return rankB - rankA;
                }
                case 'Tuition: Low to High': {
                    if (tuitionA == null && tuitionB == null) return 0;
                    if (tuitionA == null) return 1;
                    if (tuitionB == null) return -1;
                    return tuitionA - tuitionB;
                }
                case 'Tuition: High to Low': {
                    if (tuitionA == null && tuitionB == null) return 0;
                    if (tuitionA == null) return 1;
                    if (tuitionB == null) return -1;
                    return tuitionB - tuitionA;
                }
                default:
                    return 0;
            }
        });
    }, [universities, filters, sortBy]);

    // Пагинация
    const totalCount = processedUniversities.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUniversities = processedUniversities.slice(startIndex, endIndex);

    const showingStart = totalCount === 0 ? 0 : startIndex + 1;
    const showingEnd = Math.min(endIndex, totalCount);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Loading universities...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 font-sans shadow-sm md:p-8">
            {/* Header */}
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
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                setCurrentPage(1);
                            }}
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

            {/* Table */}
            <div className="my-2 w-full overflow-x-auto">
                <table className="w-full min-w-[700px] table-fixed border-collapse text-left">
                    <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold text-slate-500">
                            <th className="w-[22%] pb-4 font-semibold">University Name</th>
                            <th className="w-[16%] pb-4 font-semibold">Location</th>
                            <th className="w-[12%] pb-4 font-semibold">Ranking</th>
                            <th className="w-[16%] pb-4 font-semibold">Tuition Fee (USD)</th>
                            <th className="w-[24%] pb-4 font-semibold">Description</th>
                            <th className="w-[10%] pb-4 text-right font-semibold">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100/80 text-xs">
                        {currentUniversities.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                    No universities match the selected filters.
                                </td>
                            </tr>
                        ) : (
                            currentUniversities.map((uni: any, index: number) => {
                                // БЕРЕМ ПРАВИЛЬНЫЙ ID ВНЕ ЗАВИСИМОСТИ ОТ ИМЕНИ ПОЛЯ
                                const targetId = uni._id || uni.id || `uni-${index}`;
                                const uniName = typeof uni.name === 'string' ? uni.name : (uni.name?.name || 'University');
                                const locationText = formatLocation(uni);
                                const rank = getGlobalRank(uni);
                                const tuition = getTuitionFee(uni);

                                return (
                                    <tr key={targetId} className="transition-colors hover:bg-slate-50/40">
                                        <td className="py-4 pr-3 align-top">
                                            <div className="line-clamp-2 break-words font-bold text-slate-900">
                                                {uniName}
                                            </div>
                                        </td>
                                        <td className="py-4 pr-3 align-top">
                                            <div className="line-clamp-2 break-words font-normal text-slate-600">
                                                {locationText}
                                            </div>
                                        </td>
                                        <td className="py-4 pr-3 align-top font-bold text-slate-900">
                                            {rank ? `#${rank}` : 'N/A'}
                                        </td>
                                        <td className="py-4 pr-3 align-top font-bold text-slate-900">
                                            {tuition ? `$${tuition.toLocaleString('en-US')}` : 'N/A'}
                                        </td>
                                        <td className="py-4 pr-3 align-top">
                                            <p className="line-clamp-2 overflow-hidden break-words font-normal leading-relaxed text-slate-500">
                                                {uni.description || 'No description provided.'}
                                            </p>
                                        </td>
                                        <td className="whitespace-nowrap py-4 text-right align-top">
                                            <Link
                                                href={`/universities/${uni._id}`}
                                                className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
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

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 pt-6">
                <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="mr-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="px-2 text-xs font-medium text-slate-600">
                    Page {currentPage} of {totalPages || 1}
                </span>
                <button
                    disabled={currentPage >= totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="ml-2 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}