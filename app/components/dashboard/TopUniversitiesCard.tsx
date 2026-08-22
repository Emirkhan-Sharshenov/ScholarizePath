"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface LocationObject {
    country?: string;
    city?: string;
    region?: string;
    coordinates?: any;
}

interface University {
    id?: string | number;
    _id?: string | number;
    name?: string | { name?: string; en?: string };
    shortName?: string;
    location?: string | LocationObject;
    country?: string | LocationObject;
    rank?: string | number | { world?: string | number; rank?: string | number };
    websiteUrl?: string | { url?: string };
}

interface TopUniversitiesCardProps {
    countryName?: string;
}

export default function TopUniversitiesCard({ countryName }: TopUniversitiesCardProps) {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(false);

        const url = countryName
            ? `/api/universities?country=${encodeURIComponent(countryName)}`
            : `/api/universities`;

        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then((data) => {
                if (isMounted) {
                    let list: University[] = [];
                    if (Array.isArray(data)) {
                        list = data;
                    } else if (data && Array.isArray((data as any).data)) {
                        list = (data as any).data;
                    }

                    // Ограничиваем ровно до 8 элементов
                    setUniversities(list.slice(0, 8));
                    setLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [countryName]);

    // Безопасная обработка имени
    const formatName = (uni: University): string => {
        if (typeof uni.name === "string") return uni.name;
        if (typeof uni.name === "object" && uni.name !== null) {
            return uni.name.name || uni.name.en || "University";
        }
        return "University";
    };

    // Безопасная обработка локации
    const formatLocation = (uni: University): string => {
        if (typeof uni.location === "string") return uni.location;
        if (typeof uni.country === "string") return uni.country;

        const locObj = (typeof uni.location === "object" ? uni.location : uni.country) as LocationObject;
        if (locObj && typeof locObj === "object") {
            const parts = [locObj.city, locObj.country].filter(
                (p) => typeof p === "string" && p.trim() !== ""
            );
            if (parts.length > 0) return parts.join(", ");
        }

        return "Worldwide";
    };

    // Безопасная обработка рейтинга
    const formatRank = (uni: University, index: number): string => {
        if (typeof uni.rank === "string" || typeof uni.rank === "number") {
            return `#${uni.rank} in the World`;
        }
        if (typeof uni.rank === "object" && uni.rank !== null) {
            const val = uni.rank.world || uni.rank.rank;
            if (val) return `#${val} in the World`;
        }
        return `#${index + 1} in the World`;
    };

    // Получаем ID университета (поддержка id и _id)
    const getUniversityId = (uni: University, fallbackIndex: number): string | number => {
        return uni.id ?? uni._id ?? fallbackIndex;
    };

    return (
        <div className="w-full mt-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">
                    Suggested Universities {countryName ? `in ${countryName}` : ""}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Explore some of the best universities around the world
                </p>
            </div>

            {/* Skeleton Loading (8 блоков) */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-[160px] rounded-2xl bg-gray-100 animate-pulse w-full"
                        />
                    ))}
                </div>
            )}

            {/* Error state */}
            {error && (
                <p className="text-sm text-red-500 py-4">
                    Не удалось загрузить список университетов.
                </p>
            )}

            {/* Empty state */}
            {!loading && !error && universities.length === 0 && (
                <p className="text-sm text-slate-500 py-4">Университеты не найдены.</p>
            )}

            {/* Grid Layout (8 элементов) */}
            {!loading && !error && universities.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {universities.map((uni, idx) => {
                        const uniId = getUniversityId(uni, idx);
                        const uniName = formatName(uni);
                        const locationText = formatLocation(uni);
                        const rankText = formatRank(uni, idx);

                        return (
                            <div
                                key={uniId}
                                className="w-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
                            >
                                {/* Content Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                                        {uniName}
                                    </h3>

                                    {typeof uni.shortName === "string" && (
                                        <p className="text-xs text-slate-400 mt-1 font-medium">
                                            {uni.shortName}
                                        </p>
                                    )}

                                    {/* Location */}
                                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-3">
                                        <svg className="w-3.5 h-3.5 flex-shrink-0 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                                            <path d="M12 21s-6-5.333-6-10a6 6 0 0 1 12 0c0 4.667-6 10-6 10z" />
                                            <circle cx="12" cy="11" r="2" />
                                        </svg>
                                        <span className="truncate">{locationText}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-6 pt-2">
                                    <Link
                                        href={`/universities/${uniId}`}
                                        className="text-xs font-semibold text-slate-800 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                    >
                                        View Details <span className="text-sm">→</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}