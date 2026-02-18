import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default withSentryConfig(nextConfig, {
  // Sentry org and project (set in env or leave blank for local dev)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress Sentry CLI logs during build
  silent: !process.env.CI,

  // Upload source maps to Sentry for readable stack traces
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Automatically annotate React components for better error context
  reactComponentAnnotation: {
    enabled: true,
  },
});
