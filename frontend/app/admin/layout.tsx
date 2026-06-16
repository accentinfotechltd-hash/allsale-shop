"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AdminAuthProvider, useAdmin, canTeam, canPayouts } from "@/components/admin/auth";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Store,
  Wallet,
  UserCog,
  ClipboardList,
  LogOut,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const { admin, token, loading, logout } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (loading || isLogin) return;
    if (!token) router.replace("/admin/login");
  }, [loading, token, isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (loading || !admin) {
    return (
      <div className="container-px py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
      </div>
    );
  }

  const NAV = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, allowed: true },
    { href: "/admin/users", label: "Users", icon: Users, allowed: true },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart, allowed: true },
    { href: "/admin/sellers", label: "Sellers", icon: Store, allowed: true },
    { href: "/admin/payouts", label: "Payouts", icon: Wallet, allowed: canPayouts(admin.role) },
    { href: "/admin/team", label: "Team & roles", icon: UserCog, allowed: canTeam(admin.role) },
    { href: "/admin/activity-log", label: "Activity log", icon: ClipboardList, allowed: true },
  ];

  return (
    <div className="container-px py-6 md:py-8" data-testid="admin-layout">
      <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10">
        <aside>
          <div className="bg-slate-900 text-white rounded-2xl p-5 lg:sticky lg:top-32">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-white/10 inline-flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate" data-testid="admin-name">{admin.full_name || admin.email}</div>
                <div className="text-[10px] tracking-[0.18em] uppercase font-bold text-slate-300" data-testid="admin-role">
                  {admin.role}
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {NAV.filter((n) => n.allowed).map((n) => {
                const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    data-testid={`admin-nav-${n.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <n.icon className="w-4 h-4" /> {n.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  if (typeof window !== "undefined") window.location.href = "/admin/login";
                }}
                data-testid="admin-logout-btn"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 transition"
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
