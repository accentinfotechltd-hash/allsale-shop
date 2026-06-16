"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAdmin, canPayouts } from "@/components/admin/auth";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

export default function AdminPayouts() {
  const { admin } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<"available" | "paid" | "held">("available");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const r = await api.adminPayouts(tab).catch(() => ({ payouts: [] }));
    setData(r);
  };

  useEffect(() => { load(); }, [tab]);

  if (!data) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  const list = data.payouts || data || [];

  const markPaid = async (id: string) => {
    setBusy(id);
    try {
      await api.adminMarkPayoutPaid(id);
      toast.success("Payout marked as paid");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally { setBusy(null); }
  };

  return (
    <div data-testid="admin-payouts-page">
      <div className="flex items-center gap-3 mb-2">
        <Wallet className="w-6 h-6 text-emerald-600" />
        <h1 className="heading-lg">Payouts</h1>
      </div>
      <p className="text-slate-600 mb-6">Manage seller payouts. Only owner & manager roles can mark paid.</p>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {[
          { id: "available" as const, label: "Available" },
          { id: "held" as const, label: "Held" },
          { id: "paid" as const, label: "Paid" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            data-testid={`payouts-tab-${t.id}`}
            className={`px-4 py-3 -mb-px border-b-2 text-sm font-bold transition ${
              tab === t.id ? "text-primary border-primary" : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          No {tab} payouts.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Seller</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((p: any) => (
                <tr key={p.id} data-testid={`payout-row-${p.id}`}>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{p.seller_name || p.company_name || p.user_id}</div>
                    <div className="text-xs text-slate-500">{p.seller_email || ""}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">NZ${(p.amount_nzd ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("en-NZ") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tab === "available" && canPayouts(admin?.role) && (
                      <button
                        onClick={() => markPaid(p.id)}
                        disabled={busy === p.id}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full px-3 py-2 disabled:opacity-50"
                        data-testid={`mark-paid-${p.id}`}
                      >
                        {busy === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark paid"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
