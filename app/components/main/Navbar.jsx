import Link from 'next/link';
import BrandLogo from '@/components/brand/BrandLogo';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';
import { getI18n } from '@/i18n/server';
import { Trophy } from 'lucide-react';

export default async function Navbar() {
    const { t } = await getI18n();

    return (
        <nav
            aria-label={t.nav.mainNavigation}
            className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md font-body"
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-[72px] sm:gap-3 sm:px-6 lg:px-8">
                <Link href="/" className="flex min-w-0 shrink items-center" aria-label={t.nav.homeLabel}>
                    <BrandLogo decorative className="text-[15px] min-[400px]:text-[17px] sm:text-[20px]" taglineClassName="max-[459px]:hidden" nameClassName="max-[419px]:hidden" />
                </Link>

                <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                    <LanguageSwitcher className="mr-0.5 sm:mr-0" />
                    {/* The catalogue is public; on phones the links are in the footer. */}
                    {[
                        { href: '/scholarships', label: t.nav.items.scholarships.label },
                        { href: '/universities', label: t.nav.items.universities.label },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="hidden h-10 items-center rounded-[10px] px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink lg:inline-flex"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/top"
                        aria-label={t.nav.rankings}
                        className="inline-flex h-10 items-center gap-2 rounded-[10px] px-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink sm:px-3"
                    >
                        <Trophy aria-hidden="true" className="h-[18px] w-[18px] lg:hidden" />
                        <span className="hidden lg:inline">{t.nav.rankings}</span>
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex h-10 items-center whitespace-nowrap rounded-[10px] px-2 text-sm font-medium text-ink transition-colors hover:bg-slate-100 sm:px-4"
                    >
                        {t.nav.signIn}
                    </Link>
                    <Link
                        href="/login?mode=register"
                        className="inline-flex h-10 items-center whitespace-nowrap rounded-[10px] bg-brand px-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition-all hover:bg-[#004a9f] active:scale-[0.98] sm:px-5"
                    >
                        {t.nav.signUp}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
