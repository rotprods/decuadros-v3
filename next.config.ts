import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default withSentryConfig(nextConfig, {
  // Sentry org and project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress Sentry CLI logs
  silent: !process.env.CI,

  // Upload source maps only in production to save build time
  widenClientFileUpload: true,
  disableLogger: true,

  // React component annotation
  reactComponentAnnotation: {
    enabled: true,
  },

  // ⚡️ SPEED OPTIMIZATION: Do not run Sentry webpack plugin in development
  // This saves significant CPU/RAM during local dev
  enabled: process.env.NODE_ENV === "production",
});
