import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable transpiling of shared package
  transpilePackages: ["@gymtext/shared"],

  // Webpack configuration for resolving shared package
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
