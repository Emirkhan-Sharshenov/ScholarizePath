'use client';

import { openCookieSettings } from '@/lib/consent';
import { useI18n } from '@/i18n/I18nProvider';

export default function CookieSettingsButton({ className }: { className?: string }) {
    const { t } = useI18n();
    return (
        <button type="button" onClick={openCookieSettings} className={className}>
            {t.site.consent.settings}
        </button>
    );
}
