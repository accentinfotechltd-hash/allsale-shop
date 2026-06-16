import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/cart", "/checkout/", "/seller/", "/admin/", "/auth/"],
      },
    ],
    sitemap: "https://shop.allsale.co.nz/sitemap.xml",
    host: "https://shop.allsale.co.nz",
  };
}
