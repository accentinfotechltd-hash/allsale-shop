import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancel() {
  return (
    <div className="container-px py-20 text-center max-w-xl mx-auto" data-testid="checkout-cancel-page">
      <div className="mx-auto w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-6">
        <XCircle className="w-10 h-10 text-rose-600" />
      </div>
      <h1 className="heading-md">Checkout cancelled</h1>
      <p className="text-slate-600 mt-3">No worries — your cart is still saved. You can review it and try again anytime.</p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link href="/cart" className="btn-primary">Back to cart</Link>
        <Link href="/products" className="btn-secondary">Keep shopping</Link>
      </div>
    </div>
  );
}
