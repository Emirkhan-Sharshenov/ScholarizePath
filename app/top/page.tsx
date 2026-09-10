import type { Metadata } from 'next';
import Navbar from '@/components/main/Navbar';
import Footer from '@/components/main/Footer';
import TopRankingsSection from '@/components/main/TopRankingsSection';
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
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />

            <Navbar />

            <main className="flex flex-col flex-1">
                <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 text-center">
                        Most Favorited Universities & Scholarships
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-slate-500 text-center max-w-2xl mx-auto">
                        Ranked by how many students have added them to their favorites on
                        ScholarizePath — updated hourly.
                    </p>

                    <div className="mt-10">
                        <TopRankingsSection
                            topUniversities={topUniversities}
                            topScholarships={topScholarships}
                            variant="full"
                        />
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
