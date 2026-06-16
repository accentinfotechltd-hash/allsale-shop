"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ProductForm, NewProductHeader } from "@/components/seller/product-form";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  return (
    <div data-testid="seller-new-product">
      <NewProductHeader />
      <ProductForm
        submitLabel="Create product"
        testid="new-product-form"
        onSubmit={async (body) => {
          await api.sellerCreateProduct(body);
          toast.success("Product created");
          router.push("/seller/products");
        }}
      />
    </div>
  );
}
