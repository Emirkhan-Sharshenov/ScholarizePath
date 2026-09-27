"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Award, Building2, Loader2, MapPin, MousePointerClick, X } from "lucide-react";
import { toDbCountryName } from "./mapData";
import type { MapCountry } from "./WorldMap";

interface ApiUniversity {
    _id: string;
    name?: string | { name?: string; en?: string };
    location?: { city?: string; country?: string } | string;
    ranking?: number | { global?: number; qs?: number };
}

export interface CountryUniversity {
    id: string;
    name: string;
    city: string;
    rank: number | null;
}

function toCountryUniversity(uni: ApiUniversity): CountryUniversity {
    const name =
        typeof uni.name === "string" ? uni.name : uni.name?.name || uni.name?.en || "University";
    const city = typeof uni.location === "object" ? uni.location?.city || "" : "";
    const rank =
        typeof uni.ranking === "number"
            ? uni.ranking
            : uni.ranking?.global || uni.ranking?.qs || null;

    return { id: String(uni._id), name, city, rank: rank && rank > 0 ? rank : null };
}

// Top-ranked universities of the selected country (the API sorts by ranking
// by default). Fetched once here and shared by the desktop panel and the
// phone bottom sheet.
export function useCountryUniversities(countryName: string | null) {
    const [state, setState] = useState<{
        country: string | null;
        items: CountryUniversity[];
        error: boolean;
    }>({ country: null, items: [], error: false });

    useEffect(() => {
        if (!countryName) return;
        let cancelled = false;

        fetch(`/api/universities?country=${encodeURIComponent(toDbCountryName(countryName))}&limit=5`)
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                return res.json();
            })
            .then((data: { data?: ApiUniversity[] }) => {
                if (cancelled) return;
                setState({ country: countryName, items: (data.data ?? []).map(toCountryUniversity), error: false });
            })
            .catch(() => {
                if (!cancelled) setState({ country: countryName, items: [], error: true });
            });

        return () => {
            cancelled = true;
        };
    }, [countryName]);

    // Still loading while the stored result belongs to a different country.
    const loading = Boolean(countryName) && state.country !== countryName;
    return { items: loading ? [] : state.items, error: !loading && state.error, loading };
}

interface CountryDetailsProps {
    country: MapCountry;
    universities: ReturnType<typeof useCountryUniversities>;
    onClose: () => void;
}

function CountryDetails({ country, universities, onClose }: CountryDetailsProps) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                        Selected country
                    </span>
                    <h2 className="mt-2 truncate font-display text-2xl font-bold tracking-tight text-ink">{country.name}</h2>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close country details"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-ink"
                >
                    <X className="h-[18px] w-[18px]" />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                    <Building2 aria-hidden="true" className="h-5 w-5 text-brand" />
                    <p className="mt-2 font-display text-3xl font-bold leading-none text-ink">{country.unis}</p>
                    <p className="mt-1 text-sm text-slate-600">Universities</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                    <Award aria-hidden="true" className="h-5 w-5 text-amber-600" />
                    <p className="mt-2 font-display text-3xl font-bold leading-none text-amber-900">{country.scholarships}</p>
                    <p className="mt-1 text-sm text-amber-800/80">Scholarships</p>
                </div>
            </div>

            <h3 className="mt-6 text-sm font-semibold text-ink">Top universities in {country.name}</h3>

            <div className="mt-3 min-h-0 flex-1">
                {universities.loading && (
                    <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                    </div>
                )}
                {universities.error && (
                    <p className="py-6 text-sm text-slate-500">Couldn&apos;t load universities right now.</p>
                )}
                {!universities.loading && !universities.error && universities.items.length === 0 && (
                    <p className="py-6 text-sm text-slate-500">No universities listed for this country yet.</p>
                )}
                {universities.items.length > 0 && (
                    <ol className="space-y-1">
                        {universities.items.map((uni) => (
                            <li key={uni.id}>
                                <Link
                                    href={`/universities/${uni.id}`}
                                    className="group flex items-center gap-3 rounded-xl p-2 -mx-2 transition-colors hover:bg-slate-50"
                                >
                                    <span className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-1.5 font-display text-xs font-bold text-slate-600 group-hover:bg-brand group-hover:text-white">
                                        {uni.rank ? `#${uni.rank}` : <Building2 aria-hidden="true" className="h-4 w-4" />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-semibold text-ink group-hover:text-brand">{uni.name}</span>
                                        {uni.city && (
                                            <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                                                <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
                                                {uni.city}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            <Link
                href="/universities"
                className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm font-semibold text-brand hover:underline"
            >
                Browse all universities
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
        </div>
    );
}

interface CountryPanelProps {
    country: MapCountry | null;
    universities: ReturnType<typeof useCountryUniversities>;
    onClose: () => void;
}

// Desktop/tablet: a card next to (lg) or under (md) the map.
export function CountryPanel({ country, universities, onClose }: CountryPanelProps) {
    return (
        <div className="hidden h-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.04)] md:block">
            {country ? (
                <CountryDetails country={country} universities={universities} onClose={onClose} />
            ) : (
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-4 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand">
                        <MousePointerClick aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <p className="mt-4 font-display text-base font-semibold text-ink">Pick a country</p>
                    <p className="mt-1 max-w-[220px] text-sm leading-relaxed text-slate-500">
                        Click a highlighted country on the map to see its universities and scholarships.
                    </p>
                </div>
            )}
        </div>
    );
}

// Phones: a bottom sheet above the tab bar. Portalled into <body> for the
// same reason as MobileFilterDrawer — the dashboard shell's `contain: layout`
// and PageTransition's transform would otherwise make `position: fixed`
// relative to the page instead of the viewport.
export function CountrySheet({ country, universities, onClose }: CountryPanelProps) {
    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {country && (
                <motion.div
                    key="country-sheet"
                    role="dialog"
                    aria-label={`${country.name} details`}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white px-5 pb-5 pt-3 font-body shadow-[0_-12px_40px_rgba(10,26,63,0.15)] md:hidden"
                >
                    <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300" />
                    <CountryDetails country={country} universities={universities} onClose={onClose} />
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
