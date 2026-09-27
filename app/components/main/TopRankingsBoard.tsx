'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Award, Building2, ChevronRight, Heart, Trophy, type LucideIcon } from 'lucide-react';
import { flagFor } from '@/components/profile/countryList';
import { monogram } from '@/components/common/detailUi';

interface RankedUniversity { id: string; name: string; location: string; favoriteCount: number }
interface RankedScholarship { id: string; name: string; country: string; favoriteCount: number }
interface Item { id: string; name: string; place: string; country: string; count: number; href: string }

const MEDALS = [
    { label: '#1', badge: 'bg-amber-100 text-amber-800', ring: 'ring-amber-300', tile: 'from-amber-400 to-amber-600' },
    { label: '#2', badge: 'bg-slate-100 text-slate-700', ring: 'ring-slate-200', tile: 'from-slate-400 to-slate-600' },
    { label: '#3', badge: 'bg-orange-100 text-orange-800', ring: 'ring-orange-200', tile: 'from-orange-400 to-orange-700' },
];

const saves = (n: number) => `${n.toLocaleString('en-US')} save${n === 1 ? '' : 's'}`;

function PodiumCard({ item, place, top }: { item: Item; place: number; top: number }) {
    const medal = MEDALS[place];
    return (
        <Link
            href={item.href}
            className={`group flex w-[78vw] max-w-[300px] shrink-0 snap-center flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(10,26,63,0.05)] ring-2 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(10,26,63,0.10)] md:w-full md:max-w-none md:shrink ${medal.ring} ${place === 0 ? 'md:-mt-4 md:pb-7' : ''}`}
        >
            <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${medal.badge}`}>
                <Trophy aria-hidden="true" className="h-3.5 w-3.5" /> {medal.label}
            </span>
            <div className="mt-4 flex items-center gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-display text-sm font-bold text-white ${medal.tile}`}>{monogram(item.name)}</span>
                <div className="min-w-0">
                    <p className="line-clamp-2 font-display text-base font-bold leading-snug text-ink group-hover:text-brand">{item.name}</p>
                    {item.place && <p className="truncate text-xs text-slate-500">{flagFor(item.country)} {item.place}</p>}
                </div>
            </div>
            <div className="mt-5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-600"><Heart aria-hidden="true" className="h-4 w-4 fill-rose-500" /> {saves(item.count)}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.round((item.count / top) * 100)}%` }} /></div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">View details <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
        </Link>
    );
}

export default function TopRankingsBoard({ topUniversities, topScholarships }: {
    topUniversities: RankedUniversity[];
    topScholarships: RankedScholarship[];
}) {
    const [tab, setTab] = useState<'universities' | 'scholarships'>('universities');

    const items: Item[] = tab === 'universities'
        ? topUniversities.map((u) => ({ id: u.id, name: u.name, place: u.location, country: u.location.split(',').pop()?.trim() ?? '', count: u.favoriteCount, href: `/universities/${u.id}` }))
        : topScholarships.map((s) => ({ id: s.id, name: s.name, place: s.country, country: s.country, count: s.favoriteCount, href: `/scholarships/${s.id}` }));
    const top = items[0]?.count || 1;
    const podium = items.slice(0, 3);
    const rest = items.slice(3);
    // Desktop podium reads 2 · 1 · 3.
    const desktopOrder = podium.length === 3 ? ['md:order-2', 'md:order-1', 'md:order-3'] : ['', '', ''];

    const tabs: [typeof tab, string, LucideIcon][] = [['universities', 'Universities', Building2], ['scholarships', 'Scholarships', Award]];

    return (
        <div>
            <div className="sticky top-16 z-20 -mx-4 mb-8 flex justify-center bg-[#f7f9fc]/90 px-4 py-2 backdrop-blur md:static md:bg-transparent md:backdrop-blur-none">
                <div role="tablist" aria-label="Ranking type" className="grid w-full max-w-sm grid-cols-2 gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200/80">
                    {tabs.map(([t, label, Icon]) => (
                        <button
                            key={t}
                            type="button"
                            role="tab"
                            aria-selected={tab === t}
                            onClick={() => setTab(t)}
                            className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${tab === t ? 'bg-brand text-white' : 'text-slate-500 hover:text-ink'}`}
                        >
                            <Icon aria-hidden="true" className="h-4 w-4" /> {label}
                        </button>
                    ))}
                </div>
            </div>

            {items.length === 0 ? (
                <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-slate-200/80 bg-white px-6 py-14 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500"><Heart aria-hidden="true" className="h-6 w-6" /></span>
                    <h2 className="mt-4 font-display text-lg font-bold text-ink">Not enough activity yet</h2>
                    <p className="mt-1 text-sm text-slate-500">Rankings appear once students start saving {tab}.</p>
                </div>
            ) : (
                <>
                    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:items-end md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
                        {podium.map((item, i) => (
                            <div key={item.id} className={`flex shrink-0 md:min-w-0 md:shrink ${desktopOrder[i]}`}>
                                <PodiumCard item={item} place={i} top={top} />
                            </div>
                        ))}
                    </div>

                    {rest.length > 0 && (
                        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_12px_rgba(10,26,63,0.04)]">
                            <div className="hidden grid-cols-[64px_minmax(0,1fr)_minmax(0,280px)_40px] gap-4 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid">
                                <span>Rank</span><span>{tab === 'universities' ? 'University' : 'Scholarship'}</span><span>Saves</span><span />
                            </div>
                            <ol className="divide-y divide-slate-100">
                                {rest.map((item, i) => (
                                    <li key={item.id}>
                                        <Link href={item.href} className="group grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-blue-50/40 md:grid-cols-[64px_minmax(0,1fr)_minmax(0,280px)_40px] md:gap-4 md:px-5">
                                            <span className="font-display text-lg font-bold text-slate-400">{String(i + 4).padStart(2, '0')}</span>
                                            <span className="flex min-w-0 items-center gap-3">
                                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${tab === 'universities' ? 'bg-blue-50 text-brand' : 'bg-violet-50 text-violet-700'}`}>{monogram(item.name)}</span>
                                                <span className="min-w-0">
                                                    <span className="line-clamp-2 text-sm font-semibold text-ink group-hover:text-brand md:line-clamp-1">{item.name}</span>
                                                    {item.place && <span className="block truncate text-xs text-slate-500">{flagFor(item.country)} {item.place}</span>}
                                                </span>
                                            </span>
                                            <span className="flex items-center gap-3">
                                                <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-rose-600 md:w-16 md:shrink-0"><Heart aria-hidden="true" className="h-3.5 w-3.5 fill-rose-500" /> {item.count.toLocaleString('en-US')}</span>
                                                <span className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 md:block"><span className="block h-full rounded-full bg-brand/70" style={{ width: `${Math.round((item.count / top) * 100)}%` }} /></span>
                                            </span>
                                            <ChevronRight aria-hidden="true" className="hidden h-5 w-5 text-slate-300 group-hover:text-brand md:block" />
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
