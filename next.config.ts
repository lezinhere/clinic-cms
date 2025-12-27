import type { NextConfig } from "next";

// Vercel Trigger: 2025-12-27T09:51:54+05:30

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
        destination: "/index.html",
      },
    ];
  },
};

export default nextConfig;
