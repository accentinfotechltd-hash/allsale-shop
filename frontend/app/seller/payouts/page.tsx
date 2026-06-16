"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Wallet, Clock, CheckCircle2, Lock } from "lucide-react";

export default function SellerPayouts() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.sellerPayouts().then(setData).catch(() => setData({ payouts: [] }));
  }, []);

  if (!data) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const fmt = (n: number) => `NZ$${(n ?? 0).toFixed(2)}`;

  return (
    <div data-testid="seller-payouts-page">
      <h1 className="heading-lg mb-2">Payouts</h1>
      <p className="text-slate-600 mb-8">Track held, available and paid earnings. Payouts are processed on your tier&apos;s schedule.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Tile icon={Wallet} label="Available" value={fmt(data.available_nzd)} color="text-emerald-700 bg-emerald-50" testid="payouts-available" />
        <Tile icon={Clock} label="Held (pending)" value={fmt(data.held_nzd)} color="text-amber-700 bg-amber-50" testid="payouts-held" />
        <Tile icon={Lock} label="Reserve held" value={fmt(data.reserve_held_nzd)} color="text-violet-700 bg-violet-50" testid="payouts-reserve" />
        <Tile icon={CheckCircle2} label="Paid out" value={fmt(data.paid_out_nzd)} color="text-blue-700 bg-blue-50" testid="payouts-paid" />
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-6 grid sm:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="eyebrow mb-1">Lifetime earnings</div>
          <div className="font-heading text-2xl font-extrabold">{fmt(data.lifetime_earnings_nzd)}</div>
        </div>
        <div>
          <div className="eyebrow mb-1">Pending</div>
          <div className="font-heading text-2xl font-extrabold">{fmt(data.pending_nzd)}</div>
        </div>
        <div>
          <div className="eyebrow mb-1">Next release</div>
          <div className="font-heading text-lg font-extrabold">
            {data.next_release_at ? new Date(data.next_release_at).toLocaleDateString("en-NZ", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
          </div>
        </div>
      </div>

      <h2 className="heading-sm mb-4">Recent payouts</h2>
      {(!data.payouts || data.payouts.length === 0) ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500" data-testid="payouts-empty">
          No payouts yet. Once your first orders ship, earnings will accrue here.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.payouts.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-slate-700">{p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-NZ") : new Date(p.created_at).toLocaleDateString("en-NZ")}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.id?.slice(-10)}</td>
                  <td className="px-4 py-3 text-right font-bold">{fmt(p.amount_nzd)}</td>
                  <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Tile({ icon: Icon, label, value, color, testid }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5" data-testid={testid}>
      <div className={`inline-flex w-9 h-9 rounded-full items-center justify-center ${color} mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="font-heading text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
