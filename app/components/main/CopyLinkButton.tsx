'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';

/** Copies a URL (the site root by default); falls back to the native share sheet where copying isn't available. */
export default function CopyLinkButton({ url, className = '' }: { url?: string; className?: string }) {
    const [copied, setCopied] = useState(false);

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
            {copied ? 'Link copied' : 'Copy link'}
        </button>
    );
}
