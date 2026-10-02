import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import ruLocale from 'i18n-iso-countries/langs/ru.json';
import type { Locale } from './config';

// Countries are stored and matched by their English names (profiles,
// universities, scholarships). These helpers only change how a name is shown.
//
// Names come from the i18n-iso-countries data rather than Intl.DisplayNames:
// Node's and the browser's ICU data disagree on some names ("Гонконг" vs
// "Гонконг (САР)"), which breaks hydration.

countries.registerLocale(enLocale);
countries.registerLocale(ruLocale);

// English spellings used in our data that the library doesn't know.
const ALIASES: Record<string, string> = {
    Brunei: 'BN',
    Moldova: 'MD',
    Syria: 'SY',
    USA: 'US',
    UK: 'GB',
    'South Korea': 'KR',
    'North Korea': 'KP',
    'Czech Republic': 'CZ',
    Russia: 'RU',
    Vietnam: 'VN',
    Laos: 'LA',
    Iran: 'IR',
    Taiwan: 'TW',
    'Hong Kong': 'HK',
    Macau: 'MO',
    Palestine: 'PS',
    Kosovo: 'XK',
    Worldwide: '',
};

// Where the library's Russian name isn't the one people actually use.
const RU_OVERRIDES: Record<string, string> = {
    KG: 'Кыргызстан',
    KR: 'Южная Корея',
    KP: 'Северная Корея',
    RU: 'Россия',
    TW: 'Тайвань',
    PS: 'Палестина',
    CD: 'ДР Конго',
    MD: 'Молдова',
};

const RU_WORDS: Record<string, string> = {
    Worldwide: 'Весь мир',
    Global: 'Весь мир',
    International: 'Международная',
    Europe: 'Европа',
    Asia: 'Азия',
    Africa: 'Африка',
    'Latin America': 'Латинская Америка',
    'North America': 'Северная Америка',
    'Middle East': 'Ближний Восток',
    Oceania: 'Океания',
};

export function countryCode(name: string): string | undefined {
    const trimmed = name.trim();
    if (trimmed in ALIASES) return ALIASES[trimmed] || undefined;
    return countries.getAlpha2Code(trimmed, 'en');
}

/** A stored (English) country name in the UI language. Unknown names pass through. */
export function localizeCountry(name: string | null | undefined, locale: Locale): string {
    if (!name) return '';
    if (locale === 'en') return name;
    const trimmed = name.trim();
    if (trimmed in RU_WORDS) return RU_WORDS[trimmed];
    const code = countryCode(trimmed);
    if (!code) return name;
    return RU_OVERRIDES[code] ?? countries.getName(code, 'ru', { select: 'alias' }) ?? name;
}

/**
 * Localizes "City, Country" style locations: the last comma-separated part is
 * treated as the country, the rest (city/region names) is left as is.
 */
export function localizeLocation(location: string | null | undefined, locale: Locale): string {
    if (!location) return '';
    if (locale === 'en') return location;
    const parts = location.split(',');
    const last = parts.pop()!;
    const localized = localizeCountry(last, locale);
    return parts.length ? `${parts.join(',')}, ${localized.trim()}` : localized;
}
