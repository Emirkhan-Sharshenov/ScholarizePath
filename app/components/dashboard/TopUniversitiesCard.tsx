"use client";

import React, { useState, useEffect } from "react";

interface LocationObject {
    country?: string;
    city?: string;
    region?: string;
    coordinates?: any;
}

interface University {
    id?: string | number;
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
    const [favorites, setFavorites] = useState<Record<string | number, boolean>>({});

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

                    // Ограничиваем ровно до 12 штук
                    setUniversities(list.slice(0, 12));
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

    const toggleFavorite = (id: string | number) => {
        setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    };

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

    // Безопасная обработка ссылки
    const formatUrl = (uni: University): string => {
        if (typeof uni.websiteUrl === "string") return uni.websiteUrl;
        if (typeof uni.websiteUrl === "object" && uni.websiteUrl !== null) {
            return uni.websiteUrl.url || "#";
        }
        return "#";
    };

    return (
        <div className="w-full mt-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        Top Universities {countryName ? `in ${countryName}` : ""}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Explore some of the best universities around the world
                    </p>
                </div>
                <a
                    href="/universities"
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                    View All <span className="text-sm">→</span>
                </a>
            </div>

            {/* Skeleton Loading (12 блоков) */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
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

            {/* Grid Layout ровно на 12 элементов */}
            {!loading && !error && universities.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {universities.map((uni, idx) => {
                        const id = uni.id || idx;
                        const isFav = favorites[id];
                        const uniName = formatName(uni);
                        const locationText = formatLocation(uni);
                        const rankText = formatRank(uni, idx);
                        const webUrl = formatUrl(uni);

                        return (
                            <div
                                key={id}
                                className="w-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
                            >
                                {/* Favorite Button */}
                                <button
                                    onClick={() => toggleFavorite(id)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors z-10"
                                    aria-label="Add to favorites"
                                >
                                    <svg
                                        className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : "fill-none stroke-current stroke-2"}`}
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </button>

                                {/* Content Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 pr-6 leading-snug line-clamp-2">
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

                                {/* Footer Section */}
                                <div className="flex items-center justify-between mt-6 pt-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-600">
                                        {rankText}
                                    </span>

                                    <a
                                        href={webUrl}
                                        target={webUrl !== "#" ? "_blank" : "_self"}
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-slate-800 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                    >
                                        View Details <span className="text-sm">→</span>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}