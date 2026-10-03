'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { LOCALES, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALE_NAMES, type Locale } from './config';
import { useI18n } from './I18nProvider';

interface LanguageSwitcherProps {
    /** `compact` shows just the code (EN/RU); `full` adds an icon and the language name. */
    variant?: 'compact' | 'full';
    className?: string;
}

export function setLocaleCookie(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

export default function LanguageSwitcher({ variant = 'compact', className = '' }: LanguageSwitcherProps) {
    const { locale, t } = useI18n();
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const choose = (next: Locale) => {
        if (next === locale) return;
        setLocaleCookie(next);
        // Server components read the cookie, so re-render them in place.
        startTransition(() => router.refresh());
    };

    return (
        <div
            role="group"
            aria-label={t.nav.language}
            className={`inline-flex items-center rounded-[10px] bg-slate-100 p-0.5 font-body ${pending ? 'opacity-60' : ''} ${className}`}
        >
            {variant === 'full' && <Languages aria-hidden="true" className="ml-2 mr-1 h-4 w-4 text-slate-500" />}
            {LOCALES.map((code) => {
                const active = code === locale;
                return (
                    <button
                        key={code}
                        type="button"
                        lang={code}
                        onClick={() => choose(code)}
                        aria-pressed={active}
                        title={LOCALE_NAMES[code]}
                        className={`h-8 rounded-[8px] px-2.5 text-xs font-semibold transition-colors ${
                            active ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink'
                        } ${variant === 'full' ? 'flex-1' : 'uppercase tracking-wide'}`}
                    >
                        {variant === 'full' ? LOCALE_NAMES[code] : code}
                    </button>
                );
            })}
        </div>
    );
}
