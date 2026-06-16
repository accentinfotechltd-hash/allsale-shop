"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Product } from "@/lib/api";
import { ProductCard } from "@/components/product-card";
import { useApp } from "@/components/providers";
import { ArrowRight, Sparkles } from "lucide-react";

const COUNTRY_NAME: Record<string, { name: string; flag: string; greeting: string }> = {
  NZ: { name: "New Zealand", flag: "🇳🇿", greeting: "Kia ora" },
  AU: { name: "Australia", flag: "🇦🇺", greeting: "G'day" },
  US: { name: "the US", flag: "🇺🇸", greeting: "Hello" },
  GB: { name: "the UK", flag: "🇬🇧", greeting: "Hi" },
  CA: { name: "Canada", flag: "🇨🇦", greeting: "Hi" },
};

export function PersonalisedRail() {
  const { country, user } = useApp();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Try country-popular first
        let list = await api
          .products({ country, sort: "popular", limit: 12 } as any)
          .catch(() => null);
        // Fallback: just regular popular
        if (!list || list.length === 0) {
          list = await api.products({ sort: "popular", limit: 12 } as any).catch(() => []);
        }
        // Final fallback: anything
        if (!list || list.length === 0) {
          list = await api.products({ limit: 12 });
        }
        if (!cancelled) setProducts(list || []);
      } catch {
        if (!cancelled) setProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [country]);

  const c = COUNTRY_NAME[country] || COUNTRY_NAME.NZ;

  return (
    <section className="container-px py-12 md:py-16" data-testid="personalised-rail">
      <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/80 via-amber-50/60 to-rose-50/80 p-6 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-200 text-[10px] font-bold tracking-[0.18em] uppercase text-orange-900 mb-3">
              <Sparkles className="w-3 h-3" />
              For you
            </div>
            <h2 className="heading-lg" data-testid="personalised-rail-title">
              {user?.full_name ? `${c.greeting}, ${user.full_name.split(" ")[0]}` : c.greeting}
              <span className="ml-2 text-3xl">{c.flag}</span>
            </h2>
            <p className="text-slate-700 mt-2 max-w-xl">
              Curated for shoppers in {c.name} — handpicked from India, duty-aware pricing, ships to your door.
            </p>
          </div>
          <Link href={`/products`} className="btn-ghost text-sm">
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {products === null ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">Curating your bazaar…</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
