"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";
import { toast } from "sonner";

function GoogleCallbackInner() {
  const router = useRouter();
  const { setAuth } = useApp();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // session_id is delivered via URL fragment: /auth/google-callback#session_id=xxx
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      toast.error("Google sign-in failed: missing session");
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const res = await api.googleSession(sessionId);
        if (!res?.access_token) throw new Error("No token returned from server");
        setAuth(res.access_token);
        // Clean up the hash
        window.history.replaceState({}, document.title, "/account");
        toast.success("Welcome!");
        router.replace("/account");
      } catch (e: any) {
        toast.error(e?.message || "Google sign-in failed");
        router.replace("/login");
      }
    })();
  }, [router, setAuth]);

  return (
    <div className="container-px py-32 text-center" data-testid="google-callback-page">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
      <div className="mt-4 text-slate-600 font-semibold">Signing you in…</div>
    </div>
  );
}

export default function GoogleCallback() {
  return (
    <Suspense fallback={<div className="container-px py-32 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>}>
      <GoogleCallbackInner />
    </Suspense>
  );
}
