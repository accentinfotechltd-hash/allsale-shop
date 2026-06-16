"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/providers";
import { Package, Heart, User, LogOut, Coins, Loader2 } from "lucide-react";

const NAV = [
  { href: "/account", label: "Overview", icon: User, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, bootstrapped, logout } = useApp();

  useEffect(() => {
    if (bootstrapped && !token) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [bootstrapped, token, router, pathname]);

  if (!bootstrapped || !user) {
    return (
      <div className="container-px py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
      </div>
    );
  }

  return (
    <div className="container-px py-8 md:py-12" data-testid="account-layout">
      <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
        <aside>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-primary inline-flex items-center justify-center font-black text-lg">
                {(user.full_name || user.email || "?").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 truncate">{user.full_name || "Friend"}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>

            {typeof user.points === "number" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-sm font-bold mb-5">
                <Coins className="w-4 h-4" /> {user.points} bazaar points
              </div>
            )}

            <nav className="space-y-1">
              {NAV.map((n) => {
                const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    data-testid={`account-nav-${n.label.toLowerCase()}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      active ? "bg-orange-50 text-primary" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <n.icon className="w-4 h-4" /> {n.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  // Hard-navigate so the protected-route effect doesn't bounce us to /login
                  if (typeof window !== "undefined") window.location.href = "/";
                }}
                data-testid="account-logout-button"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </nav>
          </div>
        </aside>

        <section>{children}</section>
      </div>
    </div>
  );
}
