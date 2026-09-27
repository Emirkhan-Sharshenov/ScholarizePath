import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/main/Navbar';
import Footer from '@/components/main/Footer';
import CopyLinkButton from '@/components/main/CopyLinkButton';
import { ArrowRight, ArrowUpRight, Bug, Heart, HeartHandshake, Lock, MessageSquare, Share2, Sparkles, Trophy, Zap } from 'lucide-react';

const DONATIONALERTS_USERNAME = 'scholarizepath';
const DONATIONALERTS_URL = DONATIONALERTS_USERNAME
    ? `https://www.donationalerts.com/r/${DONATIONALERTS_USERNAME}`
    : null;

export const metadata: Metadata = {
    title: 'Support ScholarizePath',
    description:
        'Help fund a bigger AI budget for ScholarizePath so more students can get AI-powered university and scholarship guidance every day.',
    alternates: {
        canonical: '/support',
    },
};

const FUNDED_BY_YOU = [
    {
        icon: MessageSquare,
        tone: 'bg-blue-50 text-brand',
        title: 'More AI messages per day',
        description: 'Every student gets a small daily AI quota — your support raises that ceiling for everyone.',
    },
    {
        icon: Zap,
        tone: 'bg-amber-50 text-amber-600',
        title: 'Faster, higher-capacity model',
        description: 'Upgrading our AI provider plan means fewer "please slow down" messages during busy hours.',
    },
    {
        icon: Sparkles,
        tone: 'bg-violet-50 text-violet-600',
        title: 'New AI features',
        description: 'Essay feedback, deeper eligibility checks, and more — the AI budget is what unlocks these.',
    },
];

const card = 'flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_12px_rgba(10,26,63,0.04)]';
const secondaryButton = 'mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-semibold text-ink transition-colors hover:bg-slate-200';

export default function SupportPage() {
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
                                Help more students get AI guidance
                            </h1>
                            <p className="mt-4 max-w-xl text-base leading-relaxed text-blue-100/90 sm:text-lg">
                                ScholarizePath is student-run and self-funded. Donations go straight into the AI budget so every student gets more help each day.
                            </p>
                            {DONATIONALERTS_URL ? (
                                <>
                                    <a
                                        href={DONATIONALERTS_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 font-semibold text-brand shadow-lg shadow-black/10 transition hover:bg-blue-50 sm:w-auto"
                                    >
                                        Donate via DonationAlerts <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                                    </a>
                                    <p className="mt-3 text-xs text-blue-100/70">Opens DonationAlerts in a new tab</p>
                                </>
                            ) : (
                                <span className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white/10 px-6 font-semibold text-white/70">
                                    <Lock aria-hidden="true" className="h-4 w-4" /> Donations opening soon
                                </span>
                            )}
                        </div>
                    </section>
                </div>

                <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">Where it goes</p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">What your support funds</h2>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                        {FUNDED_BY_YOU.map(({ icon: Icon, tone, title, description }) => (
                            <div key={title} className={card}>
                                <span className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
                                <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand">Get involved</p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">Other ways to help</h2>
                    <p className="mt-2 text-slate-500">Money isn&apos;t the only way to make a difference.</p>
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                        <div className={card}>
                            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Share2 aria-hidden="true" className="h-5 w-5" /></span>
                            <h3 className="font-display text-lg font-bold text-ink">Share with a friend</h3>
                            <p className="mb-6 mt-1.5 text-sm leading-relaxed text-slate-500">Know someone looking for a university or scholarship? Send them the link.</p>
                            <CopyLinkButton className={secondaryButton} />
                        </div>
                        <div className={card}>
                            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Bug aria-hidden="true" className="h-5 w-5" /></span>
                            <h3 className="font-display text-lg font-bold text-ink">Report a bug or suggest a feature</h3>
                            <p className="mb-6 mt-1.5 text-sm leading-relaxed text-slate-500">Spotted wrong tuition, an outdated deadline or have an idea? Tell us.</p>
                            <Link href="/suggestions" className={secondaryButton}>
                                Send feedback <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className={card}>
                            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand"><Heart aria-hidden="true" className="h-5 w-5" /></span>
                            <h3 className="font-display text-lg font-bold text-ink">Save and explore</h3>
                            <p className="mb-6 mt-1.5 text-sm leading-relaxed text-slate-500">Every university and scholarship you save helps shape the community Top rankings.</p>
                            <Link href="/top" className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white transition hover:bg-[#004a9f]">
                                <Trophy aria-hidden="true" className="h-4 w-4" /> See Top rankings
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
