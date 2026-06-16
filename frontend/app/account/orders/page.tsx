"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useApp } from "@/components/providers";
import { convertPriceNZD, formatPrice } from "@/lib/utils";
import { Package, Loader2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function OrdersPage() {
  const { currency, rates, symbol } = useApp();
  const [orders, setOrders] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .orders()
      .then(setOrders)
      .catch((e) => setError(e?.message || "Could not load orders"));
  }, []);

  const fmt = (nzd: number) => {
    const c = rates ? convertPriceNZD(nzd, currency, rates.rates) : nzd;
    return formatPrice(c, currency, symbol);
  };

  if (orders === null && !error) {
    return <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></div>;
  }

  if (error || !orders) {
    return <div className="py-12 text-center text-slate-500">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-orders">
        <div className="w-16 h-16 rounded-full bg-orange-50 inline-flex items-center justify-center mb-4">
          <Package className="w-7 h-7 text-primary" />
        </div>
        <h2 className="heading-sm">No orders yet</h2>
        <p className="text-slate-500 mt-2 mb-6">Once you place an order it&apos;ll show up here with tracking.</p>
        <Link href="/products" className="btn-primary">Start shopping</Link>
      </div>
    );
  }

  return (
    <div data-testid="orders-page">
      <h1 className="heading-lg mb-6">Your orders</h1>
      <div className="space-y-4">
        {orders.map((o: any) => {
          const status = (o.status || o.payment_status || "pending").toLowerCase();
          const totalNzd = o.total_nzd ?? o.amount_nzd ?? o.subtotal_nzd ?? 0;
          const itemCount = o.items?.length || o.item_count || 0;
          const id = o.id || o.order_id || o._id;
          const created = o.created_at || o.placed_at;

          return (
            <div key={id} className="bg-white rounded-2xl border border-slate-200 p-5" data-testid={`order-row-${id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs tracking-wider uppercase font-bold text-slate-500">Order</div>
                  <div className="font-mono text-sm text-slate-900">{id}</div>
                  {created && (
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(created).toLocaleDateString("en-NZ", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                  {status}
                </span>
              </div>

              <div className="border-t mt-4 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-slate-600">
                  {itemCount} {itemCount === 1 ? "item" : "items"} · <span className="font-bold text-slate-900">{fmt(totalNzd)}</span>
                </div>
                <Link
                  href={`/account/orders/${id}`}
                  className="btn-secondary !py-1.5 !px-4 text-xs"
                  data-testid={`order-view-${id}`}
                >
                  View details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
