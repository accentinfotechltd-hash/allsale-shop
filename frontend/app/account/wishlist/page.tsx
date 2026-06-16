"use client";

import { useEffect, useState } from "react";
import { api, type Product } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.wishlist().then((data: any) => {
      // backend may return list of products or {items:[products]}
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
    }).catch((e) => setError(e?.message || "Could not load wishlist"));
  }, []);

  if (error) return <div className="py-12 text-center text-slate-500">{error}</div>;
  if (items === null) return <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div data-testid="wishlist-page">
      <h1 className="heading-lg mb-6">Your wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-orange-50 inline-flex items-center justify-center mb-4">
            <Heart className="w-7 h-7 text-primary" />
          </div>
          <h2 className="heading-sm">Nothing saved yet</h2>
          <p className="text-slate-500 mt-2 mb-6">Tap the heart on any product to save it for later.</p>
          <Link href="/products" className="btn-primary">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((p) => <ProductCard key={p.id} product={p as any} />)}
        </div>
      )}
    </div>
  );
}
