"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Heart, MapPin, Shuffle, Loader2 } from "lucide-react";

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

const FALLBACK_IDS = new Set([
    "harvard", "mit", "stanford", "oxford", "cambridge", "eth", "toronto", "imperial",
]);

const FALLBACK_UNIVERSITIES: University[] = [
    { id: "harvard", name: "Harvard University", shortName: "Harvard", location: "Cambridge, USA", rank: "1" },
    { id: "mit", name: "Massachusetts Institute of Technology", shortName: "MIT", location: "Cambridge, USA", rank: "2" },
    { id: "stanford", name: "Stanford University", shortName: "Stanford", location: "Stanford, USA", rank: "3" },
    { id: "oxford", name: "University of Oxford", shortName: "Oxford", location: "Oxford, UK", rank: "4" },
    { id: "cambridge", name: "University of Cambridge", shortName: "Cambridge", location: "Cambridge, UK", rank: "5" },
    { id: "eth", name: "ETH Zurich", shortName: "ETH", location: "Zurich, Switzerland", rank: "6" },
    { id: "toronto", name: "University of Toronto", shortName: "UofT", location: "Toronto, Canada", rank: "7" },
    { id: "imperial", name: "Imperial College London", shortName: "Imperial", location: "London, UK", rank: "8" },
];

const FLAG_BY_COUNTRY: Record<string, string> = {
    "united states": "🇺🇸", "usa": "🇺🇸", "united states of america": "🇺🇸",
    "united kingdom": "🇬🇧", "uk": "🇬🇧",
    canada: "🇨🇦", australia: "🇦🇺", germany: "🇩🇪", france: "🇫🇷",
    switzerland: "🇨🇭", netherlands: "🇳🇱", sweden: "🇸🇪", "south korea": "🇰🇷",
    japan: "🇯🇵", china: "🇨🇳", singapore: "🇸🇬", "hong kong": "🇭🇰",
    italy: "🇮🇹", spain: "🇪🇸", ireland: "🇮🇪", "new zealand": "🇳🇿",
    denmark: "🇩🇰", norway: "🇳🇴", finland: "🇫🇮", austria: "🇦🇹",
    belgium: "🇧🇪", turkey: "🇹🇷", "czech republic": "🇨🇿", poland: "🇵🇱",
    russia: "🇷🇺", "united arab emirates": "🇦🇪", uae: "🇦🇪", malaysia: "🇲🇾",
    india: "🇮🇳", kazakhstan: "🇰🇿", kyrgyzstan: "🇰🇬",
};

function shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export default function TopUniversitiesCard({ countryName }: TopUniversitiesCardProps) {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [personalized, setPersonalized] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const load = useCallback(async () => {
        setLoading(true);
        setError(false);

        try {
            let effectiveCountry = countryName;
            let favorites: string[] = [];

            if (!countryName) {
                try {
                    const selfRes = await fetch("/api/auth/self");
                    if (selfRes.ok) {
                        const selfData = await selfRes.json();
                        favorites = selfData?.user?.favoriteUniversities || [];
                        const preferred = selfData?.user?.profile?.preferredCountry;
                        if (typeof preferred === "string" && preferred.trim()) {
                            effectiveCountry = preferred.trim();
                        }
                    }
                } catch {
                    // Personalization is a nice-to-have — fall through to the generic pool.
                }
            }

            setPersonalized(Boolean(effectiveCountry));
            setFavoriteIds(new Set(favorites));

            const url = effectiveCountry
                ? `/api/universities?country=${encodeURIComponent(effectiveCountry)}&limit=24`
                : `/api/universities?limit=24`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            let list: University[] = Array.isArray(data)
                ? data
                : Array.isArray((data as any).data)
                    ? (data as any).data
                    : [];

            // Real results only — padding a short (e.g. country-filtered) list with the
            // fallback universities below would show "View" links to IDs that don't
            // exist in the database and land on a "university not found" page.
            setUniversities(shuffle(list).slice(0, 8));
        } catch {
            setError(true);
            setUniversities(FALLBACK_UNIVERSITIES);
        } finally {
            setLoading(false);
        }
    }, [countryName, refreshKey]);

    useEffect(() => {
        async function run() {
            await load();
        }
        run();
    }, [load]);

    const formatName = (uni: University): string => {
        if (typeof uni.name === "string") return uni.name;
        if (typeof uni.name === "object" && uni.name !== null) {
            return uni.name.name || uni.name.en || "University";
        }
        return "University";
    };

    const formatLocation = (uni: University): { text: string; country: string } => {
        if (typeof uni.location === "string") {
            const parts = uni.location.split(",").map((p) => p.trim());
            return { text: uni.location, country: parts[parts.length - 1] || "" };
        }
        if (typeof uni.country === "string") return { text: uni.country, country: uni.country };

        const locObj = (typeof uni.location === "object" ? uni.location : uni.country) as LocationObject;
        if (locObj && typeof locObj === "object") {
            const parts = [locObj.city, locObj.country].filter(
                (p) => typeof p === "string" && p.trim() !== ""
            );
            if (parts.length > 0) return { text: parts.join(", "), country: locObj.country || "" };
        }

        return { text: "Worldwide", country: "" };
    };

    const formatRank = (uni: University, index: number): string => {
        if (typeof uni.rank === "string" || typeof uni.rank === "number") {
            return `#${uni.rank}`;
        }
        if (typeof uni.rank === "object" && uni.rank !== null) {
            const val = uni.rank.world || uni.rank.rank;
            if (val) return `#${val}`;
        }
        return `#${index + 1}`;
    };

    const getUniversityId = (uni: University, fallbackIndex: number): string => {
        return String(uni.id ?? uni._id ?? fallbackIndex);
    };

    const handleToggleFavorite = async (id: string) => {
        if (FALLBACK_IDS.has(id) || togglingId) return;

        const isFavorite = favoriteIds.has(id);
        const next = new Set(favoriteIds);
        if (isFavorite) next.delete(id);
        else next.add(id);

        setTogglingId(id);
        setFavoriteIds(next);

        try {
            await fetch("/api/auth/self", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favoriteUniversities: Array.from(next) }),
            });
        } catch {
            setFavoriteIds(favoriteIds); // revert on failure
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="w-full mt-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        Suggested Universities {countryName ? `in ${countryName}` : ""}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {personalized
                            ? "Picked based on your profile preferences"
                            : "A fresh mix from around the world — reshuffle for more"}
                    </p>
                </div>
                {!countryName && (
                    <button
                        type="button"
                        onClick={() => setRefreshKey((k) => k + 1)}
                        disabled={loading}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-brand disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shuffle className="h-3.5 w-3.5" />}
                        Shuffle
                    </button>
                )}
            </div>

            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-[172px] rounded-2xl bg-gray-100 animate-pulse w-full"
                        />
                    ))}
                </div>
            )}

            {error && !loading && universities.length === 0 && (
                <p className="text-sm text-red-500 py-4">
                    Couldn&apos;t find any university
                </p>
            )}

            {!loading && !error && universities.length === 0 && (
                <p className="text-sm text-slate-500 py-4">Universities not found</p>
            )}

            {!loading && universities.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {universities.map((uni, idx) => {
                        const uniId = getUniversityId(uni, idx);
                        const uniName = formatName(uni);
                        const { text: locationText, country } = formatLocation(uni);
                        const rankText = formatRank(uni, idx);
                        const flag = FLAG_BY_COUNTRY[country.toLowerCase()];
                        const isFallback = FALLBACK_IDS.has(uniId);
                        const isFavorite = favoriteIds.has(uniId);

                        return (
                            <div
                                key={`${uniId}-${idx}`}
                                className="group relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
                            >
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 opacity-80"
                                />

                                {!isFallback && (
                                    <button
                                        type="button"
                                        onClick={() => handleToggleFavorite(uniId)}
                                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                        aria-pressed={isFavorite}
                                        className="absolute right-3 top-3.5 rounded-full p-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                    >
                                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                                    </button>
                                )}

                                <div>
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                        <GraduationCap className="h-4.5 w-4.5" />
                                    </div>

                                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 pr-6">
                                        {uniName}
                                    </h3>

                                    {typeof uni.shortName === "string" && (
                                        <p className="text-xs text-slate-400 mt-1 font-medium">
                                            {uni.shortName}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-3">
                                        {flag ? (
                                            <span className="text-sm leading-none">{flag}</span>
                                        ) : (
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        )}
                                        <span className="truncate">{locationText}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-2">
                                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                        {rankText} World
                                    </span>
                                    {isFallback ? (
                                        <span className="text-xs font-medium text-slate-300">Unavailable</span>
                                    ) : (
                                        <Link
                                            href={`/universities/${uniId}`}
                                            className="text-xs font-semibold text-slate-800 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                        >
                                            View <span className="text-sm">→</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
