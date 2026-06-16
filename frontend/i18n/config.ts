// Shared constants — safe to import from both server and client components.
export const SUPPORTED_LOCALES = ["en", "hi"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "allsale_locale";

export const LOCALE_LABEL: Record<Locale, { name: string; native: string; flag: string }> = {
  en: { name: "English", native: "English", flag: "🇬🇧" },
  hi: { name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
};
