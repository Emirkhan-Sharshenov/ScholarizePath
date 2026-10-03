'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/** Sends a visitor without a session to sign in, then back to the page they were on. */
export function useGoToLogin() {
    const router = useRouter();
    const pathname = usePathname();
    return useCallback(() => router.push(`/login?from=${encodeURIComponent(pathname)}`), [router, pathname]);
}
