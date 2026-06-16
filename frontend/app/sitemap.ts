import type { MetadataRoute } from "next";
import { BACKEND_URL } from "@/lib/utils";

const SITE = "https://shop.allsale.co.nz";

export const revalidate = 3600; // 1 hour

// Build timestamp for static URLs so the sitemap doesn't claim "everything changed today"
// on every request. For product URLs we still use 'now' since products do update frequently.
const BUILD_TIME = new Date("2026-01-15T00:00:00Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: BUILD_TIME, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/products`, lastModified: BUILD_TIME, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/login`, lastModified: BUILD_TIME, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/register`, lastModified: BUILD_TIME, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/become-seller`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Categories
  try {
    const r = await fetch(`${BACKEND_URL}/api/categories`, { next: { revalidate: 3600 } });
    if (r.ok) {
      const cats: string[] = await r.json();
      for (const c of cats) {
        staticUrls.push({
          url: `${SITE}/products?category=${encodeURIComponent(c)}`,
          lastModified: BUILD_TIME,
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }
  } catch {}

  // Products (cap at 5000 for sitemap size)
  try {
    const r = await fetch(`${BACKEND_URL}/api/products?limit=5000`, { next: { revalidate: 3600 } });
    if (r.ok) {
      const products: { id: string }[] = await r.json();
      for (const p of products) {
        staticUrls.push({
          url: `${SITE}/product/${p.id}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {}

  return staticUrls;
}
