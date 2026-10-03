import Link from 'next/link';
import { Award, GraduationCap, Heart, MapPin, type LucideIcon } from 'lucide-react';
import { getI18n } from '@/i18n/server';
import type { Messages } from '@/i18n/messages';

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
    t,
}: {
    title: string;
    icon: LucideIcon;
    items: RankedItem[];
    hrefBase: string;
    t: Messages;
}) {
    return (
        <div className="min-w-0">
            <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-ink">
                <Icon aria-hidden="true" className="h-[18px] w-[18px] text-brand" />
                {title}
            </h3>
            {items.length === 0 ? (
                <p className="text-sm text-slate-500">{t.home.teaser.noFavorites}</p>
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
                                    title={t.common.favoritedBy(item.favoriteCount)}
                                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium tabular-nums text-slate-400 transition-colors group-hover:text-rose-500"
                                >
                                    <Heart aria-hidden="true" className="h-4 w-4 stroke-[1.75]" />
                                    {item.favoriteCount}
                                    <span className="sr-only">— {t.common.favoritedBy(item.favoriteCount)}</span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

function EmptyState({ t }: { t: Messages }) {
    return (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 px-6 text-sm text-slate-500 text-center">
            {t.home.teaser.empty}
        </p>
    );
}

export default async function TopRankingsSection({
    topUniversities,
    topScholarships,
    variant,
}: TopRankingsSectionProps) {
    const { t } = await getI18n();
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
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand">{t.home.teaser.eyebrow}</p>
                        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                            {t.home.teaser.title}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            {t.home.teaser.lead}
                        </p>
                    </div>
                    <Link
                        href="/top"
                        className="inline-flex items-center gap-1 self-start whitespace-nowrap rounded-[10px] px-3 py-2 -mx-3 text-sm font-semibold text-brand transition-colors hover:bg-blue-50 sm:self-auto"
                    >
                        {t.home.teaser.seeAll}
                    </Link>
                </div>
            )}

            {isEmpty ? (
                <EmptyState t={t} />
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
                    <RankedList
                        title={t.home.teaser.topUniversities}
                        t={t}
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
                        title={t.home.teaser.topScholarships}
                        t={t}
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
