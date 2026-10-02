import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.short,
    description: "Research peptides and laboratory supplies. For research use only.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
