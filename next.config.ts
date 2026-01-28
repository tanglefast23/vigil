import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['api.prod.whoop.com'],
  },
  // For Vercel Edge Functions compatibility
  serverExternalPackages: ['crypto'],
};

export default nextConfig;
