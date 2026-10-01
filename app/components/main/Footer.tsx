import Link from 'next/link';
import { Mail, HeartHandshake } from 'lucide-react';
import BrandLogo from '@/components/brand/BrandLogo';
import CookieSettingsButton from '@/components/consent/CookieSettingsButton';


function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
}

const exploreLinks = [
    { href: '/top', label: 'Rankings' },
    { href: '/login', label: 'Sign In' },
    { href: '/login?mode=register', label: 'Create account' },
];

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white font-body">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[2fr_1fr_1fr] lg:px-8">
                <div className="max-w-sm">
                    <Link href="/" className="inline-flex">
                        <BrandLogo animated={false} className="text-[19px]" />
                    </Link>
                    <p className="mt-4 text-sm leading-relaxed text-slate-500">
                        Helping students find universities and scholarships worldwide — with
                        data-driven matching and AI support at every step.
                    </p>
                </div>

                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">Explore</h2>
                    <ul className="mt-4 space-y-3">
                        {exploreLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="text-sm text-slate-600 transition-colors hover:text-brand"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">Contact</h2>
                    <ul className="mt-4 space-y-3">
                        <li>
                            <a
                                href="https://instagram.com/emirit_kg"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-brand"
                            >
                                <InstagramIcon aria-hidden="true" className="h-4 w-4" />
                                @emirit_kg
                            </a>
                        </li>
                        <li>
                            <a
                                href="mailto:sgoo0931@gmail.com"
                                className="inline-flex items-center gap-2 break-all text-sm text-slate-600 transition-colors hover:text-brand"
                            >
                                <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
                                sgoo0931@gmail.com
                            </a>
                        </li>
                        <li>
                            <Link
                                href="/support"
                                className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-amber-600"
                            >
                                <HeartHandshake aria-hidden="true" className="h-4 w-4" />
                                Support us
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-100">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 text-xs text-slate-400 sm:px-6 lg:px-8">
                    <p>&copy; {new Date().getFullYear()} ScholarizePath. All rights reserved.</p>
                    <div className="flex gap-5">
                        <Link href="/privacy" className="transition-colors hover:text-brand">
                            Privacy Policy
                        </Link>
                        <CookieSettingsButton className="transition-colors hover:text-brand" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
