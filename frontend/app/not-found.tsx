import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-px py-24 text-center" data-testid="not-found-page">
      <div className="text-7xl font-heading font-extrabold text-primary mb-4">404</div>
      <h1 className="heading-md">This page wandered off the trade route</h1>
      <p className="text-slate-600 mt-3 max-w-md mx-auto">
        We couldn&apos;t find what you were looking for. Try the homepage or browse the bazaar.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/products" className="btn-secondary">Browse products</Link>
      </div>
    </div>
  );
}
