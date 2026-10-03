import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/main/Navbar';
import Footer from '@/components/main/Footer';
import CopyLinkButton from '@/components/main/CopyLinkButton';
import { getI18n } from '@/i18n/server';
import { ArrowRight, ArrowUpRight, Bug, Heart, HeartHandshake, Lock, MessageSquare, Share2, Sparkles, Trophy, Zap } from 'lucide-react';

const DONATIONALERTS_USERNAME = 'scholarizepath';
const DONATIONALERTS_URL = DONATIONALERTS_USERNAME
    ? `https://www.donationalerts.com/r/${DONATIONALERTS_USERNAME}`
    : null;

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getI18n();
    return {
        title: t.site.support.metaTitle,
        description: t.site.support.metaDescription,
        alternates: {
            canonical: '/support',
        },
    };
}

// Icon and colour per "What your support funds" card; the copy comes from the
// `site.support.funded` messages, in the same order.
const FUNDED_STYLE = [
    { icon: MessageSquare, tone: 'bg-blue-50 text-brand' },
    { icon: Zap, tone: 'bg-amber-50 text-amber-600' },
    { icon: Sparkles, tone: 'bg-violet-50 text-violet-600' },
];

const card = 'flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_12px_rgba(10,26,63,0.04)]';
const secondaryButton = 'mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-semibold text-ink transition-colors hover:bg-slate-200';

export default async function SupportPage() {
    const { t } = await getI18n();
    const s = t.site.support;

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fc] font-body">
            <Navbar />

            <main className="flex-1">
                <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
                    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-[#0a4fa8] to-navy px-6 py-14 text-center text-white shadow-[0_24px_48px_rgba(0,88,189,0.25)] sm:px-10 sm:py-20">
                        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/25 blur-[120px]" />
                        <div className="relative mx-auto flex max-w-2xl flex-col items-center">
                            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                                <HeartHandshake aria-hidden="true" className="h-7 w-7" />
                            </span>
                            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                                {s.heroTitle}
                            </h1>
                            <p className="mt-4 max-w-xl text-base leading-relaxed text-blue-100/90 sm:text-lg">
                                {s.heroLead}
                            </p>
                            {DONATIONALERTS_URL ? (
                                <>
                                    <a
                                        href={DONATIONALERTS_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 font-semibold text-brand shadow-lg shadow-black/10 transition hover:bg-blue-50 sm:w-auto"
                                    >
                                        {s.donate} <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                                    </a>
                                    <p className="mt-3 text-xs text-blue-100/70">{s.opensNewTab}</p>
                                </>
                            ) : (
                                <span className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white/10 px-6 font-semibold text-white/70">
                                    <Lock aria-hidden="true" className="h-4 w-4" /> {s.soon}
                                </span>
                            )}
                        </div>
                    </section>
                </div>

                <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">{s.whereEyebrow}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{s.whereTitle}</h2>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                        {s.funded.map(({ title, description }, i) => {
                            const { icon: Icon, tone } = FUNDED_STYLE[i];
                            return (
                            <div key={title} className={card}>
                                <span className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
                                <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
                            </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">{s.involvedEyebrow}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{s.involvedTitle}</h2>
                    <p className="mt-2 text-slate-500">{s.involvedLead}</p>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                        <div className={card}>
                            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Share2 aria-hidden="true" className="h-5 w-5" /></span>
                            <h3 className="font-display text-lg font-bold text-ink">{s.shareTitle}</h3>
                            <p className="mb-6 mt-1.5 text-sm leading-relaxed text-slate-500">{s.shareText}</p>
                            <CopyLinkButton className={secondaryButton} />
                        </div>
                        <div className={card}>
                            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Bug aria-hidden="true" className="h-5 w-5" /></span>
                            <h3 className="font-display text-lg font-bold text-ink">{s.bugTitle}</h3>
                            <p className="mb-6 mt-1.5 text-sm leading-relaxed text-slate-500">{s.bugText}</p>
                            <Link href="/suggestions" className={secondaryButton}>
                                {s.sendFeedback} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className={card}>
                            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand"><Heart aria-hidden="true" className="h-5 w-5" /></span>
                            <h3 className="font-display text-lg font-bold text-ink">{s.saveTitle}</h3>
                            <p className="mb-6 mt-1.5 text-sm leading-relaxed text-slate-500">{s.saveText}</p>
                            <Link href="/top" className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white transition hover:bg-[#004a9f]">
                                <Trophy aria-hidden="true" className="h-4 w-4" /> {s.seeTop}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
