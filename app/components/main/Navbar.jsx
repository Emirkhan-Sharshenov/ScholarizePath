import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav
            aria-label="Main navigation"
            className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-16 sm:h-20 bg-white border-b border-gray-100"
        >
            <Link href="/" className="relative h-9 sm:h-12 w-auto min-w-[140px] sm:min-w-[200px] flex items-center justify-start">
                <Image
                    src="/images/logo.png"
                    alt="ScholarizePath Logo"
                    width={240}
                    height={48}
                    className="h-9 sm:h-12 w-auto object-contain"
                    priority
                />
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
                <Link
                    href="/login"
                    className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-block"
                >
                    Sign In
                </Link>
                <Link
                    href="/login"
                    style={{ backgroundColor: 'rgb(0, 88, 189)' }}
                    className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity inline-block"
                >
                    Sign Up
                </Link>
            </div>
        </nav>
    );
}