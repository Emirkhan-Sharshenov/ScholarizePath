import type { Locale } from './config';

const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', ru: 'ru-RU' };

export function intlLocale(locale: Locale) {
    return INTL_LOCALE[locale];
}

/** English plural for message functions; `#` becomes the formatted number. */
export function pluralEn(n: number, one: string, other: string) {
    return (n === 1 ? one : other).replace('#', n.toLocaleString('en-US'));
}

/** Russian plural: one (1, 21…), few (2–4, 22–24…), many (5–20, 25–30…). */
export function pluralRu(n: number, one: string, few: string, many: string) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    const form =
        mod10 === 1 && mod100 !== 11 ? one : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
    return form.replace('#', n.toLocaleString('ru-RU'));
}

export function formatDate(
    locale: Locale,
    value: Date | string | number,
    options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(intlLocale(locale), options);
}

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions) {
    return value.toLocaleString(intlLocale(locale), options);
}

/** An API `message` in the UI language (API routes answer in English). */
export function apiMessage(t: { api: Record<string, string> }, message: string | undefined, fallback: string) {
    if (!message) return fallback;
    return t.api[message] ?? message;
}
