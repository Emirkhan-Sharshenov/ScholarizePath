import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-8 h-20 bg-white border-b border-gray-100">

            <Link href="/" className="relative h-12 w-auto min-w-[200px] flex items-center justify-start">
                <Image
                    src="/images/logo.png"
                    alt="ScholarizePath Logo"
                    width={240}
                    height={48}
                    className="h-12 w-auto object-contain"
                    priority
                />
            </Link>


            <div className="flex items-center gap-4">
                <Link
                    href="/login"
                    className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-block"
                >
                    Sign In
                </Link>
                <Link
                    href="/login"
                    style={{ backgroundColor: 'rgb(0, 88, 189)' }}
                    className="px-5 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity inline-block"
                >
                    Sign Up
                </Link>
            </div>
        </nav>
    );
}