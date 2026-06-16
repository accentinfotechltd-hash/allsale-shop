"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/components/providers";
import { Check, ChevronDown } from "lucide-react";

const COUNTRIES = [
  { code: "NZ", label: "NZ · NZD", flag: "🇳🇿" },
  { code: "AU", label: "AU · AUD", flag: "🇦🇺" },
  { code: "US", label: "US · USD", flag: "🇺🇸" },
  { code: "GB", label: "UK · GBP", flag: "🇬🇧" },
  { code: "CA", label: "CA · CAD", flag: "🇨🇦" },
];

export function CountrySwitcher() {
  const { country, setCountry } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        data-testid="currency-selector"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-full hover:bg-slate-100 text-sm font-semibold transition"
        aria-label="Change country"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.label.split(" · ")[1]}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50" data-testid="country-dropdown">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCountry(c.code); setOpen(false); }}
              data-testid={`country-option-${c.code}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-100 transition ${
                c.code === country ? "font-bold text-primary" : "text-slate-700"
              }`}
            >
              <span className="text-lg">{c.flag}</span>
              <span className="flex-1 text-left">{c.label}</span>
              {c.code === country && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
