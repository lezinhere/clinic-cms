import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/index.html",
      },
    ];
  },
};

export default nextConfig;
