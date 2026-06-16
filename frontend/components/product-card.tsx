"use client";

import Link from "next/link";
import { useApp } from "@/components/providers";
import { convertPriceNZD, formatPrice } from "@/lib/utils";
import { Star, Truck } from "lucide-react";
import type { Product } from "@/lib/api";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { currency, rates, symbol } = useApp();
  const converted = rates ? convertPriceNZD(product.price_nzd, currency, rates.rates) : product.price_nzd;
  const price = formatPrice(converted, currency, symbol);

  return (
    <Link
      href={`/product/${product.id}`}
      data-testid="product-card-link"
      className="card-product group"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.in_stock ? (
          <span className="absolute top-3 left-3 bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded-full font-bold tracking-wider uppercase border border-emerald-200">
            In stock
          </span>
        ) : (
          <span className="absolute top-3 left-3 bg-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded-full font-bold tracking-wider uppercase">
            Sold out
          </span>
        )}
        {product.origin === "India" && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] px-2 py-1 rounded-full font-bold border border-slate-200">
            🇮🇳 Made in India
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-slate-500 mb-1.5">
          {product.category}
        </div>
        <h3 className="font-bold text-slate-900 line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.name}
        </h3>

        {product.seller_name && (
          <div className="text-xs text-violet-700 mt-1.5">
            by <span className="font-semibold">{product.seller_name}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="font-heading text-xl font-extrabold text-slate-900">
            {price}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
              <span className="text-slate-400">({product.reviews_count})</span>
            </div>
          )}
        </div>

        {product.shipping_days_min && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Truck className="w-3 h-3" />
            Ships in {product.shipping_days_min}–{product.shipping_days_max} days
          </div>
        )}
      </div>
    </Link>
  );
}
