import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Per Reown docs: Required for SSR compatibility with wallet packages
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  // Empty turbopack config to silence the warning
  // We use --webpack flag when running dev due to Solana package compatibility
  turbopack: {},
};

export default nextConfig;
