import React, { cache } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ScholarshipDetailsPage from '@/components/scholarships/id/ScholarshipDetailsPage';
import { Scholarship } from '@/types/scholarship';
import { getBaseUrl } from '@/lib/getBaseUrl';
import { formatAmount, getDeadlineInfo } from '@/lib/scholarshipDisplay';
import { getI18n } from '@/i18n/server';
import { formatDate, intlLocale } from '@/i18n/format';
import { localizeCountry } from '@/i18n/countries';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Cached per request: metadata and the page share one fetch.
const getScholarship = cache(async (id: string): Promise<Scholarship | null> => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        const res = await fetch(`${getBaseUrl()}/api/scholarships/${encodeURIComponent(id)}`, {
            cache: 'no-store',
            headers: {
                ...(token ? { Cookie: `token=${token}` } : {}),
            },
        });

        if (!res.ok) {
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error('Failed to fetch scholarship:', error);
        return null;
    }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const [scholarship, { t, locale }] = await Promise.all([getScholarship(id), getI18n()]);

    if (!scholarship) {
        return { title: t.seo.notFound, robots: { index: false } };
    }

    const levels = Array.isArray(scholarship.studyLevel) ? scholarship.studyLevel : [scholarship.studyLevel].filter(Boolean);
    const deadline = getDeadlineInfo(scholarship.deadlines);
    const value = scholarship.award?.estimatedValue;
    const top = value?.max ?? value?.min;
    const money = (v: number) => formatAmount(v, value?.currency, intlLocale(locale));

    const title = t.seo.scholarshipTitle(scholarship.scholarshipName);
    const description = t.seo.scholarshipDescription({
        name: scholarship.scholarshipName,
        fullyFunded: /fully/i.test(scholarship.award?.type ?? ''),
        country: localizeCountry(scholarship.country, locale),
        level: levels.slice(0, 2).map((l) => t.scholarships.studyLevels[l] ?? l).join(', '),
        deadline: deadline.date && !deadline.passed ? formatDate(locale, deadline.date, { day: 'numeric', month: 'long', year: 'numeric' }) : '',
        amount: top ? (value?.min && value?.max && value.min !== value.max ? `${money(value.min)} – ${money(value.max)}` : money(top)) : '',
    });
    const url = `/scholarships/${id}`;

    return {
        title,
        description,
        // The dashboard layout is noindex; this page is public and meant to be found.
        robots: { index: true, follow: true },
        alternates: { canonical: url },
        openGraph: { title, description, url, siteName: 'ScholarizePath', type: 'article' },
    };
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const scholarship = await getScholarship(id);

    if (!scholarship) {
        notFound();
    }

    return <ScholarshipDetailsPage scholarship={scholarship} />;
}
