'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { ErrorScreen } from '@/components/common/SystemScreens';

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return <ErrorScreen digest={error.digest} onRetry={retry} />;
}
