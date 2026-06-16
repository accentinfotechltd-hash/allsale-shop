"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers";
import { api, type ShippingAddress } from "@/lib/api";
import { convertPriceNZD, formatPrice } from "@/lib/utils";
import { Trash2, Minus, Plus, ShoppingBag, Tag, Loader2, X, MapPin } from "lucide-react";
import { toast } from "sonner";

const COUNTRY_OPTIONS = [
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

const ADDRESS_LS_KEY = "allsale_shipping_address";

function loadSavedAddress(): Partial<ShippingAddress> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ADDRESS_LS_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function CartPage() {
  const router = useRouter();
  const { user, token, cart, refreshCart, bootstrapped, currency, rates, symbol, country } = useApp();
  const [updating, setUpdating] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (bootstrapped && !token) {
      router.replace(`/login?next=/cart`);
    }
  }, [bootstrapped, token, router]);

  if (!bootstrapped || !user) {
    return (
      <div className="container-px py-20 text-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );
  }

  const items = cart?.items || [];

  const setQty = async (product_id: string, q: number) => {
    if (q < 0) return;
    setUpdating(product_id);
    try {
      if (q === 0) {
        await api.cartRemove(product_id);
      } else {
        await api.cartSet(product_id, q);
      }
      await refreshCart();
    } catch (e: any) {
      toast.error(e?.message || "Could not update cart");
    } finally {
      setUpdating(null);
    }
  };

  const incrementQty = async (product_id: string) => {
    setUpdating(product_id);
    try {
      await api.cartAdd(product_id, 1);
      await refreshCart();
    } catch (e: any) {
      toast.error(e?.message || "Could not update cart");
    } finally {
      setUpdating(null);
    }
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      await api.applyCoupon(coupon.trim());
      await refreshCart();
      toast.success("Coupon applied");
      setCoupon("");
    } catch (e: any) {
      toast.error(e?.message || "Coupon invalid");
    } finally {
      setCouponLoading(false);
    }
  };

  const startCheckout = async (address: ShippingAddress) => {
    if (items.length === 0) return;
    setCheckoutLoading(true);
    try {
      // Save for next time
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ADDRESS_LS_KEY, JSON.stringify(address));
      }
      const res = await api.checkoutSession({
        origin_url: window.location.origin,
        currency,
        country: address.country,
        address,
      });
      window.location.href = res.url;
    } catch (e: any) {
      toast.error(e?.message || "Could not start checkout");
      setCheckoutLoading(false);
    }
  };

  const fmt = (nzd: number) => {
    const conv = rates ? convertPriceNZD(nzd, currency, rates.rates) : nzd;
    return formatPrice(conv, currency, symbol);
  };

  if (items.length === 0) {
    return (
      <div className="container-px py-20 text-center" data-testid="empty-cart">
        <div className="mx-auto w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </div>
        <h1 className="heading-md">Your cart is empty</h1>
        <p className="text-slate-500 mt-2 mb-8">Discover sarees, jewellery, spices and more.</p>
        <Link href="/products" className="btn-primary">Start shopping</Link>
      </div>
    );
  }

  const subtotal = cart?.subtotal_nzd ?? items.reduce((s, i) => s + (i.price_nzd || 0) * i.quantity, 0);
  const shipping = cart?.shipping_nzd ?? 0;
  const discount = cart?.discount_nzd ?? 0;
  const total = cart?.total_nzd ?? subtotal + shipping - discount;

  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0);

  return (
    <div className="container-px py-8 md:py-12" data-testid="cart-page">
      <h1 className="heading-md mb-8">Your cart ({totalQty} {totalQty === 1 ? "item" : "items"})</h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-4">
          {items.map((it) => {
            const lineNzd = (it.price_nzd || 0) * it.quantity;
            return (
              <div
                key={it.product_id}
                className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200"
                data-testid={`cart-item-${it.product_id}`}
              >
                <Link href={`/product/${it.product_id}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image} alt={it.name} className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${it.product_id}`} className="font-bold text-slate-900 line-clamp-2 hover:underline">
                    {it.name}
                  </Link>
                  <div className="text-sm text-slate-500 mt-1">{fmt(it.price_nzd || 0)} each</div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center bg-slate-100 rounded-full p-0.5">
                      <button
                        onClick={() => setQty(it.product_id, it.quantity - 1)}
                        disabled={updating === it.product_id}
                        className="w-8 h-8 rounded-full bg-white shadow-sm hover:bg-slate-50 inline-flex items-center justify-center disabled:opacity-50"
                        data-testid={`cart-decrement-${it.product_id}`}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-9 text-center font-bold text-sm" data-testid={`cart-qty-${it.product_id}`}>{it.quantity}</span>
                      <button
                        onClick={() => incrementQty(it.product_id)}
                        disabled={updating === it.product_id}
                        className="w-8 h-8 rounded-full bg-white shadow-sm hover:bg-slate-50 inline-flex items-center justify-center disabled:opacity-50"
                        data-testid={`cart-increment-${it.product_id}`}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="font-heading font-extrabold text-lg">{fmt(lineNzd)}</div>
                  </div>
                </div>
                <button
                  onClick={() => setQty(it.product_id, 0)}
                  disabled={updating === it.product_id}
                  className="self-start p-2 -mr-1 -mt-1 text-slate-400 hover:text-destructive transition"
                  aria-label="Remove"
                  data-testid={`cart-remove-${it.product_id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* summary */}
        <aside className="lg:sticky lg:top-32 self-start">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="heading-sm">Order summary</div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-bold" data-testid="cart-subtotal">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span className="font-bold">{shipping > 0 ? fmt(shipping) : <span className="text-emerald-700">Calculated at checkout</span>}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount {cart?.coupon_code ? `(${cart.coupon_code})` : ""}</span>
                  <span className="font-bold">-{fmt(discount)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-heading font-extrabold" data-testid="cart-total">{fmt(total)}</span>
              </div>
              <div className="text-xs text-slate-500">Charged in {currency} · Duties calculated separately</div>
            </div>

            {/* coupon */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Promo code"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full border border-slate-200 text-sm uppercase font-bold tracking-wide"
                    data-testid="coupon-input"
                  />
                </div>
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading || !coupon.trim()}
                  className="btn-secondary !py-2 !px-4 text-sm"
                  data-testid="coupon-apply"
                >
                  Apply
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAddress(true)}
              disabled={checkoutLoading || items.length === 0}
              className="btn-primary w-full text-base py-3.5"
              data-testid="checkout-button"
            >
              {checkoutLoading ? "Redirecting…" : "Secure checkout"}
            </button>

            <div className="text-[11px] text-slate-500 text-center">
              🔒 Powered by Stripe · 256-bit encryption
            </div>
          </div>
        </aside>
      </div>

      {/* address modal */}
      {showAddress && (
        <AddressModal
          defaultCountry={country}
          defaultName={user.full_name || ""}
          onClose={() => setShowAddress(false)}
          onSubmit={(addr) => startCheckout(addr)}
          loading={checkoutLoading}
        />
      )}
    </div>
  );
}

function AddressModal({
  defaultCountry,
  defaultName,
  onClose,
  onSubmit,
  loading,
}: {
  defaultCountry: string;
  defaultName: string;
  onClose: () => void;
  onSubmit: (addr: ShippingAddress) => void;
  loading: boolean;
}) {
  const saved = loadSavedAddress();
  const [addr, setAddr] = useState<ShippingAddress>({
    full_name: saved.full_name || defaultName || "",
    line1: saved.line1 || "",
    line2: saved.line2 || "",
    city: saved.city || "",
    region: saved.region || "",
    postcode: saved.postcode || "",
    country: saved.country || defaultCountry || "NZ",
    phone: saved.phone || "",
  });

  const set = (k: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddr({ ...addr, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(addr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="address-modal">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-xl font-extrabold">Shipping address</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Required to calculate shipping and duties</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-slate-100" data-testid="address-modal-close" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="eyebrow block mb-2">Full name</label>
            <input
              required
              value={addr.full_name}
              onChange={set("full_name")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium"
              data-testid="address-fullname"
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Street address</label>
            <input
              required
              placeholder="Line 1"
              value={addr.line1}
              onChange={set("line1")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium mb-2"
              data-testid="address-line1"
            />
            <input
              placeholder="Line 2 (apartment, suite — optional)"
              value={addr.line2 || ""}
              onChange={set("line2")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium"
              data-testid="address-line2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="eyebrow block mb-2">City</label>
              <input
                required
                value={addr.city}
                onChange={set("city")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium"
                data-testid="address-city"
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">Region / State</label>
              <input
                required
                value={addr.region}
                onChange={set("region")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium"
                data-testid="address-region"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="eyebrow block mb-2">Postcode</label>
              <input
                required
                value={addr.postcode}
                onChange={set("postcode")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium"
                data-testid="address-postcode"
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">Country</label>
              <select
                required
                value={addr.country}
                onChange={set("country")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium bg-white"
                data-testid="address-country"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="eyebrow block mb-2">Phone</label>
            <input
              required
              type="tel"
              placeholder="+64 21 123 4567"
              value={addr.phone}
              onChange={set("phone")}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-orange-200 focus:outline-none text-sm font-medium"
              data-testid="address-phone"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base py-3.5"
            data-testid="address-submit"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue to payment"}
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            You&apos;ll be redirected to Stripe Checkout to enter card details.
          </p>
        </form>
      </div>
    </div>
  );
}
