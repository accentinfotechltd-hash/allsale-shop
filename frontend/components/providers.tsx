"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { api, type CurrencyRates, type GeoDetect, type Cart } from "@/lib/api";

type User = { id?: string; email: string; full_name?: string; country?: string; points?: number; role?: string } | null;

type AppContextValue = {
  user: User;
  token: string | null;
  setAuth: (token: string, user?: User) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;

  geo: GeoDetect | null;
  rates: CurrencyRates | null;
  currency: string;
  country: string;
  symbol: string;
  setCountry: (country: string) => void;

  cart: Cart | null;
  refreshCart: () => Promise<void>;
  cartCount: number;

  bootstrapped: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

const COUNTRY_TO_CURRENCY: Record<string, { currency: string; symbol: string }> = {
  NZ: { currency: "NZD", symbol: "$" },
  AU: { currency: "AUD", symbol: "A$" },
  US: { currency: "USD", symbol: "US$" },
  GB: { currency: "GBP", symbol: "£" },
  CA: { currency: "CAD", symbol: "C$" },
};

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoDetect | null>(null);
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [country, setCountryState] = useState<string>("NZ");
  const [cart, setCart] = useState<Cart | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  // --- bootstrap ---
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("allsale_token") : null;
    const storedCountry = typeof window !== "undefined" ? window.localStorage.getItem("allsale_country") : null;

    if (stored) setToken(stored);

    (async () => {
      try {
        const [geoData, ratesData] = await Promise.all([api.geo(), api.rates()]);
        setGeo(geoData);
        setRates(ratesData);
        const initialCountry = storedCountry || geoData?.country || "NZ";
        setCountryState(initialCountry);
      } catch (e) {
        // ignore — defaults already in place
      } finally {
        setBootstrapped(true);
      }
    })();
  }, []);

  // Whenever token changes, fetch /me and cart
  useEffect(() => {
    if (!token) {
      setUser(null);
      setCart(null);
      return;
    }
    (async () => {
      try {
        const me = await api.me(token);
        setUser(me);
        try {
          const c = await api.getCart();
          setCart(c);
        } catch {}
      } catch {
        // invalid token
        if (typeof window !== "undefined") window.localStorage.removeItem("allsale_token");
        setToken(null);
        setUser(null);
      }
    })();
  }, [token]);

  const setAuth = useCallback((newToken: string, newUser?: User) => {
    if (typeof window !== "undefined") window.localStorage.setItem("allsale_token", newToken);
    setToken(newToken);
    if (newUser) setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem("allsale_token");
    setToken(null);
    setUser(null);
    setCart(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const me = await api.me(token);
      setUser(me);
    } catch {}
  }, [token]);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart(null);
      return;
    }
    try {
      const c = await api.getCart();
      setCart(c);
    } catch {}
  }, [token]);

  const setCountry = useCallback((c: string) => {
    setCountryState(c);
    if (typeof window !== "undefined") window.localStorage.setItem("allsale_country", c);
  }, []);

  const currencyInfo = COUNTRY_TO_CURRENCY[country] || COUNTRY_TO_CURRENCY.NZ;
  const cartCount = cart?.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;

  const value: AppContextValue = {
    user,
    token,
    setAuth,
    logout,
    refreshMe,
    geo,
    rates,
    currency: currencyInfo.currency,
    country,
    symbol: currencyInfo.symbol,
    setCountry,
    cart,
    refreshCart,
    cartCount,
    bootstrapped,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within Providers");
  return ctx;
}
