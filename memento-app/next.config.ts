import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack for Solana package compatibility
  turbopack: {},
  // Webpack externals for SSR compatibility
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
