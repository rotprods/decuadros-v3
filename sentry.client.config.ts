import * as Sentry from "@sentry/nextjs"

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Replay captures user sessions when errors occur
    integrations: [
        Sentry.replayIntegration(),
    ],

    // Capture 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,

    // Capture 100% of sessions when an error occurs
    replaysOnErrorSampleRate: 1.0,

    // Only capture 10% of sessions for replay
    replaysSessionSampleRate: 0.1,

    // Disable in development
    enabled: process.env.NODE_ENV === "production",
})
