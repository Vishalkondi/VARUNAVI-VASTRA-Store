import type { MetadataRoute } from "next";
import { SITE } from "@/lib/data";

// Built into /robots.txt: lets search engines in (except the personal cart and wishlist pages) and points them to the sitemap.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/wishlist"] },
    sitemap: SITE.url + "/sitemap.xml",
  };
}
