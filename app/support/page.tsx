import type { Metadata } from 'next';
import Navbar from '@/components/main/Navbar';
import Footer from '@/components/main/Footer';
import { HeartHandshake, Zap, MessageSquare, Sparkles } from 'lucide-react';

// Set this to your real DonationAlerts username (donationalerts.com/r/<username>)
// once the account exists. Left empty on purpose — a guessed username could
// resolve to a stranger's real donation page and misdirect real money, so the
// button stays disabled until this is filled in for real.
const DONATIONALERTS_USERNAME = '';
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
        title: 'More AI messages per day',
        description: 'Every student gets a small daily AI quota — your support raises that ceiling for everyone.',
    },
    {
        icon: Zap,
        title: 'Faster, higher-capacity model tier',
        description: 'Upgrading our AI provider plan means fewer "please slow down" messages during busy hours.',
    },
    {
        icon: Sparkles,
        title: 'New AI features',
        description: 'Essay feedback, deeper eligibility checks, and more — the AI budget is what unlocks these.',
    },
];

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1">
                <section className="bg-brand text-white relative pt-16 pb-24 px-4 sm:px-6 overflow-hidden">
                    <div
                        aria-hidden="true"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[150px] sm:h-[250px] bg-blue-400/20 blur-[120px] pointer-events-none rounded-full"
                    />

                    <div className="max-w-2xl mx-auto flex flex-col items-center text-center relative z-10">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                            <HeartHandshake className="h-7 w-7" />
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">
                            Support ScholarizePath, keep the AI running
                        </h1>

                        <p className="mt-4 text-blue-100/80 text-sm sm:text-base max-w-lg leading-relaxed">
                            Our AI assistant runs on a shared usage budget. It&apos;s enough for a steady stream of
                            students today, but every donation goes straight toward upgrading it so more people can
                            get AI-powered guidance without hitting a limit.
                        </p>

                        {DONATIONALERTS_URL ? (
                            <a
                                href={DONATIONALERTS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-amber-400 px-6 py-3.5 text-sm sm:text-base font-bold text-slate-900 shadow-lg shadow-black/10 hover:bg-amber-300 transition-colors"
                            >
                                <HeartHandshake className="h-5 w-5" />
                                Donate via DonationAlerts
                            </a>
                        ) : (
                            <div className="mt-8 inline-flex items-center gap-2.5 rounded-xl bg-white/10 px-6 py-3.5 text-sm sm:text-base font-bold text-white/60 cursor-not-allowed">
                                <HeartHandshake className="h-5 w-5" />
                                Donations opening soon
                            </div>
                        )}
                    </div>
                </section>

                <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 pb-20 relative z-20 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        {FUNDED_BY_YOU.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>

                    <p className="mt-10 text-center text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        ScholarizePath is student-run and self-funded. Every contribution — big or small — goes
                        directly toward keeping the AI assistant free and available for students who need it.
                    </p>
                </section>
            </main>

            <Footer />
        </div>
    );
}
