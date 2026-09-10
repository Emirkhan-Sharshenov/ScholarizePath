import * as Sentry from "@sentry/nextjs";

// Error + performance monitoring only — no Session Replay/Feedback widget.
// The app handles student personal data (GPA, nationality, etc.), so we're
// not turning on screen-recording-style features without that being an
// explicit decision, not a default that came bundled with the SDK.
Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
