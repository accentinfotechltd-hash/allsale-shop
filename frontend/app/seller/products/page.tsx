"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Product } from "@/lib/api";
import { Loader2, Plus, Edit, Trash2, Package } from "lucide-react";
import { toast } from "sonner";

export default function SellerProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    try {
      const p = await api.sellerProducts();
      setProducts(p || []);
    } catch (e: any) {
      toast.error(e?.message || "Could not load products");
      setProducts([]);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.sellerDeleteProduct(id);
      toast.success("Product deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Could not delete");
    } finally {
      setDeleting(null);
    }
  };

  if (products === null) return <div className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div data-testid="seller-products-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg">Products</h1>
          <p className="text-slate-600 mt-1 text-sm">{products.length} listing{products.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/seller/products/new" className="btn-primary" data-testid="new-product-btn">
          <Plus className="w-4 h-4" /> New product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center" data-testid="seller-products-empty">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h2 className="heading-sm">No products yet</h2>
          <p className="text-slate-500 mt-2 mb-6">Create your first listing to start selling globally.</p>
          <Link href="/seller/products/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Add a product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} data-testid={`seller-product-row-${p.id}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-700">{p.category}</td>
                  <td className="px-4 py-3 text-right font-bold">NZ${p.price_nzd.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    {p.in_stock ? (
                      <span className="text-emerald-700 font-bold">{p.stock_count}</span>
                    ) : (
                      <span className="text-slate-400">out</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/seller/products/${p.id}/edit`}
                      className="inline-flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                      data-testid={`product-edit-${p.id}`}
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => remove(p.id, p.name)}
                      disabled={deleting === p.id}
                      className="inline-flex p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 disabled:opacity-50"
                      data-testid={`product-delete-${p.id}`}
                      aria-label="Delete"
                    >
                      {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
