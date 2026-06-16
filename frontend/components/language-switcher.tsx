"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, Globe, ChevronDown } from "lucide-react";
import { SUPPORTED_LOCALES, LOCALE_LABEL, LOCALE_COOKIE, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const change = (next: Locale) => {
    // 1-year cookie. next-intl reads this on the next request.
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${oneYear}; SameSite=Lax`;
    setOpen(false);
    router.refresh();
  };

  const current = LOCALE_LABEL[locale];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        data-testid="language-switcher"
        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-slate-100 text-sm font-semibold transition"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 opacity-60" />
        <span className="hidden sm:inline">{current.native}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50" data-testid="language-dropdown">
          {SUPPORTED_LOCALES.map((code) => {
            const l = LOCALE_LABEL[code];
            return (
              <button
                key={code}
                onClick={() => change(code)}
                data-testid={`language-option-${code}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition ${
                  code === locale ? "font-bold text-primary" : "text-slate-700"
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="flex-1 text-left">{l.native}</span>
                {code === locale && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
