"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorScreen } from "@/components/common/SystemScreens";
// global-error replaces the root layout, so it brings its own styles.
import "./globals.css";

export default function GlobalError({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <title>Something went wrong | ScholarizePath</title>
                <ErrorScreen digest={error.digest} onRetry={retry} />
            </body>
        </html>
    );
}
