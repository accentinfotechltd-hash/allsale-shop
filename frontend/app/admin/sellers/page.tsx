"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAdmin, canKyc } from "@/components/admin/auth";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

function SellersInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const { admin } = useAdmin();
  const tab = sp.get("tab") === "pending" ? "pending" : "all";

  const [all, setAll] = useState<any[] | null>(null);
  const [pending, setPending] = useState<any[] | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const [a, p] = await Promise.all([
      api.adminSellers().catch(() => []),
      api.adminSellersPending().catch(() => []),
    ]);
    setAll(a);
    setPending(p);
  };

  useEffect(() => { load(); }, []);

  const approve = async (user_id: string) => {
    setBusy(user_id);
    try {
      await api.adminApproveSeller(user_id);
      toast.success("Seller approved");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Could not approve");
    } finally { setBusy(null); }
  };

  const reject = async (user_id: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setBusy(user_id);
    try {
      await api.adminRejectSeller(user_id, rejectReason.trim());
      toast.success("Seller rejected");
      setRejectingId(null);
      setRejectReason("");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Could not reject");
    } finally { setBusy(null); }
  };

  if (all === null || pending === null) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const list = tab === "pending" ? pending : all;

  return (
    <div data-testid="admin-sellers-page">
      <h1 className="heading-lg mb-2">Sellers</h1>
      <p className="text-slate-600 mb-6">{all.length} total · {pending.length} pending review</p>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {[
          { id: "all", label: `All (${all.length})` },
          { id: "pending", label: `Pending KYC (${pending.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => router.push(`/admin/sellers${t.id === "pending" ? "?tab=pending" : ""}`)}
            data-testid={`sellers-tab-${t.id}`}
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
          {tab === "pending" ? "No sellers waiting for review." : "No sellers yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((s: any) => {
            const userId = s.user_id || s.id;
            const status = s.verification_status || s.status || "unknown";
            return (
              <div key={userId} className="bg-white rounded-2xl border border-slate-200 p-5" data-testid={`seller-row-${userId}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900">{s.company_name || s.full_name || s.email}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.email} · {s.city || "—"}, {s.state || "—"}</div>
                    <div className="flex flex-wrap gap-3 mt-3 text-[11px] font-bold text-slate-600">
                      {s.pan && <span>PAN: <code className="font-mono">{s.pan}</code></span>}
                      {s.gstin && <span>GSTIN: <code className="font-mono">{s.gstin}</code></span>}
                      {s.cin && <span>CIN: <code className="font-mono">{s.cin}</code></span>}
                      {s.llpin && <span>LLPIN: <code className="font-mono">{s.llpin}</code></span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={status} />
                    {(status === "pending_review" || status === "pending_documents") && canKyc(admin?.role) && (
                      <>
                        <button
                          onClick={() => approve(userId)}
                          disabled={busy === userId}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full px-3 py-2 disabled:opacity-50"
                          data-testid={`seller-approve-${userId}`}
                        >
                          {busy === userId ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => { setRejectingId(userId); setRejectReason(""); }}
                          className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-full px-3 py-2 border border-rose-200"
                          data-testid={`seller-reject-${userId}`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {rejectingId === userId && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection (visible to the seller)"
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                      data-testid={`reject-reason-${userId}`}
                    />
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => reject(userId)} className="btn-primary !py-2 !px-4 text-sm" disabled={busy === userId}>
                        Confirm reject
                      </button>
                      <button onClick={() => setRejectingId(null)} className="btn-secondary !py-2 !px-4 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; label: string; Icon: any }> = {
    approved: { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Approved", Icon: CheckCircle2 },
    auto_verified: { bg: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Auto-verified", Icon: CheckCircle2 },
    pending_review: { bg: "bg-blue-100 text-blue-800 border-blue-200", label: "Pending review", Icon: Clock },
    pending_documents: { bg: "bg-amber-100 text-amber-900 border-amber-200", label: "Awaiting docs", Icon: Clock },
    rejected: { bg: "bg-rose-100 text-rose-800 border-rose-200", label: "Rejected", Icon: XCircle },
  };
  const s = map[status] || { bg: "bg-slate-100 text-slate-700 border-slate-200", label: status, Icon: Clock };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${s.bg}`}>
      <s.Icon className="w-3 h-3" /> {s.label}
    </span>
  );
}

export default function AdminSellers() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
      <SellersInner />
    </Suspense>
  );
}
