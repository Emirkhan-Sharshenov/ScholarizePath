import Link from 'next/link';
import { Award, GraduationCap, Heart, MapPin, type LucideIcon } from 'lucide-react';

interface RankedUniversity {
    id: string;
    name: string;
    location: string;
    favoriteCount: number;
}

interface RankedScholarship {
    id: string;
    name: string;
    country: string;
    favoriteCount: number;
}

interface TopRankingsSectionProps {
    topUniversities: RankedUniversity[];
    topScholarships: RankedScholarship[];
    variant: 'teaser' | 'full';
}

function favoriteLabel(count: number): string {
    if (count === 1) return '1 student favorited this';
    return `${count} students favorited this`;
}

interface RankedItem {
    id: string;
    name: string;
    place: string;
    favoriteCount: number;
}

function RankedList({
    title,
    icon: Icon,
    items,
    hrefBase,
}: {
    title: string;
    icon: LucideIcon;
    items: RankedItem[];
    hrefBase: string;
}) {
    return (
        <div className="min-w-0">
            <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink">
                <Icon aria-hidden="true" className="h-[18px] w-[18px] text-brand" />
                {title}
            </h3>
            {items.length === 0 ? (
                <p className="text-sm text-slate-500">No favorites yet.</p>
            ) : (
                <ol className="space-y-3">
                    {items.map((item, idx) => (
                        <li key={item.id}>
                            <Link
                                href={`${hrefBase}/${item.id}`}
                                className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_12px_rgba(10,26,63,0.04)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_10px_24px_rgba(10,26,63,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                            >
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-brand'
                                        }`}
                                >
                                    {idx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[15px] font-semibold text-ink group-hover:text-brand">
                                        {item.name}
                                    </p>
                                    <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-slate-500">
                                        <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                        <span className="truncate">{item.place}</span>
                                    </p>
                                </div>
                                <span
                                    title={favoriteLabel(item.favoriteCount)}
                                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium tabular-nums text-slate-400 transition-colors group-hover:text-rose-500"
                                >
                                    <Heart aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
                                    {item.favoriteCount}
                                    <span className="sr-only">— {favoriteLabel(item.favoriteCount)}</span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 px-6 text-sm text-slate-500 text-center">
            No favorites yet — be the first to add a scholarship or university to your
            favorites and put it on the map.
        </p>
    );
}

export default function TopRankingsSection({
    topUniversities,
    topScholarships,
    variant,
}: TopRankingsSectionProps) {
    const limit = variant === 'teaser' ? 4 : topUniversities.length;
    const scholarshipLimit = variant === 'teaser' ? 4 : topScholarships.length;
    const universities = topUniversities.slice(0, limit);
    const scholarships = topScholarships.slice(0, scholarshipLimit);
    const isEmpty = universities.length === 0 && scholarships.length === 0;

    return (
        <div className="w-full font-body">
            {variant === 'teaser' && (
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Trending now</p>
                        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                            Most Favorited Right Now
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            Universities and scholarships students are saving the most
                        </p>
                    </div>
                    <Link
                        href="/top"
                        className="inline-flex items-center gap-1 self-start whitespace-nowrap rounded-[10px] px-3 py-2 -mx-3 text-sm font-semibold text-brand transition-colors hover:bg-blue-50 sm:self-auto"
                    >
                        See full ranking →
                    </Link>
                </div>
            )}

            {isEmpty ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
                    <RankedList
                        title="Top Universities"
                        icon={GraduationCap}
                        hrefBase="/universities"
                        items={universities.map((uni) => ({
                            id: uni.id,
                            name: uni.name,
                            place: uni.location,
                            favoriteCount: uni.favoriteCount,
                        }))}
                    />
                    <RankedList
                        title="Top Scholarships"
                        icon={Award}
                        hrefBase="/scholarships"
                        items={scholarships.map((sch) => ({
                            id: sch.id,
                            name: sch.name,
                            place: sch.country,
                            favoriteCount: sch.favoriteCount,
                        }))}
                    />
                </div>
            )}
        </div>
    );
}
