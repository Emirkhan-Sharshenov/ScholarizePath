import 'server-only';
import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, isLocale, localeFromAcceptLanguage, type Locale } from './config';
import { getMessages } from './messages';

/** The visitor's language: their saved choice, else their browser's. */
export async function getLocale(): Promise<Locale> {
    const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
    if (isLocale(saved)) return saved;
    return localeFromAcceptLanguage((await headers()).get('accept-language'));
}

/** Messages for server components: `const { t, locale } = await getI18n()`. */
export async function getI18n() {
    const locale = await getLocale();
    return { locale, t: getMessages(locale) };
}
