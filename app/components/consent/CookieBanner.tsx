'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import {
    type ConsentChoice,
    onOpenCookieSettings,
    readConsent,
    saveConsent,
    subscribeConsent,
} from '@/lib/consent';
import { useI18n } from '@/i18n/I18nProvider';

// 'pending' on the server and during hydration, so the banner never
// flashes for visitors who already chose.
const getServerSnapshot = () => 'pending' as const;

export default function CookieBanner() {
    const choice = useSyncExternalStore(subscribeConsent, readConsent, getServerSnapshot);
    const [reopened, setReopened] = useState(false);
    const { t } = useI18n();

    useEffect(() => onOpenCookieSettings(() => setReopened(true)), []);

    const open = choice === null || reopened;

    const choose = (value: ConsentChoice) => {
        saveConsent(value);
        setReopened(false);
    };

    return (
        <MotionConfig reducedMotion="user">
            <AnimatePresence>
                {open && (
                    <motion.div
                        role="dialog"
                        aria-labelledby="cookie-banner-title"
                        aria-describedby="cookie-banner-text"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[45] mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-5 font-body shadow-[0_12px_40px_-12px_rgba(10,26,63,0.28)] sm:inset-x-auto sm:left-6 sm:mx-0"
                    >
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <Cookie aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 id="cookie-banner-title" className="font-display text-base font-semibold text-ink">
                                    {t.site.consent.title}
                                </h2>
                                <p id="cookie-banner-text" className="mt-1 text-sm leading-relaxed text-slate-600">
                                    {t.site.consent.text}{' '}
                                    <Link href="/privacy" className="font-medium text-brand underline-offset-2 hover:underline">
                                        {t.site.consent.privacy}
                                    </Link>
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => choose('denied')}
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                {t.site.consent.decline}
                            </button>
                            <button
                                type="button"
                                onClick={() => choose('granted')}
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004a9f]"
                            >
                                {t.site.consent.accept}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </MotionConfig>
    );
}
