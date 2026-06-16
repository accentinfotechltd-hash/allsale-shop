import type { MetadataRoute } from "next";
import { BACKEND_URL } from "@/lib/utils";

const SITE = "https://shop.allsale.co.nz";

export const revalidate = 3600; // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/become-seller`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  // Categories
  try {
    const r = await fetch(`${BACKEND_URL}/api/categories`, { next: { revalidate: 3600 } });
    if (r.ok) {
      const cats: string[] = await r.json();
      for (const c of cats) {
        staticUrls.push({
          url: `${SITE}/products?category=${encodeURIComponent(c)}`,
          lastModified: now,
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
