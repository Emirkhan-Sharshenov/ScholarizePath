'use client';

import Link from 'next/link';
import { AlertTriangle, BarChart3, Building2, Bug, Compass, GraduationCap, Home, LayoutGrid, RotateCw, Scale, Sparkles } from 'lucide-react';
import BrandLogo from '@/components/brand/BrandLogo';
import { useI18n } from '@/i18n/I18nProvider';

// Standalone 404 / error screens: just the logo on top, one centred card.

function Shell({ children }: { children: React.ReactNode }) {
    const { t } = useI18n();
    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] font-body">
            <header className="flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 sm:px-6">
                <Link href="/" aria-label={t.ui.homeLabel}>
                    <BrandLogo decorative className="text-[16px] sm:text-[18px]" taglineClassName="max-[399px]:hidden" />
                </Link>
                <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-brand">{t.ui.dashboard}</Link>
            </header>
            <main className="flex flex-1 items-center justify-center px-4 py-10">
                <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white px-6 py-12 text-center shadow-[0_16px_40px_rgba(10,26,63,0.06)] sm:px-12">
                    {children}
                </div>
            </main>
        </div>
    );
}

const POPULAR = [
    { href: '/universities', key: 'universities', icon: Building2 },
    { href: '/scholarships', key: 'scholarships', icon: GraduationCap },
    { href: '/aibot', key: 'aibot', icon: Sparkles },
    { href: '/compare', key: 'compare', icon: Scale },
    { href: '/top', key: 'top', icon: BarChart3 },
] as const;

const primary = 'inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004a9f]';
const secondary = 'inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50';

export function NotFoundScreen() {
    const { t } = useI18n();
    return (
        <Shell>
            <div className="relative mx-auto flex h-32 items-center justify-center sm:h-40">
                <span aria-hidden="true" className="select-none font-display text-[7rem] font-extrabold leading-none tracking-tight text-blue-100 sm:text-[9rem]">404</span>
                <span className="absolute flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand shadow-lg shadow-blue-900/10"><Compass aria-hidden="true" className="h-7 w-7" /></span>
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">{t.ui.notFoundTitle}</h1>
            <p className="mx-auto mt-2 max-w-md text-slate-500">{t.ui.notFoundText}</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/dashboard" className={primary}><LayoutGrid aria-hidden="true" className="h-4 w-4" /> {t.ui.goDashboard}</Link>
                <Link href="/" className={secondary}><Home aria-hidden="true" className="h-4 w-4" /> {t.ui.backHome}</Link>
            </div>
            <div className="mt-10 border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t.ui.popularPages}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {POPULAR.map(({ href, key, icon: Icon }) => (
                        <Link key={href} href={href} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-brand">
                            <Icon aria-hidden="true" className="h-4 w-4" /> {t.ui.popular[key]}
                        </Link>
                    ))}
                </div>
                <p className="mt-6 text-xs text-slate-500">{t.ui.brokenLink} <Link href="/suggestions" className="font-semibold text-brand hover:underline">{t.ui.letUsKnow}</Link>.</p>
            </div>
        </Shell>
    );
}

export function ErrorScreen({ digest, onRetry }: { digest?: string; onRetry: () => void }) {
    const { t } = useI18n();
    return (
        <Shell>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle aria-hidden="true" className="h-8 w-8" /></span>
            <h1 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">{t.ui.errorTitle}</h1>
            <p className="mx-auto mt-2 max-w-md text-slate-500">{t.ui.errorText}</p>
            {digest && <p className="mt-4 font-mono text-xs text-slate-400">{t.ui.errorRef(digest)}</p>}
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={onRetry} className={primary}><RotateCw aria-hidden="true" className="h-4 w-4" /> {t.ui.tryAgain}</button>
                <Link href="/" className={secondary}><Home aria-hidden="true" className="h-4 w-4" /> {t.ui.goHome}</Link>
            </div>
            <Link href="/suggestions" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                <Bug aria-hidden="true" className="h-4 w-4" /> {t.ui.reportBug}
            </Link>
        </Shell>
    );
}
