import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const pages = ["", "/shop", "/science", "/about", "/faq", "/contact", "/track", "/terms", "/privacy", "/research-use"];
  const products = await listProducts();
  return [
    ...pages.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.6 })),
    ...products.map((product) => ({ url: `${base}/shop/${product.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
