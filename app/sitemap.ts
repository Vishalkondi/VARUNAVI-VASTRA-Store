import type { MetadataRoute } from "next";
import { COLLECTIONS, POSTS, PRODUCTS, SITE } from "@/lib/data";
import { collectionUrl, postUrl, productUrl } from "@/lib/utils";

// Tells search engines about every page, saree and journal post. Built into /sitemap.xml.
export const dynamic = "force-static";

const PAGES = ["/", "/shop", "/collections", "/finder", "/gift-card", "/catalogue", "/track-order", "/our-story", "/journal", "/custom-order", "/contact", "/faq", "/shipping", "/refund", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((path) => ({ url: SITE.url + path, changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.6 })),
    ...PRODUCTS.map((p) => ({ url: SITE.url + productUrl(p), changeFrequency: "weekly" as const, priority: 0.8, images: p.images.map((src) => SITE.url + "/" + src.replace(/^\//, "")) })),
    ...COLLECTIONS.map((c) => ({ url: SITE.url + collectionUrl(c), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...POSTS.map((post) => ({ url: SITE.url + postUrl(post.id), lastModified: post.date, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
