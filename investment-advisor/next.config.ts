import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "market.tase.co.il",
      },
    ],
  },
};

export default nextConfig;
