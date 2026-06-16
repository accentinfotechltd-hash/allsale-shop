import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "";

export const GOOGLE_AUTH_URL =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL || "https://auth.emergentagent.com";

export const CURRENCY_BY_COUNTRY: Record<string, { code: string; symbol: string; flag: string; name: string }> = {
  NZ: { code: "NZD", symbol: "$", flag: "🇳🇿", name: "New Zealand" },
  AU: { code: "AUD", symbol: "A$", flag: "🇦🇺", name: "Australia" },
  US: { code: "USD", symbol: "US$", flag: "🇺🇸", name: "United States" },
  GB: { code: "GBP", symbol: "£", flag: "🇬🇧", name: "United Kingdom" },
  CA: { code: "CAD", symbol: "C$", flag: "🇨🇦", name: "Canada" },
};

export function formatPrice(amount: number, currency: string, symbol = "$") {
  const safe = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: safe % 1 === 0 ? 0 : 2,
    }).format(safe);
  } catch {
    return `${symbol}${safe.toFixed(2)}`;
  }
}

export function convertPriceNZD(priceNzd: number, currency: string, rates: Record<string, number>) {
  const rate = rates[currency] ?? 1;
  return priceNzd * rate;
}
