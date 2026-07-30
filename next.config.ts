import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photography lives on Brandfolder's CDN, with older assets still served
    // from the WordPress uploads directory.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.bfldr.com" },
      { protocol: "https", hostname: "www.abiinteriors.com.au" },
    ],
  },
};

export default nextConfig;
