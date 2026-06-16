"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";

const BUSINESS_TYPES = [
  { value: "private_limited", label: "Private Limited Company", id_field: "cin", id_label: "CIN (21 chars)" },
  { value: "llp", label: "Limited Liability Partnership", id_field: "llpin", id_label: "LLPIN (AAA-1234)" },
  { value: "opc", label: "One Person Company", id_field: "cin", id_label: "CIN (21 chars)" },
];

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user, token, bootstrapped } = useApp();
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0].value);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [cin, setCin] = useState("");
  const [llpin, setLlpin] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    if (!bootstrapped) return;
    if (!token) {
      router.replace(`/login?next=/become-seller`);
      return;
    }
    (async () => {
      try {
        const s = await api.sellerStatus();
        if (s?.status && s.status !== "not_seller") {
          router.replace("/seller");
          return;
        }
      } catch {}
      setEmail(user?.email || "");
      setContactName(user?.full_name || "");
      setChecking(false);
    })();
  }, [bootstrapped, token, router, user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const business: any = {
      business_type: businessType,
      company_name: companyName,
      contact_name: contactName,
      contact_phone: contactPhone || phone,
      email,
      phone,
      gstin,
      pan,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      state,
      pincode,
      country: "IN",
    };
    if (businessType === "llp") business.llpin = llpin;
    else business.cin = cin;

    try {
      await api.sellerUpgrade(business);
      toast.success("Welcome aboard! Upload your KYC docs next.");
      router.push("/seller/onboarding");
    } catch (e: any) {
      toast.error(e?.message || "Could not register seller account");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="container-px py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
      </div>
    );
  }

  const current = BUSINESS_TYPES.find((b) => b.value === businessType)!;

  return (
    <div className="container-px py-10 md:py-16 max-w-3xl mx-auto" data-testid="become-seller-page">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-600 text-white mb-5">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="heading-lg">Sell on Allsale</h1>
        <p className="text-slate-600 mt-3 max-w-lg mx-auto">
          Reach 12,000+ global buyers in NZ, AU, US, UK and CA. India-based businesses with valid PAN & GSTIN are eligible.
        </p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-200 p-7 md:p-10 shadow-sm space-y-6">
        <Section title="Business basics">
          <Field label="Business type">
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="input"
              data-testid="bs-business-type"
            >
              {BUSINESS_TYPES.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Company / Brand name">
            <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="input" data-testid="bs-company" />
          </Field>
        </Section>

        <Section title="Tax IDs">
          <Field label="PAN (10 chars)">
            <input
              required
              maxLength={10}
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              className="input uppercase tracking-wider"
              data-testid="bs-pan"
            />
          </Field>
          <Field label="GSTIN (15 chars)">
            <input
              required
              maxLength={15}
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              className="input uppercase tracking-wider"
              data-testid="bs-gstin"
            />
          </Field>
          {current.id_field === "cin" ? (
            <Field label={current.id_label}>
              <input required maxLength={21} value={cin} onChange={(e) => setCin(e.target.value.toUpperCase())} className="input uppercase tracking-wider" data-testid="bs-cin" />
            </Field>
          ) : (
            <Field label={current.id_label}>
              <input required maxLength={8} value={llpin} onChange={(e) => setLlpin(e.target.value.toUpperCase())} className="input uppercase tracking-wider" data-testid="bs-llpin" />
            </Field>
          )}
        </Section>

        <Section title="Contact">
          <Field label="Contact name">
            <input required value={contactName} onChange={(e) => setContactName(e.target.value)} className="input" data-testid="bs-contact-name" />
          </Field>
          <Field label="Email">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" data-testid="bs-email" />
          </Field>
          <Field label="Phone">
            <input required type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" data-testid="bs-phone" />
          </Field>
        </Section>

        <Section title="Registered address (India)">
          <Field label="Address line 1" full>
            <input required value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="input" data-testid="bs-address1" />
          </Field>
          <Field label="Address line 2" full>
            <input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className="input" data-testid="bs-address2" />
          </Field>
          <Field label="City">
            <input required value={city} onChange={(e) => setCity(e.target.value)} className="input" data-testid="bs-city" />
          </Field>
          <Field label="State">
            <input required value={state} onChange={(e) => setState(e.target.value)} className="input" data-testid="bs-state" />
          </Field>
          <Field label="PIN code">
            <input required maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} className="input" data-testid="bs-pincode" />
          </Field>
        </Section>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <p className="text-[11px] text-slate-500 max-w-md">
            You&apos;ll upload ID & business proof next. KYC is usually reviewed within 24–48h.
          </p>
          <button type="submit" disabled={submitting} className="btn-primary px-7 py-3" data-testid="bs-submit">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create seller account"}
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-slate-600 mt-5">
        Already a seller? <Link href="/seller" className="font-bold text-primary hover:underline">Go to your portal →</Link>
      </p>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
          background: #fff;
        }
        .input:focus {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px #ddd6fe;
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
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
