import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/o/coachclatchey', destination: '/clatchey', permanent: true },
      { source: '/o/mikeyswiercz', destination: '/mikey', permanent: true },
      { source: '/o/nextlevelbasketball', destination: '/nextlevelbasketball', permanent: true },
    ];
  },
  // Enable transpiling of shared package
  transpilePackages: ["@gymtext/shared"],

  // PostHog analytics proxied via external reverse proxy at t.gymtext.co
  // (no Next.js rewrites needed — Caddy/nginx handles it)

  // Exclude packages with WASM from bundling - load at runtime from node_modules
  serverExternalPackages: ["@dqbd/tiktoken"],

  // Turbopack configuration for path aliases (Next.js 16+)
  turbopack: {
    root: path.resolve(__dirname, "../.."),
    resolveAlias: {
      "@/server": path.resolve(__dirname, "../../packages/shared/src/server"),
      "@/shared": path.resolve(__dirname, "../../packages/shared/src/shared"),
    },
  },

  // Webpack configuration for resolving shared package (fallback)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/server": path.resolve(__dirname, "../../packages/shared/src/server"),
      "@/shared": path.resolve(__dirname, "../../packages/shared/src/shared"),
    };
    return config;
  },
};

export default nextConfig;
