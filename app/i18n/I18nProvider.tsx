'use client';

import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_LOCALE, type Locale } from './config';
import { getMessages, type Messages } from './messages';

interface I18nValue {
    locale: Locale;
    t: Messages;
}

const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, t: getMessages(DEFAULT_LOCALE) });

// Messages contain functions (plurals, interpolation), which can't cross the
// server→client boundary, so only the locale is passed in and the client
// looks the messages up itself.
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
    const value = useMemo(() => ({ locale, t: getMessages(locale) }), [locale]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Messages for client components: `const { t, locale } = useI18n()`. */
export function useI18n() {
    return useContext(I18nContext);
}
