import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // PWA and mobile optimizations
  experimental: {
    // optimizeCss: true, // Uncomment if using Tailwind CSS
  },
  // Ensure proper handling of static assets
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // Enable trailing slashes for better SEO
  trailingSlash: false,
  // Turbopack configuration
  turbopack: {},
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "https-calls",
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 1 month
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

export default pwaConfig(nextConfig as any);