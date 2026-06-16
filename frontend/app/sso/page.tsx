"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useApp } from "@/components/providers";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

function SsoInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { setAuth } = useApp();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = sp.get("token");
    const target = sp.get("target") || "/";

    if (!token) {
      toast.error("SSO link is missing the token");
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        // Backend exchanges the classifieds JWT for a shop JWT.
        const res = await apiFetch<{ access_token: string; user?: any }>(`/api/auth/sso/callback`, {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        if (!res?.access_token) throw new Error("No token returned");
        setAuth(res.access_token, res.user);
        // Sanitise target: only allow internal paths
        const safeTarget = target.startsWith("/") && !target.startsWith("//") ? target : "/";
        router.replace(safeTarget);
      } catch (e: any) {
        toast.error(e?.message || "SSO sign-in failed");
        router.replace("/login");
      }
    })();
  }, [router, setAuth, sp]);

  return (
    <div className="container-px py-32 text-center" data-testid="sso-page">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      <div className="mt-4 text-slate-600 font-semibold">Signing you in from Allsale Classifieds…</div>
    </div>
  );
}

export default function SsoPage() {
  return (
    <Suspense fallback={<div className="container-px py-32 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
      <SsoInner />
    </Suspense>
  );
}
