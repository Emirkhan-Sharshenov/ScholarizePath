import type { Metadata } from 'next';
import Navbar from '@/components/main/Navbar';
import Footer from '@/components/main/Footer';
import { getLocale } from '@/i18n/server';
import PrivacyEn, { metaEn } from './content-en';
import PrivacyRu, { metaRu } from './content-ru';

// Legal text with inline links reads better as a whole page per language than
// as dozens of message keys, so each language has its own body.
const CONTENT = {
    en: { Body: PrivacyEn, meta: metaEn },
    ru: { Body: PrivacyRu, meta: metaRu },
};

export async function generateMetadata(): Promise<Metadata> {
    const { meta } = CONTENT[await getLocale()];
    return {
        title: meta.title,
        description: meta.description,
        alternates: {
            canonical: '/privacy',
        },
    };
}

export default async function PrivacyPage() {
    const { Body } = CONTENT[await getLocale()];

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] font-body">
            <Navbar />

            <main className="flex-1">
                <Body />
            </main>

            <Footer />
        </div>
    );
}
