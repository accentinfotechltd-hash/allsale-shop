"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Settings,
  Loader2,
  ShieldCheck,
  Clock,
  XCircle,
  Store,
} from "lucide-react";

const NAV = [
  { href: "/seller", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/orders", label: "Orders", icon: ShoppingCart },
  { href: "/seller/payouts", label: "Payouts", icon: Wallet },
  { href: "/seller/settings", label: "Settings", icon: Settings },
];

const STATUS_LABEL: Record<string, { label: string; tone: string; icon: any }> = {
  pending_documents: { label: "Action needed: upload KYC documents", tone: "bg-amber-100 text-amber-900 border-amber-200", icon: Clock },
  pending_review: { label: "Under review", tone: "bg-blue-100 text-blue-900 border-blue-200", icon: Clock },
  approved: { label: "Verified seller", tone: "bg-emerald-100 text-emerald-900 border-emerald-200", icon: ShieldCheck },
  auto_verified: { label: "Auto-verified", tone: "bg-emerald-100 text-emerald-900 border-emerald-200", icon: ShieldCheck },
  rejected: { label: "Application rejected", tone: "bg-rose-100 text-rose-900 border-rose-200", icon: XCircle },
};

export default function SellerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, bootstrapped, user } = useApp();
  const [status, setStatus] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bootstrapped) return;
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    (async () => {
      try {
        const [s, m] = await Promise.all([
          api.sellerStatus().catch(() => ({ status: "not_seller" })),
          api.sellerMe().catch(() => null),
        ]);
        setStatus(s);
        setMe(m);
      } finally {
        setLoading(false);
      }
    })();
  }, [bootstrapped, token, router, pathname]);

  if (!bootstrapped || loading) {
    return (
      <div className="container-px py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
      </div>
    );
  }

  // Not a seller yet → redirect to /become-seller
  if (status?.status === "not_seller") {
    if (typeof window !== "undefined") {
      router.replace("/become-seller");
    }
    return (
      <div className="container-px py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
      </div>
    );
  }

  const statusInfo = STATUS_LABEL[status?.status] || { label: status?.status, tone: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock };
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container-px py-6 md:py-8" data-testid="seller-layout">
      {/* status banner */}
      {status?.status !== "approved" && status?.status !== "auto_verified" && (
        <div className={`mb-6 rounded-2xl border p-4 flex items-start gap-3 ${statusInfo.tone}`} data-testid="seller-status-banner">
          <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">{statusInfo.label}</div>
            {status?.status === "pending_documents" && (
              <div className="text-sm mt-1 opacity-90">
                Upload your ID proof and business proof to start selling.{" "}
                <Link href="/seller/onboarding" className="underline font-bold" data-testid="upload-kyc-link">
                  Upload now →
                </Link>
              </div>
            )}
            {status?.status === "pending_review" && (
              <div className="text-sm mt-1 opacity-90">
                We&apos;re reviewing your documents. {status.sla_days_remaining != null && `${status.sla_days_remaining} day${status.sla_days_remaining === 1 ? "" : "s"} remaining.`}
              </div>
            )}
            {status?.status === "rejected" && status?.rejection_reason && (
              <div className="text-sm mt-1 opacity-90">Reason: {status.rejection_reason}</div>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10">
        <aside>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 lg:sticky lg:top-32">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-700 inline-flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 truncate" data-testid="seller-company-name">
                  {me?.company_name || user?.full_name || "Your store"}
                </div>
                <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-violet-700">
                  Seller portal
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {NAV.map((n) => {
                const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    data-testid={`seller-nav-${n.label.toLowerCase()}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      active ? "bg-violet-50 text-violet-700" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <n.icon className="w-4 h-4" /> {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href="/account" className="block text-xs text-slate-500 hover:text-slate-900 transition">
                ← Back to shopper account
              </Link>
            </div>
          </div>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
