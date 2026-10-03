import type { Metadata } from 'next';
import { getI18n } from '@/i18n/server';

// The list page is a client component, so its metadata lives here.
// Scholarship pages under [id] set their own.
export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();
    return {
        title: t.seo.scholarshipsTitle,
        description: t.seo.scholarshipsDescription,
        // Public catalogue — overrides the dashboard layout's noindex.
        robots: { index: true, follow: true },
        alternates: { canonical: '/scholarships' },
        openGraph: {
            title: t.seo.scholarshipsTitle,
            description: t.seo.scholarshipsDescription,
            url: '/scholarships',
            siteName: 'ScholarizePath',
            type: 'website',
        },
    };
}

export default function ScholarshipsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
