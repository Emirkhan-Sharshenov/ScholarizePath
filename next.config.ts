import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // No org/project/authToken configured yet — source map upload is skipped
  // (errors still report fine, just with minified stack traces) until
  // SENTRY_AUTH_TOKEN + org/project slugs are added.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
