"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

export type AdminUser = {
  id: string;
  email: string;
  full_name?: string;
  role: "owner" | "manager" | "support" | string;
  is_active?: boolean;
};

type AdminContextValue = {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  setAuth: (token: string, admin?: AdminUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

const TOKEN_KEY = "allsale_admin_token";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    api
      .adminMe(stored)
      .then((me) => setAdmin(me))
      .catch(() => {
        if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const setAuth = (t: string, a?: AdminUser) => {
    if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    if (a) setAdmin(a);
  };

  const logout = () => {
    if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  };

  const refresh = async () => {
    if (!token) return;
    try {
      const me = await api.adminMe();
      setAdmin(me);
    } catch {}
  };

  return (
    <AdminContext.Provider value={{ admin, token, loading, setAuth, logout, refresh }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminAuthProvider");
  return ctx;
}

export function canPayouts(role?: string) {
  return role === "owner" || role === "manager";
}
export function canKyc(role?: string) {
  return role === "owner" || role === "manager" || role === "support";
}
export function canTeam(role?: string) {
  return role === "owner";
}
