"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, User as UserIcon, Heart, Menu, X, ChevronDown } from "lucide-react";
import { useApp } from "@/components/providers";
import { useRouter, usePathname } from "next/navigation";
import { CountrySwitcher } from "@/components/country-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";

const PRIMARY_CATS = [
  { name: "Ethnic Fashion", slug: "Ethnic Fashion" },
  { name: "Jewellery", slug: "Jewellery" },
  { name: "Home & Decor", slug: "Home & Decor" },
  { name: "Beauty & Health", slug: "Beauty & Health" },
  { name: "Kids", slug: "Kids' Fashion" },
];

export function Header() {
  const { user, cartCount, bootstrapped } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setOpen(false);
  };

  return (
    <header
      data-testid="site-header"
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm"
          : "bg-white/60 backdrop-blur-md border-b border-transparent"
      }`}
    >
      {/* Top utility bar */}
      <div className="hidden md:block bg-slate-900 text-white text-[11px] tracking-[0.18em] uppercase">
        <div className="container-px flex items-center justify-between py-1.5">
          <span className="font-semibold">India · Handpicked · Worldwide</span>
          <span className="opacity-80">Free shipping over $150 · Pay in NZD · AUD · USD · GBP · CAD</span>
        </div>
      </div>

      <div className="container-px flex items-center gap-4 py-3 md:py-4">
        {/* mobile menu toggle */}
        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* logo */}
        <Link href="/" className="flex items-center gap-2 group" data-testid="logo-home-link">
          <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white font-black text-lg group-hover:rotate-[8deg] transition-transform">
            अ
          </span>
          <span className="font-heading text-2xl font-extrabold tracking-tight">
            allsale
            <span className="text-primary">.</span>
          </span>
        </Link>

        {/* desktop search */}
        <form onSubmit={submit} className="hidden md:flex flex-1 max-w-2xl mx-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              data-testid="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sarees, jewellery, spices, decor…"
              className="w-full pl-11 pr-32 py-3 rounded-full bg-slate-100 border border-transparent focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm"
            />
            <button
              type="submit"
              data-testid="search-submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary !py-1.5 !px-4 text-xs"
            >
              Search
            </button>
          </div>
        </form>

        {/* right cluster */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          <LanguageSwitcher />
          <CountrySwitcher />

          <Link
            href="/account/wishlist"
            data-testid="header-wishlist-link"
            className="hidden md:inline-flex p-2.5 rounded-full hover:bg-slate-100 transition"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </Link>

          <Link
            href="/cart"
            data-testid="header-cart-link"
            className="relative inline-flex p-2.5 rounded-full hover:bg-slate-100 transition"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {bootstrapped && cartCount > 0 && (
              <span
                data-testid="cart-count-badge"
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center animate-pop"
              >
                {cartCount}
              </span>
            )}
          </Link>

          {bootstrapped && user ? (
            <Link
              href="/account"
              data-testid="header-account-link"
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-100 transition text-sm font-semibold"
            >
              <UserIcon className="w-4 h-4" />
              <span className="max-w-[120px] truncate">{user.full_name || user.email}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              data-testid="header-login-link"
              className="hidden md:inline-flex btn-secondary !py-2 !px-4 text-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* desktop category nav */}
      <nav className="hidden md:block border-t border-slate-100/80">
        <div className="container-px flex items-center gap-6 py-2 overflow-x-auto no-scrollbar text-sm">
          <Link
            href="/products"
            className={`py-1 font-semibold whitespace-nowrap hover:text-primary transition ${
              pathname === "/products" ? "text-primary" : "text-slate-700"
            }`}
            data-testid="nav-all-products"
          >
            All products
          </Link>
          {PRIMARY_CATS.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${encodeURIComponent(c.slug)}`}
              className="py-1 font-medium text-slate-700 hover:text-primary whitespace-nowrap transition"
              data-testid={`nav-cat-${c.slug.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/products?sort=newest"
            className="py-1 font-medium text-slate-700 hover:text-primary whitespace-nowrap transition"
          >
            New arrivals
          </Link>
          <span className="ml-auto text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Ships from India · Tracked via Shiprocket
          </span>
        </div>
      </nav>

      {/* mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="container-px py-4 space-y-3">
            <form onSubmit={submit} className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-11 pr-4 py-3 rounded-full bg-slate-100 text-sm"
              />
            </form>
            <Link href="/products" className="block py-2 font-semibold" onClick={() => setOpen(false)}>
              All products
            </Link>
            {PRIMARY_CATS.map((c) => (
              <Link
                key={c.slug}
                href={`/products?category=${encodeURIComponent(c.slug)}`}
                className="block py-2 text-slate-700"
                onClick={() => setOpen(false)}
              >
                {c.name}
              </Link>
            ))}
            <div className="border-t pt-3 flex gap-3">
              {user ? (
                <Link href="/account" className="btn-secondary flex-1 text-sm" onClick={() => setOpen(false)}>
                  Account
                </Link>
              ) : (
                <Link href="/login" className="btn-primary flex-1 text-sm" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              )}
              <Link href="/cart" className="btn-secondary flex-1 text-sm" onClick={() => setOpen(false)}>
                Cart ({cartCount})
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
