import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages are rendered fresh on every visit (prices, stock and promotions change often),
  // with the page frame shown instantly while data streams in.
  output: "standalone",
  // Old category links (/products?category=kitchen)
  // now open the category's own page, with a permanent redirect so Google moves the address over.
  async redirects() {
    return [
      {
        source: "/products",
        has: [{ type: "query", key: "category", value: "(?<category>[^&]+)" }],
        missing: [{ type: "query", key: "q" }],
        destination: "/category/:category",
        permanent: true,
      },
    ];
  },
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
