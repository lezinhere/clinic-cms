import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
