import Link from 'next/link';

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

function EmptyState() {
    return (
        <p className="text-sm text-slate-500 py-6 text-center">
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
        <div className="w-full">
            {variant === 'teaser' && (
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Most Favorited Right Now</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Universities and scholarships students are saving the most
                        </p>
                    </div>
                    <Link
                        href="/top"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    >
                        See full ranking →
                    </Link>
                </div>
            )}

            {isEmpty ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Top Universities</h3>
                        {universities.length === 0 ? (
                            <p className="text-xs text-slate-500">No favorites yet.</p>
                        ) : (
                            <ol className="space-y-3">
                                {universities.map((uni, idx) => (
                                    <li
                                        key={uni.id}
                                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <Link href={`/universities/${uni.id}`} className="flex items-start gap-3">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{uni.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{uni.location}</p>
                                                <p className="text-[11px] font-medium text-rose-500 mt-1">
                                                    ❤ {favoriteLabel(uni.favoriteCount)}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Top Scholarships</h3>
                        {scholarships.length === 0 ? (
                            <p className="text-xs text-slate-500">No favorites yet.</p>
                        ) : (
                            <ol className="space-y-3">
                                {scholarships.map((sch, idx) => (
                                    <li
                                        key={sch.id}
                                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <Link href={`/scholarships/${sch.id}`} className="flex items-start gap-3">
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{sch.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{sch.country}</p>
                                                <p className="text-[11px] font-medium text-rose-500 mt-1">
                                                    ❤ {favoriteLabel(sch.favoriteCount)}
                                                </p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
