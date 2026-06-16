"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SellerSettings() {
  const [s, setS] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.sellerSettings().then(setS).catch(() => setS(null));
  }, []);

  if (!s) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  const set = (k: string, v: any) => setS({ ...s, [k]: v });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.sellerSettingsUpdate({
        store_display_name: s.store_display_name,
        store_logo_url: s.store_logo_url,
        store_banner_url: s.store_banner_url,
        store_bio: s.store_bio,
        contact_name: s.contact_name,
        contact_phone: s.contact_phone,
        support_email: s.support_email,
        bank_holder_name: s.bank_holder_name,
        bank_name: s.bank_name,
        bank_ifsc: s.bank_ifsc,
        vacation_mode: s.vacation_mode,
      });
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.message || "Could not save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="seller-settings-page">
      <h1 className="heading-lg mb-2">Settings</h1>
      <p className="text-slate-600 mb-8">Manage your store identity, contact and payout details.</p>

      <form onSubmit={submit} className="space-y-6" data-testid="settings-form">
        <Card title="Storefront">
          <Field label="Store display name">
            <input value={s.store_display_name || ""} onChange={(e) => set("store_display_name", e.target.value)} className="seller-input" data-testid="set-store-name" />
          </Field>
          <Field label="Store logo URL">
            <input type="url" value={s.store_logo_url || ""} onChange={(e) => set("store_logo_url", e.target.value)} className="seller-input" data-testid="set-store-logo" />
          </Field>
          <Field label="Store bio" full>
            <textarea rows={3} value={s.store_bio || ""} onChange={(e) => set("store_bio", e.target.value)} className="seller-input" data-testid="set-store-bio" />
          </Field>
        </Card>

        <Card title="Contact">
          <Field label="Contact name">
            <input value={s.contact_name || ""} onChange={(e) => set("contact_name", e.target.value)} className="seller-input" data-testid="set-contact-name" />
          </Field>
          <Field label="Contact phone">
            <input value={s.contact_phone || ""} onChange={(e) => set("contact_phone", e.target.value)} className="seller-input" data-testid="set-contact-phone" />
          </Field>
          <Field label="Support email (for buyers)">
            <input type="email" value={s.support_email || ""} onChange={(e) => set("support_email", e.target.value)} className="seller-input" data-testid="set-support-email" />
          </Field>
        </Card>

        <Card title="Bank account (payouts)">
          <Field label="Account holder name">
            <input value={s.bank_holder_name || ""} onChange={(e) => set("bank_holder_name", e.target.value)} className="seller-input" data-testid="set-bank-holder" />
          </Field>
          <Field label="Bank name">
            <input value={s.bank_name || ""} onChange={(e) => set("bank_name", e.target.value)} className="seller-input" data-testid="set-bank-name" />
          </Field>
          <Field label="IFSC code">
            <input value={s.bank_ifsc || ""} onChange={(e) => set("bank_ifsc", e.target.value.toUpperCase())} className="seller-input uppercase tracking-wider" data-testid="set-bank-ifsc" />
          </Field>
          {s.bank_account_last4 && (
            <Field label="Linked account">
              <div className="text-sm text-slate-600 pt-2.5">•••• {s.bank_account_last4}</div>
            </Field>
          )}
        </Card>

        <Card title="Availability">
          <Field full label="Vacation mode (pause your storefront)">
            <label className="inline-flex items-center gap-3 mt-2">
              <input type="checkbox" checked={!!s.vacation_mode} onChange={(e) => set("vacation_mode", e.target.checked)} className="w-4 h-4" data-testid="set-vacation" />
              <span className="text-sm text-slate-700">
                Hide my products from search and disable buying. Existing orders are unaffected.
              </span>
            </label>
          </Field>
        </Card>

        <button type="submit" disabled={submitting} className="btn-primary px-7 py-3" data-testid="settings-submit">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save settings</>}
        </button>
      </form>

      <style jsx>{`
        :global(.seller-input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
          background: #fff;
        }
        :global(.seller-input:focus) {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px #ddd6fe;
        }
      `}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
      <div className="eyebrow mb-4">{title}</div>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-bold text-slate-600 block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
