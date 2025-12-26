import type { NextConfig } from "next";

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
