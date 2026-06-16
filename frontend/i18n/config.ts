// Shared constants — safe to import from both server and client components.
// All 28 locales the mobile app supports. Files in /messages/<code>.json.
// Stubs fall back to English content until the full mobile JSON files are dropped in.
export const SUPPORTED_LOCALES = [
  // Indian (11)
  "en", "hi", "bn", "te", "mr", "ta", "ur", "gu", "kn", "ml", "pa",
  // Indian extras present in mobile (or, as)
  "or", "as",
  // Global (12)
  "ar", "de", "es", "fr", "pt", "ru", "ja", "ko", "zh", "zh-TW", "id",
  // Pacific (4)
  "mi", "fj", "sm", "to",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "allsale_locale";

export const LOCALE_LABEL: Record<string, { name: string; native: string; flag: string }> = {
  // Indian
  en: { name: "English", native: "English", flag: "🇬🇧" },
  hi: { name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  bn: { name: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  te: { name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  mr: { name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  ta: { name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  ur: { name: "Urdu", native: "اردو", flag: "🇮🇳" },
  gu: { name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  kn: { name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  ml: { name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  pa: { name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  or: { name: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  as: { name: "Assamese", native: "অসমীয়া", flag: "🇮🇳" },
  // Global
  ar: { name: "Arabic", native: "العربية", flag: "🇸🇦" },
  de: { name: "German", native: "Deutsch", flag: "🇩🇪" },
  es: { name: "Spanish", native: "Español", flag: "🇪🇸" },
  fr: { name: "French", native: "Français", flag: "🇫🇷" },
  pt: { name: "Portuguese", native: "Português", flag: "🇵🇹" },
  ru: { name: "Russian", native: "Русский", flag: "🇷🇺" },
  ja: { name: "Japanese", native: "日本語", flag: "🇯🇵" },
  ko: { name: "Korean", native: "한국어", flag: "🇰🇷" },
  zh: { name: "Chinese (Simplified)", native: "简体中文", flag: "🇨🇳" },
  "zh-TW": { name: "Chinese (Traditional)", native: "繁體中文", flag: "🇹🇼" },
  id: { name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  // Pacific
  mi: { name: "Māori", native: "Te Reo Māori", flag: "🇳🇿" },
  fj: { name: "Fijian", native: "Vosa Vakaviti", flag: "🇫🇯" },
  sm: { name: "Samoan", native: "Gagana Sāmoa", flag: "🇼🇸" },
  to: { name: "Tongan", native: "Lea fakatonga", flag: "🇹🇴" },
};

// RTL locales (display tweak)
export const RTL_LOCALES: ReadonlyArray<Locale> = ["ar", "ur"] as const;
