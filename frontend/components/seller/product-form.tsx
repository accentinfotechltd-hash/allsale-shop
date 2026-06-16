"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type ProductFormProps = {
  initial?: any;
  onSubmit: (body: any) => Promise<void>;
  submitLabel: string;
  testid: string;
};

export function ProductForm({ initial, onSubmit, submitLabel, testid }: ProductFormProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [subcategory, setSubcategory] = useState(initial?.subcategory || "");
  const [priceNzd, setPriceNzd] = useState(initial?.price_nzd ?? "");
  const [priceInr, setPriceInr] = useState(initial?.price_inr ?? "");
  const [image, setImage] = useState(initial?.image || "");
  const [imagesCsv, setImagesCsv] = useState((initial?.images || []).join("\n"));
  const [stockCount, setStockCount] = useState(initial?.stock_count ?? 10);
  const [inStock, setInStock] = useState(initial?.in_stock ?? true);
  const [colors, setColors] = useState((initial?.colors || []).join(", "));
  const [sizes, setSizes] = useState((initial?.sizes || []).join(", "));
  const [shippingMin, setShippingMin] = useState(initial?.shipping_days_min ?? 7);
  const [shippingMax, setShippingMax] = useState(initial?.shipping_days_max ?? 12);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const images = imagesCsv.split("\n").map((s) => s.trim()).filter(Boolean);
    const body = {
      name,
      description,
      category,
      subcategory: subcategory || undefined,
      price_nzd: Number(priceNzd),
      price_inr: priceInr ? Number(priceInr) : undefined,
      image,
      images: images.length ? images : [image].filter(Boolean),
      stock_count: Number(stockCount),
      in_stock: inStock,
      colors: colors.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
      shipping_days_min: Number(shippingMin),
      shipping_days_max: Number(shippingMax),
    };
    try {
      await onSubmit(body);
    } catch (e: any) {
      toast.error(e?.message || "Could not save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6" data-testid={testid}>
      <Section title="Basics">
        <Field label="Product name" full>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="seller-input" data-testid="pf-name" />
        </Field>
        <Field label="Description" full>
          <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="seller-input" data-testid="pf-description" />
        </Field>
        <Field label="Category">
          <select required value={category} onChange={(e) => setCategory(e.target.value)} className="seller-input" data-testid="pf-category">
            <option value="">— Select —</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Subcategory (optional)">
          <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="seller-input" data-testid="pf-subcategory" />
        </Field>
      </Section>

      <Section title="Pricing">
        <Field label="Price (NZD)">
          <input required type="number" step="0.01" min="0" value={priceNzd} onChange={(e) => setPriceNzd(e.target.value)} className="seller-input" data-testid="pf-price-nzd" />
        </Field>
        <Field label="Price (INR, optional)">
          <input type="number" step="1" min="0" value={priceInr} onChange={(e) => setPriceInr(e.target.value)} className="seller-input" data-testid="pf-price-inr" />
        </Field>
      </Section>

      <Section title="Media">
        <Field label="Main image URL" full>
          <input required type="url" value={image} onChange={(e) => setImage(e.target.value)} className="seller-input" placeholder="https://…" data-testid="pf-image" />
        </Field>
        <Field label="Additional image URLs (one per line)" full>
          <textarea rows={3} value={imagesCsv} onChange={(e) => setImagesCsv(e.target.value)} className="seller-input" data-testid="pf-images" />
        </Field>
      </Section>

      <Section title="Inventory & variants">
        <Field label="Stock count">
          <input required type="number" min="0" value={stockCount} onChange={(e) => setStockCount(e.target.value)} className="seller-input" data-testid="pf-stock" />
        </Field>
        <Field label="In stock">
          <label className="inline-flex items-center gap-2 mt-2.5">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="w-4 h-4 rounded" data-testid="pf-instock" />
            <span className="text-sm">Available to buy</span>
          </label>
        </Field>
        <Field label="Colours (comma separated)">
          <input value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Red, Blue, Gold" className="seller-input" data-testid="pf-colors" />
        </Field>
        <Field label="Sizes (comma separated)">
          <input value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL" className="seller-input" data-testid="pf-sizes" />
        </Field>
      </Section>

      <Section title="Shipping">
        <Field label="Min ship days">
          <input required type="number" min="1" value={shippingMin} onChange={(e) => setShippingMin(e.target.value)} className="seller-input" data-testid="pf-ship-min" />
        </Field>
        <Field label="Max ship days">
          <input required type="number" min="1" value={shippingMax} onChange={(e) => setShippingMax(e.target.value)} className="seller-input" data-testid="pf-ship-max" />
        </Field>
      </Section>

      <div className="pt-4 flex gap-3">
        <button type="submit" disabled={submitting} className="btn-primary px-7 py-3" data-testid="pf-submit">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {submitLabel}</>}
        </button>
        <Link href="/seller/products" className="btn-secondary px-5 py-3">Cancel</Link>
      </div>

      <style jsx>{`
        :global(.seller-input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          font-weight: 500;
          background: #fff;
          font-family: var(--font-body);
        }
        :global(.seller-input:focus) {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px #ddd6fe;
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6">
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

export function NewProductHeader() {
  return (
    <div className="mb-6">
      <Link href="/seller/products" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-3">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>
      <h1 className="heading-lg">New product</h1>
      <p className="text-slate-600 mt-1 text-sm">Add a new listing to your storefront.</p>
    </div>
  );
}
