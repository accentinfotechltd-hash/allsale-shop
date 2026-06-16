import { BACKEND_URL } from "@/lib/utils";
import type { Product } from "@/lib/api";
import { ProductDetailClient } from "./client";
import { ProductCard } from "@/components/product-card";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

async function getProduct(id: string): Promise<Product | null> {
  try {
    const r = await fetch(`${BACKEND_URL}/api/products/${id}`, { next: { revalidate: 120 } });
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}

async function getRecs(id: string): Promise<Product[]> {
  try {
    const r = await fetch(`${BACKEND_URL}/api/products/${id}/recommendations`, { next: { revalidate: 300 } });
    if (!r.ok) return [];
    return r.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return { title: "Product not found · Allsale" };
  return {
    title: p.name,
    description: p.description?.slice(0, 160),
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      type: "website",
      title: p.name,
      description: p.description?.slice(0, 160),
      images: p.images?.length ? p.images : [p.image],
    },
    twitter: {
      card: "summary_large_image",
      title: p.name,
      description: p.description?.slice(0, 160),
      images: p.images?.length ? p.images : [p.image],
    },
  };
}

function productJsonLd(p: import("@/lib/api").Product) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "";
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.name,
    image: p.images?.length ? p.images : [p.image],
    description: p.description,
    sku: p.id,
    category: p.category,
    brand: p.seller_name ? { "@type": "Brand", name: p.seller_name } : undefined,
    aggregateRating:
      p.rating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: p.rating.toFixed(1),
            reviewCount: p.reviews_count,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: `${site}/product/${p.id}`,
      priceCurrency: "NZD",
      price: p.price_nzd.toFixed(2),
      availability: p.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const recs = await getRecs(id);

  return (
    <div data-testid="product-detail-page">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <ProductDetailClient product={product} />
      {recs.length > 0 && (
        <section className="container-px py-16">
          <div className="eyebrow mb-2">You may also like</div>
          <h2 className="heading-lg mb-8">Hand-picked for this style</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {recs.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
