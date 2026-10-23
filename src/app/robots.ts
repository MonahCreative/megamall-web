import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** /robots.txt: let search engines in, keep private pages (checkout, orders) out of results. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout", "/order/", "/wishlist"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
