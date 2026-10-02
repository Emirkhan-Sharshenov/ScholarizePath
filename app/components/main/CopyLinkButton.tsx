'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

/** Copies a URL (the site root by default); falls back to the native share sheet where copying isn't available. */
export default function CopyLinkButton({ url, className = '' }: { url?: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    const { t } = useI18n();

    const copy = async () => {
        const link = url ?? window.location.origin;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            if (typeof navigator.share === 'function') navigator.share({ url: link }).catch(() => {});
        }
    };

    return (
        <button type="button" onClick={copy} className={className} aria-live="polite">
            {copied ? <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" /> : <Link2 aria-hidden="true" className="h-4 w-4" />}
            {copied ? t.common.linkCopied : t.common.copyLink}
        </button>
    );
}
