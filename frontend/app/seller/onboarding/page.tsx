"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, Upload, CheckCircle2, ShieldCheck, FileText, FileBadge } from "lucide-react";
import { toast } from "sonner";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const s = await api.sellerStatus();
      setStatus(s);
    } catch {}
  };

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  const upload = async (type: "id_proof" | "business_proof", file: File | null) => {
    if (!file) return;
    setUploading(type);
    try {
      await api.sellerUploadDocument(type, file);
      toast.success(`${type === "id_proof" ? "ID" : "Business"} proof uploaded`);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const bothDone = status?.has_id_proof && status?.has_business_proof;

  return (
    <div data-testid="seller-onboarding">
      <h1 className="heading-lg mb-2">KYC documents</h1>
      <p className="text-slate-600 mb-8">
        Upload an ID proof (Aadhaar / Passport / Driver License) and a business proof (PAN, GSTIN cert., MSME) to activate your store.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <UploadCard
          icon={FileText}
          title="ID proof"
          description="Aadhaar, Passport, Voter ID or Driver License (front side)"
          done={status?.has_id_proof}
          uploading={uploading === "id_proof"}
          onPick={(f) => upload("id_proof", f)}
          testid="upload-id-proof"
        />
        <UploadCard
          icon={FileBadge}
          title="Business proof"
          description="PAN card, GSTIN certificate, MSME / Udyam, or incorporation cert."
          done={status?.has_business_proof}
          uploading={uploading === "business_proof"}
          onPick={(f) => upload("business_proof", f)}
          testid="upload-business-proof"
        />
      </div>

      {bothDone && status?.status === "pending_review" && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 flex items-start gap-3" data-testid="kyc-pending-review">
          <ShieldCheck className="w-6 h-6 text-blue-700 mt-0.5" />
          <div>
            <div className="font-bold text-blue-900">Documents submitted</div>
            <div className="text-sm text-blue-800/90 mt-1">
              Our team is reviewing your application. {status.sla_days_remaining != null && `Expected within ${status.sla_days_remaining} day${status.sla_days_remaining === 1 ? "" : "s"}.`} We&apos;ll email you the moment it&apos;s approved.
            </div>
          </div>
        </div>
      )}

      {status?.status === "approved" || status?.status === "auto_verified" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-emerald-900">You&apos;re verified — ready to sell.</div>
            <button onClick={() => router.push("/seller/products/new")} className="mt-3 btn-primary text-sm">
              Add your first product
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UploadCard({ icon: Icon, title, description, done, uploading, onPick, testid }: any) {
  return (
    <label
      className={`block bg-white rounded-2xl border-2 border-dashed p-6 cursor-pointer transition ${
        done ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 hover:border-violet-400"
      }`}
      data-testid={testid}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full inline-flex items-center justify-center ${done ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>
          {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="font-bold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500 mt-1">{description}</div>
          {done ? (
            <div className="text-xs text-emerald-700 font-bold mt-3 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
            </div>
          ) : (
            <div className="text-xs font-bold text-violet-700 mt-3 inline-flex items-center gap-1">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Uploading…" : "Click to upload"}
            </div>
          )}
        </div>
      </div>
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] || null)}
        disabled={!!uploading}
      />
    </label>
  );
}
