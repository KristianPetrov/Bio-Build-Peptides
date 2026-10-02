import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const isProduction = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";
  return {
    rules: isProduction
      ? { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/checkout", "/order"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
