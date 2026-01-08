import type { NextConfig } from "next";

// Vercel Trigger: 2026-01-08T20:38:00+05:30

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
