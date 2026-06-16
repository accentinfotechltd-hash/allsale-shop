"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Package } from "lucide-react";
import { useApp } from "@/components/providers";
import { api } from "@/lib/api";

function SuccessInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const sessionId = sp.get("session_id");
  const { refreshCart, bootstrapped, token } = useApp();
  const [status, setStatus] = useState<"checking" | "paid" | "pending" | "error">("checking");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    if (!bootstrapped || !token) return;

    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const r = await api.checkoutStatus(sessionId);
        if (r.payment_status === "paid" || r.status === "complete") {
          setStatus("paid");
          setOrderId(r.order_id || null);
          await refreshCart();
        } else if (attempts < 8) {
          setTimeout(poll, 1500);
        } else {
          setStatus("pending");
        }
      } catch {
        if (attempts < 4) setTimeout(poll, 1500);
        else setStatus("error");
      }
    };
    poll();
  }, [sessionId, bootstrapped, token, refreshCart]);

  return (
    <div className="container-px py-20 text-center max-w-xl mx-auto" data-testid="checkout-success-page">
      {status === "checking" && (
        <>
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <h1 className="heading-md mt-6">Confirming your payment…</h1>
          <p className="text-slate-600 mt-2">This usually takes a few seconds.</p>
        </>
      )}
      {status === "paid" && (
        <>
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="heading-lg">Thank you for shopping the bazaar 🎉</h1>
          <p className="text-slate-600 mt-3">
            Your order has been confirmed. We&apos;ll send tracking details to your email as soon as the seller ships it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/account/orders" className="btn-primary"><Package className="w-4 h-4" /> View my orders</Link>
            <Link href="/products" className="btn-secondary">Keep shopping</Link>
          </div>
          {orderId && <div className="text-xs text-slate-500 mt-6">Order ID: <code>{orderId}</code></div>}
        </>
      )}
      {status === "pending" && (
        <>
          <h1 className="heading-md">Payment is still processing</h1>
          <p className="text-slate-600 mt-3">It can take a minute. Check &quot;My orders&quot; for the latest status.</p>
          <Link href="/account/orders" className="btn-primary mt-6 inline-flex">View orders</Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="heading-md">We couldn&apos;t confirm your order</h1>
          <p className="text-slate-600 mt-3">If you were charged, please contact support — we&apos;ll sort it out within hours.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <a href="mailto:hello@allsale.co.nz" className="btn-primary">Contact support</a>
            <Link href="/cart" className="btn-secondary">Back to cart</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="container-px py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
      <SuccessInner />
    </Suspense>
  );
}
