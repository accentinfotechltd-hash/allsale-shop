"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/seller/product-form";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.product(id).then(setProduct).catch((e) => setError(e?.message || "Not found"));
  }, [id]);

  if (error) return <div className="py-12 text-center text-slate-500">{error}</div>;
  if (!product) return <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div data-testid={`seller-edit-product-${id}`}>
      <div className="mb-6">
        <Link href="/seller/products" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to products
        </Link>
        <h1 className="heading-lg">Edit product</h1>
        <p className="text-slate-600 mt-1 text-sm">{product.name}</p>
      </div>
      <ProductForm
        initial={product}
        submitLabel="Save changes"
        testid="edit-product-form"
        onSubmit={async (body) => {
          await api.sellerUpdateProduct(id, body);
          toast.success("Product updated");
          router.push("/seller/products");
        }}
      />
    </div>
  );
}
