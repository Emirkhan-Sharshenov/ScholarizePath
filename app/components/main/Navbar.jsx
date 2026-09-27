import Link from 'next/link';
import BrandLogo from '@/components/brand/BrandLogo';
import { Trophy } from 'lucide-react';

export default function Navbar() {
    return (
        <nav
            aria-label="Main navigation"
            className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md font-body"
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
                <Link href="/" className="flex shrink-0 items-center" aria-label="ScholarizePath home">
                    <BrandLogo decorative className="text-[15px] min-[400px]:text-[17px] sm:text-[20px]" taglineClassName="max-[399px]:hidden" />
                </Link>

                <div className="flex items-center gap-1.5 sm:gap-3">
                    <Link
                        href="/top"
                        aria-label="Rankings"
                        className="inline-flex h-10 items-center gap-2 rounded-[10px] px-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink sm:px-3"
                    >
                        <Trophy aria-hidden="true" className="h-[18px] w-[18px] sm:hidden" />
                        <span className="hidden sm:inline">Rankings</span>
                    </Link>
                    <Link
                        href="/login"
                        className="inline-flex h-10 items-center whitespace-nowrap rounded-[10px] px-2.5 text-sm font-medium text-ink transition-colors hover:bg-slate-100 sm:px-4"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/login?mode=register"
                        className="inline-flex h-10 items-center whitespace-nowrap rounded-[10px] bg-brand px-3.5 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition-all hover:bg-[#004a9f] active:scale-[0.98] sm:px-5"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </nav>
    );
}
