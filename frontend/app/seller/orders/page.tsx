"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2, Package, ExternalLink, Download } from "lucide-react";
import { BACKEND_URL } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => {
    api.sellerOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const csvUrl = `${BACKEND_URL}/api/seller/orders.csv`;

  if (orders === null) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div data-testid="seller-orders-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg">Orders</h1>
          <p className="text-slate-600 mt-1 text-sm">{orders.length} order{orders.length === 1 ? "" : "s"}</p>
        </div>
        {orders.length > 0 && (
          <a
            href={csvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !py-2 !px-4 text-sm"
            data-testid="seller-orders-csv"
          >
            <Download className="w-4 h-4" /> CSV export
          </a>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h2 className="heading-sm">No orders yet</h2>
          <p className="text-slate-500 mt-2 mb-6">Orders for your products will appear here. Shiprocket auto-updates shipment status.</p>
          <Link href="/seller/products/new" className="btn-primary text-sm">Add a product</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Buyer</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Tracking</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o: any) => {
                const status = (o.status || o.payment_status || "pending").toLowerCase();
                const id = o.id || o.order_id || o._id;
                return (
                  <tr key={id} data-testid={`seller-order-row-${id}`}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{id?.slice(-12)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {o.created_at ? new Date(o.created_at).toLocaleDateString("en-NZ") : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{o.buyer_name || o.shipping_address?.full_name || "—"}</div>
                      <div className="text-xs text-slate-500">{o.shipping_address?.country || o.buyer_country || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">NZ${(o.total_nzd ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.tracking_number ? (
                        <a href={o.tracking_url || "#"} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline inline-flex items-center gap-1 font-mono">
                          {o.tracking_number} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">Pending pickup</span>
                      )}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
