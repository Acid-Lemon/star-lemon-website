import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ali-oss', 'urllib', 'proxy-agent'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
