import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages are rendered fresh on every visit (prices, stock and promotions change often),
  // with the page frame shown instantly while data streams in.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
