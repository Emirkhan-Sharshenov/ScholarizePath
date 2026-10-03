import { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import UniversityDetailsPage from '@/components/universities/id/UniversityDetailsPage';
import { getBaseUrl } from '@/lib/getBaseUrl';
import { formatAmount } from '@/lib/scholarshipDisplay';
import { getI18n } from '@/i18n/server';
import { intlLocale } from '@/i18n/format';
import { localizeLocation } from '@/i18n/countries';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Cached per request: metadata and the page share one fetch.
const getUniversity = cache(async (id: string) => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        const res = await fetch(`${getBaseUrl()}/api/universities/${encodeURIComponent(id)}`, {
            cache: 'no-store',
            headers: {
                ...(token ? { Cookie: `token=${token}` } : {}),
            },
        });

        if (!res.ok) {
            console.error(`Failed to fetch university: ${res.statusText}`);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error('Error fetching university:', error);
        return null;
    }
});

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Lowest yearly tuition on file across degree levels; free (0) doesn't count as "from". */
function lowestTuition(university: any): number | null {
    const values = ['bachelor', 'master', 'phd'].map((l) => num(university?.tuition?.[l])).filter((v): v is number => v !== null && v > 0);
    return values.length ? Math.min(...values) : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const [university, { t, locale }] = await Promise.all([getUniversity(id), getI18n()]);

    if (!university?.name) {
        return { title: t.seo.notFound, robots: { index: false } };
    }

    const tuition = lowestTuition(university);
    const title = t.seo.universityTitle(university.name);
    const description = t.seo.universityDescription({
        name: university.name,
        location: localizeLocation([university.location?.city, university.location?.country].filter(Boolean).join(', '), locale),
        worldRank: num(university.ranking?.global),
        tuition: tuition !== null ? formatAmount(tuition, university.tuition?.currency, intlLocale(locale)) : '',
    });
    const url = `/universities/${id}`;

    return {
        title,
        description,
        // The dashboard layout is noindex; this page is public and meant to be found.
        robots: { index: true, follow: true },
        alternates: { canonical: url },
        openGraph: { title, description, url, siteName: 'ScholarizePath', type: 'website' },
    };
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const universityData = await getUniversity(id);

    if (!universityData) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollegeOrUniversity',
        name: universityData.name,
        url: `https://scholarizepath.xyz/universities/${id}`,
        ...(universityData.website && { sameAs: [universityData.website] }),
        ...((universityData.location?.city || universityData.location?.country) && {
            address: {
                '@type': 'PostalAddress',
                ...(universityData.location?.city && { addressLocality: universityData.location.city }),
                ...(universityData.location?.country && { addressCountry: universityData.location.country }),
            },
        }),
    };

    return (
        <>
            <script
                type="application/ld+json"
                // `<` escaped so a name can't close the script tag.
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
            />
            <UniversityDetailsPage university={universityData} />
        </>
    );
}
