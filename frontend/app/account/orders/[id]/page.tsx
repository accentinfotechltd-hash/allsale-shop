"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useApp } from "@/components/providers";
import { convertPriceNZD, formatPrice } from "@/lib/utils";
import { ChevronLeft, Loader2, Package, Truck } from "lucide-react";

export default function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currency, rates, symbol } = useApp();
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.order(id).then(setOrder).catch((e) => setError(e?.message || "Could not load order"));
  }, [id]);

  const fmt = (nzd: number) => {
    const c = rates ? convertPriceNZD(nzd, currency, rates.rates) : nzd;
    return formatPrice(c, currency, symbol);
  };

  if (error) return <div className="py-12 text-center text-slate-500">{error}</div>;
  if (!order) return <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const items = order.items || [];

  return (
    <div data-testid={`order-detail-${id}`}>
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to orders
      </Link>
      <h1 className="heading-md mb-1">Order #{order.id || id}</h1>
      <div className="text-sm text-slate-500 mb-8">
        Placed {order.created_at ? new Date(order.created_at).toLocaleString("en-NZ") : "—"} · Status: <span className="font-bold uppercase">{order.status}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.length === 0 && <div className="text-slate-500">No items in this order.</div>}
          {items.map((it: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4">
              {it.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={it.image} alt={it.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-bold text-slate-900 line-clamp-2">{it.name}</div>
                <div className="text-xs text-slate-500 mt-1">Qty {it.quantity}</div>
              </div>
              <div className="font-heading font-extrabold text-lg whitespace-nowrap">
                {fmt((it.unit_price_nzd || it.price_nzd || 0) * (it.quantity || 1))}
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 self-start">
          <div className="heading-sm">Summary</div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-bold">{fmt(order.subtotal_nzd || 0)}</span></div>
            {!!order.shipping_nzd && <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span className="font-bold">{fmt(order.shipping_nzd)}</span></div>}
            {!!order.discount_nzd && <div className="flex justify-between text-emerald-700"><span>Discount</span><span className="font-bold">-{fmt(order.discount_nzd)}</span></div>}
            <div className="border-t pt-2 flex justify-between text-base"><span className="font-bold">Total</span><span className="font-heading font-extrabold">{fmt(order.total_nzd || 0)}</span></div>
          </div>

          {order.tracking_number && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm"><Truck className="w-4 h-4" /> Tracking</div>
              <div className="text-xs text-slate-600 mt-1">
                {order.courier_name || "Shiprocket"} · <code className="font-mono">{order.tracking_number}</code>
              </div>
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-3 btn-secondary !py-1.5 !px-3 text-xs inline-flex">
                  Track shipment
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
