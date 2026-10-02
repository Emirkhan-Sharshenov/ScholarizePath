// Interface languages. The choice lives in a cookie, not the URL: almost
// every page sits behind sign-in, so per-language URLs would buy little SEO
// for a lot of routing churn. First visits fall back to Accept-Language.

export const LOCALES = ['en', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'lang';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_NAMES: Record<Locale, string> = {
    en: 'English',
    ru: 'Русский',
};

export function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

// Browsers set to these languages get Russian: across Central Asia and
// neighbouring countries Russian is far more widely read than English.
const RUSSIAN_FALLBACK = new Set(['ru', 'ky', 'kk', 'uz', 'tg', 'tk', 'be', 'hy', 'az', 'mn']);

/** Picks a locale from an Accept-Language header, honouring q-weights. */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
    if (!header) return DEFAULT_LOCALE;
    const ranked = header
        .split(',')
        .map((part) => {
            const [tag, ...params] = part.trim().split(';');
            const q = params.find((p) => p.trim().startsWith('q='));
            return { lang: tag.trim().toLowerCase().split('-')[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 };
        })
        .filter((entry) => entry.lang && entry.q > 0)
        .sort((a, b) => b.q - a.q);

    for (const { lang } of ranked) {
        if (lang === 'en') return 'en';
        if (RUSSIAN_FALLBACK.has(lang)) return 'ru';
    }
    return DEFAULT_LOCALE;
}
