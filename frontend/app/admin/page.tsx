"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Store, ShoppingCart, Wallet, Clock, Loader2 } from "lucide-react";

export default function AdminOverview() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.adminOverview().then(setData).catch((e) => setError(e?.message || "Could not load"));
  }, []);

  if (error) return <div className="py-12 text-center text-slate-500">{error}</div>;
  if (!data) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div data-testid="admin-overview">
      <h1 className="heading-lg mb-2">Operations overview</h1>
      <p className="text-slate-600 mb-8">Live counts across the platform.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Tile icon={Users} label="Buyers" value={data.total_users ?? data.users ?? 0} color="text-blue-700 bg-blue-50" />
        <Tile icon={Store} label="Sellers" value={data.total_sellers ?? data.sellers ?? 0} color="text-violet-700 bg-violet-50" />
        <Tile icon={ShoppingCart} label="Orders" value={data.total_orders ?? data.orders ?? 0} color="text-amber-700 bg-amber-50" />
        <Tile icon={Wallet} label="Revenue (NZD)" value={`$${(data.gmv_nzd ?? data.revenue_nzd ?? 0).toLocaleString()}`} color="text-emerald-700 bg-emerald-50" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Pending KYC reviews" value={data.pending_sellers ?? data.pending_kyc ?? 0} icon={Clock} cta="Review queue" href="/admin/sellers?tab=pending" />
        <Card title="Payouts to release" value={data.payouts_available_nzd ? `$${(data.payouts_available_nzd).toLocaleString()}` : "0"} icon={Wallet} cta="Open payouts" href="/admin/payouts" />
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className={`inline-flex w-9 h-9 rounded-full items-center justify-center ${color} mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="font-heading text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function Card({ title, value, icon: Icon, cta, href }: any) {
  return (
    <a href={href} className="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5 text-slate-700" />
        <div className="font-bold text-slate-900">{title}</div>
      </div>
      <div className="font-heading text-3xl font-extrabold">{value}</div>
      <div className="mt-3 text-xs font-bold text-primary">{cta} →</div>
    </a>
  );
}
