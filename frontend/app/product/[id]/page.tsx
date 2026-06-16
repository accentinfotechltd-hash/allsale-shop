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
    title: `${p.name} · Allsale`,
    description: p.description?.slice(0, 160),
    openGraph: { images: p.images?.length ? p.images : [p.image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const recs = await getRecs(id);

  return (
    <div data-testid="product-detail-page">
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
