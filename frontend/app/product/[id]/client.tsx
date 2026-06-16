"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Truck, Shield, Heart, Minus, Plus, ChevronLeft } from "lucide-react";
import { api, type Product } from "@/lib/api";
import { useApp } from "@/components/providers";
import { convertPriceNZD, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { user, currency, rates, symbol, refreshCart, country } = useApp();
  const images = product.images?.length ? product.images : [product.image];
  const [activeImg, setActiveImg] = useState(images[0]);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors?.[0] || "");
  const [size, setSize] = useState(product.sizes?.[0] || "");
  const [adding, setAdding] = useState(false);
  const [wishing, setWishing] = useState(false);

  const converted = rates ? convertPriceNZD(product.price_nzd, currency, rates.rates) : product.price_nzd;
  const price = formatPrice(converted, currency, symbol);

  const addToCart = async () => {
    if (!user) {
      toast.info("Please sign in to add items to your cart");
      router.push(`/login?next=/product/${product.id}`);
      return;
    }
    setAdding(true);
    try {
      await api.updateCart({ product_id: product.id, quantity: qty, action: "add" });
      await refreshCart();
      toast.success(`Added ${qty}× ${product.name} to your cart`);
    } catch (e: any) {
      toast.error(e?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.info("Please sign in to save to wishlist");
      router.push(`/login?next=/product/${product.id}`);
      return;
    }
    setWishing(true);
    try {
      await api.toggleWishlist(product.id);
      toast.success("Saved to wishlist");
    } catch (e: any) {
      toast.error(e?.message || "Could not update wishlist");
    } finally {
      setWishing(false);
    }
  };

  return (
    <div className="container-px py-6 md:py-10">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-slate-900">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      <button
        onClick={() => router.back()}
        className="md:hidden mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-700"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImg}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {product.origin === "India" && (
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-slate-900 text-xs px-3 py-1.5 rounded-full font-bold border border-slate-200">
                🇮🇳 Made in India
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  data-testid={`product-thumb-${i}`}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                    activeImg === img ? "border-primary" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* details */}
        <div className="lg:pt-2">
          <div className="text-xs tracking-[0.18em] uppercase font-bold text-primary mb-3">
            {product.category}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight" data-testid="product-name">
            {product.name}
          </h1>

          {product.seller_name && (
            <div className="mt-3 text-sm text-violet-700">
              by <Link href="#" className="font-semibold underline-offset-2 hover:underline">{product.seller_name}</Link>
              {product.seller_city && <span className="text-slate-500"> · {product.seller_city}</span>}
            </div>
          )}

          <div className="mt-5 flex items-center gap-4">
            <div className="font-heading text-4xl font-extrabold text-slate-900" data-testid="product-price">
              {price}
            </div>
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
                <span className="text-slate-400">({product.reviews_count} reviews)</span>
              </div>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {currency !== "NZD" && `≈ NZ$${product.price_nzd.toFixed(2)} · `}
            Inclusive of taxes · Duties calculated at checkout
          </div>

          <p className="mt-6 text-slate-700 leading-relaxed" data-testid="product-description">
            {product.description}
          </p>

          {/* color */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-7">
              <div className="eyebrow mb-3">Colour: <span className="text-slate-900 normal-case tracking-normal font-bold">{color}</span></div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    data-testid={`color-option-${c.toLowerCase()}`}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition ${
                      color === c
                        ? "border-primary bg-orange-50 text-primary"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* size */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="eyebrow mb-3">Size: <span className="text-slate-900 normal-case tracking-normal font-bold">{size}</span></div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    data-testid={`size-option-${s.toLowerCase()}`}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition ${
                      size === s
                        ? "border-primary bg-orange-50 text-primary"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* qty */}
          <div className="mt-7 flex items-center gap-4">
            <div className="inline-flex items-center bg-slate-100 rounded-full p-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-9 h-9 rounded-full bg-white shadow-sm hover:bg-slate-50 inline-flex items-center justify-center"
                data-testid="qty-decrement"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold" data-testid="qty-display">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock_count || 99, qty + 1))}
                className="w-9 h-9 rounded-full bg-white shadow-sm hover:bg-slate-50 inline-flex items-center justify-center"
                data-testid="qty-increment"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-slate-500">
              {product.in_stock ? `${product.stock_count} in stock` : "Sold out"}
            </span>
          </div>

          {/* actions */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button
              onClick={addToCart}
              disabled={!product.in_stock || adding}
              className="btn-primary flex-1 text-base py-3.5"
              data-testid="add-to-cart-button"
            >
              {adding ? "Adding…" : product.in_stock ? "Add to cart" : "Sold out"}
            </button>
            <button
              onClick={toggleWishlist}
              disabled={wishing}
              className="btn-secondary px-5"
              aria-label="Save to wishlist"
              data-testid="wishlist-toggle"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* trust */}
          <div className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Truck className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-emerald-900">Tracked global shipping</div>
                <div className="text-emerald-800/80 text-xs mt-0.5">
                  {product.shipping_days_min}–{product.shipping_days_max} days · Shiprocket X
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
              <Shield className="w-5 h-5 text-violet-700 mt-0.5 shrink-0" />
              <div>
                <div className="font-bold text-violet-900">KYC-verified seller</div>
                <div className="text-violet-800/80 text-xs mt-0.5">Authentic India craftsmanship</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
