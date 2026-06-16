"use client";

import Link from "next/link";
import { useApp } from "@/components/providers";
import { Package, Heart, ShoppingBag, ArrowRight } from "lucide-react";

export default function AccountOverview() {
  const { user, cart, cartCount } = useApp();

  return (
    <div data-testid="account-overview">
      <h1 className="heading-lg mb-2">Welcome back, {user?.full_name?.split(" ")[0] || "friend"} 👋</h1>
      <p className="text-slate-600 mb-8">Manage your orders, wishlist and shipping preferences from here.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/account/orders" className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary hover:shadow-md transition">
          <Package className="w-7 h-7 text-primary mb-4" />
          <div className="heading-sm">Orders</div>
          <div className="text-sm text-slate-600 mt-1">Track shipments and view receipts</div>
          <div className="mt-4 inline-flex items-center gap-1 text-primary font-bold text-sm group-hover:gap-2 transition-all">
            View orders <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link href="/account/wishlist" className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary hover:shadow-md transition">
          <Heart className="w-7 h-7 text-primary mb-4" />
          <div className="heading-sm">Wishlist</div>
          <div className="text-sm text-slate-600 mt-1">Items you&apos;ve saved for later</div>
          <div className="mt-4 inline-flex items-center gap-1 text-primary font-bold text-sm group-hover:gap-2 transition-all">
            View wishlist <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link href="/cart" className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-primary hover:shadow-md transition">
          <ShoppingBag className="w-7 h-7 text-primary mb-4" />
          <div className="heading-sm">Cart ({cartCount})</div>
          <div className="text-sm text-slate-600 mt-1">{cart?.items?.length ? `${cart.items.length} ${cart.items.length === 1 ? "item" : "items"} ready to checkout` : "Your cart is empty"}</div>
          <div className="mt-4 inline-flex items-center gap-1 text-primary font-bold text-sm group-hover:gap-2 transition-all">
            Go to cart <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-2xl p-6">
          <div className="text-xs font-bold tracking-[0.18em] uppercase text-violet-700 mb-3">For sellers</div>
          <div className="heading-sm text-violet-900">Sell on Allsale</div>
          <div className="text-sm text-violet-800 mt-1">Are you an Indian maker? Reach 12,000+ global buyers.</div>
          <a
            href="https://allsale-shop.preview.emergentagent.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white rounded-full px-4 py-2 font-bold text-sm transition"
          >
            Open seller portal <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
