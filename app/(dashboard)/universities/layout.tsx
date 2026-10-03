import type { Metadata } from 'next';
import { getI18n } from '@/i18n/server';

// The list page is a client component, so its metadata lives here.
// University pages under [id] set their own.
export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();
    return {
        title: t.seo.universitiesTitle,
        description: t.seo.universitiesDescription,
        // Public catalogue — overrides the dashboard layout's noindex.
        robots: { index: true, follow: true },
        alternates: { canonical: '/universities' },
        openGraph: {
            title: t.seo.universitiesTitle,
            description: t.seo.universitiesDescription,
            url: '/universities',
            siteName: 'ScholarizePath',
            type: 'website',
        },
    };
}

export default function UniversitiesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
