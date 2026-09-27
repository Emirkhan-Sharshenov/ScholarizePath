"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Shuffle, Loader2, Sparkles } from "lucide-react";

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
    ranking?: number | { global?: number; qs?: number };
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

            setFavoriteIds(new Set(favorites));

            const fetchPool = async (country?: string): Promise<University[]> => {
                const url = country
                    ? `/api/universities?country=${encodeURIComponent(country)}&limit=24`
                    : `/api/universities?limit=24`;
                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                return Array.isArray(data)
                    ? data
                    : Array.isArray((data as any).data)
                        ? (data as any).data
                        : [];
            };

            let list = await fetchPool(effectiveCountry);
            let usedPersonalization = Boolean(effectiveCountry);

            // The preferred-country filter is a soft default, not a hard requirement —
            // if it has no real matches (a country with few/no listed universities),
            // fall back to the generic pool instead of showing an empty section. An
            // explicitly-requested countryName (map selection) is respected as-is.
            if (list.length === 0 && effectiveCountry && !countryName) {
                list = await fetchPool(undefined);
                usedPersonalization = false;
            }

            setPersonalized(usedPersonalization);
            // Real results only — padding a short list with the fallback universities
            // below would show "View" links to IDs that don't exist in the database
            // and land on a "university not found" page.
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

    // Real world ranking only — the API returns `ranking` ({ global, qs } or a
    // plain number); `rank` is the fallback list's shape. No ranking → no badge,
    // rather than inventing one from the card's position in the list.
    const formatRank = (uni: University): string | null => {
        const fromRanking =
            typeof uni.ranking === "number" ? uni.ranking : uni.ranking?.global || uni.ranking?.qs;
        if (fromRanking && fromRanking > 0) return `#${fromRanking} World`;

        if (typeof uni.rank === "string" || typeof uni.rank === "number") return `#${uni.rank} World`;
        if (typeof uni.rank === "object" && uni.rank !== null) {
            const val = uni.rank.world || uni.rank.rank;
            if (val) return `#${val} World`;
        }
        return null;
    };

    // Monogram for the logo tile: the short name if it's short, otherwise the
    // initials of the capitalised words ("Imperial College London" → "ICL").
    // "University" is dropped only when enough other words remain, so
    // "Technical University of Munich" → "TM" but "Harvard University" → "HU".
    const uniInitials = (uni: University, name: string): string => {
        if (typeof uni.shortName === "string" && uni.shortName.length <= 5) return uni.shortName;
        const words = name.split(/\s+/).filter((w) => /^[A-Z]/.test(w) && !["Of", "The", "And"].includes(w));
        const withoutUniversity = words.filter((w) => w !== "University");
        const picked = withoutUniversity.length >= 2 ? withoutUniversity : words;
        return (picked.length ? picked : name.split(/\s+/))
            .slice(0, 3)
            .map((w) => w[0])
            .join("")
            .toUpperCase();
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
        <section className="w-full" aria-labelledby="suggested-universities-heading">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 id="suggested-universities-heading" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink md:text-2xl">
                        <Sparkles aria-hidden="true" className="h-5 w-5 text-amber-500" />
                        Suggested Universities {countryName ? `in ${countryName}` : ""}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
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
                        className="flex h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-brand disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
                        Shuffle
                    </button>
                )}
            </div>

            {loading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-[196px] w-full animate-pulse rounded-2xl bg-slate-200/60" />
                    ))}
                </div>
            )}

            {error && !loading && universities.length === 0 && (
                <p className="py-4 text-sm text-red-500">
                    Couldn&apos;t find any university
                </p>
            )}

            {!loading && !error && universities.length === 0 && (
                <p className="py-4 text-sm text-slate-500">Universities not found</p>
            )}

            {!loading && universities.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {universities.map((uni, idx) => {
                        const uniId = getUniversityId(uni, idx);
                        const uniName = formatName(uni);
                        const { text: locationText, country } = formatLocation(uni);
                        const rankText = formatRank(uni);
                        const flag = FLAG_BY_COUNTRY[country.toLowerCase()];
                        const isFallback = FALLBACK_IDS.has(uniId);
                        const isFavorite = favoriteIds.has(uniId);

                        return (
                            <article
                                key={`${uniId}-${idx}`}
                                className="group relative flex w-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_10px_24px_rgba(10,26,63,0.08)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="flex h-12 min-w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-[#2f7cf6] px-2 font-display text-sm font-bold text-white shadow-sm">
                                        {uniInitials(uni, uniName)}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {rankText && (
                                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand">
                                                {rankText}
                                            </span>
                                        )}
                                        {!isFallback && (
                                            <button
                                                type="button"
                                                onClick={() => handleToggleFavorite(uniId)}
                                                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                                                aria-pressed={isFavorite}
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                            >
                                                <Heart className={`h-[18px] w-[18px] ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className="mt-4 line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
                                    {uniName}
                                </h3>

                                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                                    {flag ? (
                                        <span className="text-sm leading-none">{flag}</span>
                                    ) : (
                                        <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                    )}
                                    <span className="truncate">{locationText}</span>
                                </p>

                                <div className="mt-5 flex flex-1 items-end justify-end">
                                    <div className="flex w-full items-center justify-end border-t border-slate-100 pt-3">
                                        {isFallback ? (
                                            <span className="text-sm font-medium text-slate-300">Unavailable</span>
                                        ) : (
                                            <Link
                                                href={`/universities/${uniId}`}
                                                className="flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-[#004a9f]"
                                            >
                                                View details
                                                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
