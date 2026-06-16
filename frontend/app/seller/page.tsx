"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Package, ShoppingCart, Wallet, TrendingUp, ArrowRight, Loader2, Award } from "lucide-react";

export default function SellerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [products, orders, payouts, tier] = await Promise.all([
          api.sellerProducts().catch(() => []),
          api.sellerOrders().catch(() => []),
          api.sellerPayouts().catch(() => null),
          api.sellerTier().catch(() => null),
        ]);
        setData({ products, orders, payouts, tier });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>;
  if (!data) return <div className="py-20 text-center text-slate-500">Could not load dashboard</div>;

  const tier = data.tier?.tier;
  const metrics = data.tier?.metrics || {};

  return (
    <div data-testid="seller-dashboard">
      <h1 className="heading-lg mb-2">Your storefront</h1>
      <p className="text-slate-600 mb-8">A quick view of your activity, payouts and loyalty tier.</p>

      {/* KPI tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiTile
          icon={Package}
          label="Live products"
          value={data.products.length}
          href="/seller/products"
          color="text-violet-700 bg-violet-50"
        />
        <KpiTile
          icon={ShoppingCart}
          label="Total orders"
          value={data.orders.length}
          href="/seller/orders"
          color="text-blue-700 bg-blue-50"
        />
        <KpiTile
          icon={Wallet}
          label="Available payout"
          value={`NZ$${(data.payouts?.available_nzd ?? 0).toFixed(2)}`}
          href="/seller/payouts"
          color="text-emerald-700 bg-emerald-50"
        />
        <KpiTile
          icon={TrendingUp}
          label="Lifetime earnings"
          value={`NZ$${(data.payouts?.lifetime_earnings_nzd ?? 0).toFixed(2)}`}
          href="/seller/payouts"
          color="text-amber-700 bg-amber-50"
        />
      </div>

      {/* Tier block */}
      {tier && (
        <div
          className="rounded-3xl p-6 md:p-8 mb-8 border"
          style={{
            background: `linear-gradient(135deg, ${tier.color}22, ${tier.color}08)`,
            borderColor: `${tier.color}33`,
          }}
          data-testid="seller-tier-block"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full inline-flex items-center justify-center"
                style={{ background: tier.color, color: "#fff" }}
              >
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="eyebrow">Loyalty tier</div>
                <h2 className="heading-md mt-1">{tier.label}</h2>
                <div className="text-sm text-slate-600 mt-1">
                  Payout: T+{tier.payout_hold_days} days · Reserve: {Math.round(tier.reserve_pct * 100)}% held {tier.reserve_hold_days}d
                </div>
              </div>
            </div>
            <Link href="/seller/payouts" className="btn-ghost text-sm">
              View payout schedule <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="text-sm">
              <div className="font-bold mb-2">Perks at this tier</div>
              <ul className="space-y-1 text-slate-700">
                {(tier.perks || []).map((p: string) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: tier.color }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-sm">
              <div className="font-bold mb-2">Your metrics</div>
              <div className="space-y-1 text-slate-700">
                <div>Delivered orders · <strong>{metrics.delivered_orders ?? 0}</strong></div>
                <div>Return rate · <strong>{Math.round((metrics.return_rate ?? 0) * 100)}%</strong></div>
                <div>Average rating · <strong>{(metrics.avg_rating ?? 0).toFixed(1)}</strong> ({metrics.review_count ?? 0} reviews)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/seller/products/new"
          className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-violet-400 hover:shadow-md transition"
          data-testid="quick-add-product"
        >
          <Package className="w-7 h-7 text-violet-700 mb-4" />
          <div className="heading-sm">Add a new product</div>
          <div className="text-sm text-slate-600 mt-1">Reach 12,000+ global shoppers</div>
          <div className="mt-4 inline-flex items-center gap-1 text-violet-700 font-bold text-sm group-hover:gap-2 transition-all">
            Create listing <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/seller/orders"
          className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-violet-400 hover:shadow-md transition"
        >
          <ShoppingCart className="w-7 h-7 text-violet-700 mb-4" />
          <div className="heading-sm">Manage orders</div>
          <div className="text-sm text-slate-600 mt-1">Track shipments, view fulfilment status</div>
          <div className="mt-4 inline-flex items-center gap-1 text-violet-700 font-bold text-sm group-hover:gap-2 transition-all">
            Open orders <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}

function KpiTile({ icon: Icon, label, value, href, color }: any) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition"
      data-testid={`kpi-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className={`inline-flex w-9 h-9 rounded-full items-center justify-center ${color} mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="font-heading text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </Link>
  );
}
