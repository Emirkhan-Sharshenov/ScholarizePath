import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import Navbar from '@/components/main/Navbar';
import Footer from '@/components/main/Footer';
import TopRankingsBoard from '@/components/main/TopRankingsBoard';
import { getTopStats } from '@/services/stats.service';

export const revalidate = 3600;

export const metadata: Metadata = {
    title: 'Top Universities & Scholarships | ScholarizePath',
    description:
        'See which universities and scholarships students are favoriting the most on ScholarizePath, ranked by real student activity.',
    alternates: {
        canonical: '/top',
    },
    openGraph: {
        title: 'Top Universities & Scholarships | ScholarizePath',
        description:
            'Ranked by real student favorites — see the most popular universities and scholarships on ScholarizePath.',
        url: '/top',
        siteName: 'ScholarizePath',
        type: 'website',
    },
};

export default async function TopRankingsPage() {
    const { topUniversities, topScholarships } = await getTopStats(20);

    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Top Universities on ScholarizePath',
        itemListElement: topUniversities.map((uni, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: uni.name,
            url: `https://scholarizepath.xyz/universities/${uni.id}`,
        })),
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] font-body">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />

            <Navbar />

            <main className="flex-1">
                <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
                    <div className="mb-8 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand">
                            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Community picks
                        </span>
                        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
                            Most saved universities &amp; scholarships
                        </h1>
                        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
                            Ranked by how many students saved them on ScholarizePath · updated hourly
                        </p>
                    </div>

                    <TopRankingsBoard topUniversities={topUniversities} topScholarships={topScholarships} />

                    <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-navy px-6 py-10 text-white sm:px-10 sm:py-12">
                        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/25 blur-3xl" />
                        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="max-w-xl">
                                <h2 className="font-display text-2xl font-bold sm:text-3xl">Save your own shortlist</h2>
                                <p className="mt-2 text-blue-100/90">Create a free account to save universities and scholarships, compare them side by side and track your applications.</p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 font-semibold text-brand transition hover:bg-blue-50">Get started</Link>
                                <Link href="/universities" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 px-6 font-semibold text-white transition hover:bg-white/10">Explore universities</Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
