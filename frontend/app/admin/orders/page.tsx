"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => {
    api.adminOrders(100).then(setOrders).catch(() => setOrders([]));
  }, []);

  if (orders === null) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div data-testid="admin-orders-page">
      <h1 className="heading-lg mb-2">Orders</h1>
      <p className="text-slate-600 mb-6">Most recent {orders.length} orders across all sellers.</p>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Buyer</th>
              <th className="px-4 py-3 text-left">Seller</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o: any) => {
              const status = (o.status || o.payment_status || "pending").toLowerCase();
              const id = o.id || o.order_id;
              return (
                <tr key={id} data-testid={`admin-order-row-${id}`}>
                  <td className="px-4 py-3 font-mono text-xs">{id?.slice(-12)}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-900">{o.buyer_email || o.user_email || "—"}</div>
                    <div className="text-xs text-slate-500">{o.shipping_address?.country || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{o.seller_name || o.seller_id || "—"}</td>
                  <td className="px-4 py-3 text-right font-bold">NZ${(o.total_nzd ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {o.created_at ? new Date(o.created_at).toLocaleString("en-NZ", { day: "2-digit", month: "short" }) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
