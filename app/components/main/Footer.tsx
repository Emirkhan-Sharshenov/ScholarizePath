import { Mail } from 'lucide-react';


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

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-8 sm:py-10 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
                <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                    Contact
                </h2>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                    <a
                        href="https://instagram.com/emirit_kg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        <InstagramIcon aria-hidden="true" className="w-4 h-4" />
                        @emirit_kg
                    </a>

                    <a
                        href="mailto:sgoo0931@gmail.com"
                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    >
                        <Mail aria-hidden="true" className="w-4 h-4" />
                        sgoo0931@gmail.com
                    </a>
                </div>

                <p className="text-xs text-slate-400 mt-2">
                    &copy; {new Date().getFullYear()} ScholarizePath. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

