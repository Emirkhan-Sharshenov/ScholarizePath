'use client';

import React from 'react';
import { useI18n } from '@/i18n/I18nProvider';

// Small hint next to a figure that hasn't been checked against the
// university's official sources (see app/lib/verification.ts).
export default function UnverifiedTag({ show }: { show?: boolean }) {
    const { t } = useI18n();
    if (!show) return null;
    return (
        <span
            title={t.universities.detail.unverifiedTitle}
            className="ml-1.5 inline-block rounded bg-amber-50 px-1 py-px align-middle text-[9px] font-semibold uppercase tracking-wide text-amber-700"
        >
            {t.universities.detail.unverified}
        </span>
    );
}
