import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/cart", "/checkout/", "/seller/", "/admin/", "/auth/"],
      },
    ],
    sitemap: SITE ? `${SITE}/sitemap.xml` : undefined,
    host: SITE || undefined,
  };
}
