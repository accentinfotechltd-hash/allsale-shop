"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { api, type Product, type Category } from "@/lib/api";
import { Filter, Loader2, X, SlidersHorizontal } from "lucide-react";

function ProductsInner() {
  const sp = useSearchParams();
  const router = useRouter();

  const category = sp.get("category") || "";
  const q = sp.get("q") || "";
  const sort = sp.get("sort") || "";
  const minPrice = sp.get("min_price") || "";
  const maxPrice = sp.get("max_price") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // load categories once
  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  // load products on params change
  useEffect(() => {
    setLoading(true);
    api
      .products({
        category: category || undefined,
        q: q || undefined,
        sort: sort || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        limit: 48,
      })
      .then((p) => setProducts(p || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, q, sort, minPrice, maxPrice]);

  const updateParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (value === null || value === "") p.delete(key);
    else p.set(key, value);
    router.push(`/products${p.toString() ? `?${p.toString()}` : ""}`);
  };

  const Filters = (
    <div className="space-y-7">
      <div>
        <div className="eyebrow mb-3">Category</div>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("category", null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
              !category ? "bg-orange-50 text-primary font-bold" : "hover:bg-slate-100 text-slate-700"
            }`}
            data-testid="category-filter-all"
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => updateParam("category", c)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                category === c ? "bg-orange-50 text-primary font-bold" : "hover:bg-slate-100 text-slate-700"
              }`}
              data-testid={`category-filter-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-3">Price (NZD)</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => updateParam("min_price", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            data-testid="filter-min-price"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => updateParam("max_price", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
            data-testid="filter-max-price"
          />
        </div>
      </div>

      {(category || q || sort || minPrice || maxPrice) && (
        <button
          onClick={() => router.push("/products")}
          className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
          data-testid="clear-filters-btn"
        >
          <X className="w-3.5 h-3.5" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-px py-8 md:py-12" data-testid="products-page">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="eyebrow mb-2">{category || "Bazaar"}</div>
          <h1 className="heading-md">
            {q ? `Results for "${q}"` : category || "All products"}
          </h1>
          {!loading && (
            <p className="text-sm text-slate-500 mt-2" data-testid="results-count">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden btn-secondary !py-2 !px-4 text-sm"
            data-testid="mobile-filters-toggle"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value || null)}
            className="px-4 py-2.5 rounded-full border border-slate-200 text-sm font-semibold bg-white"
            data-testid="sort-select"
          >
            <option value="">Sort: Featured</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Top rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] gap-8">
        <aside className="hidden md:block">
          <div className="sticky top-32">{Filters}</div>
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center" data-testid="empty-results">
              <div className="text-5xl mb-4">🪔</div>
              <div className="heading-sm">Nothing here yet</div>
              <div className="text-slate-500 mt-2">Try a different category or search term.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" data-testid="products-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="heading-sm">Filters</div>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 -mr-2"><X className="w-5 h-5" /></button>
            </div>
            {Filters}
            <button onClick={() => setShowMobileFilters(false)} className="btn-primary w-full mt-8">
              Show {products.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-px py-20 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
      <ProductsInner />
    </Suspense>
  );
}
