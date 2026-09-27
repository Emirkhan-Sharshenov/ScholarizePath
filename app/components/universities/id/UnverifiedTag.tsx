'use client';

import React from 'react';

// Small hint next to a figure that hasn't been checked against the
// university's official sources (see app/lib/verification.ts).
export default function UnverifiedTag({ show }: { show?: boolean }) {
    if (!show) return null;
    return (
        <span
            title="Not yet checked against the university's official sources — confirm on the university website."
            className="ml-1.5 inline-block rounded bg-amber-50 px-1 py-px align-middle text-[9px] font-semibold uppercase tracking-wide text-amber-700"
        >
            Unverified
        </span>
    );
}
