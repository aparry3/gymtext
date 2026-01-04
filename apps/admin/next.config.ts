import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable transpiling of shared package
  transpilePackages: ["@gymtext/shared"],

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
