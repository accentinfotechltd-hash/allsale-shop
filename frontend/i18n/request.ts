import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./config";
import enMessages from "../messages/en.json";

function pickFromHeader(acceptLang: string | null): Locale {
  if (!acceptLang) return DEFAULT_LOCALE;
  const wanted = acceptLang.split(",").map((p) => p.split(";")[0].trim().toLowerCase());
  for (const w of wanted) {
    // exact match (e.g. zh-TW)
    if ((SUPPORTED_LOCALES as readonly string[]).includes(w)) return w as Locale;
    const base = w.split("-")[0];
    if ((SUPPORTED_LOCALES as readonly string[]).includes(base)) return base as Locale;
  }
  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerList = await headers();

  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
  const locale: Locale =
    fromCookie && (SUPPORTED_LOCALES as readonly string[]).includes(fromCookie)
      ? fromCookie
      : pickFromHeader(headerList.get("accept-language"));

  // Load locale messages, falling back to English if file is missing or empty
  let messages: any;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
    // If a translation file is a placeholder with no keys, fall back to English
    if (!messages || Object.keys(messages).length === 0) {
      messages = enMessages;
    } else {
      // Deep-merge so missing keys fall back to English (Phase 2 launch safety)
      messages = deepMerge(enMessages, messages);
    }
  } catch {
    messages = enMessages;
  }

  return { locale, messages };
});

function deepMerge(base: any, override: any): any {
  if (typeof base !== "object" || typeof override !== "object" || base === null || override === null) {
    return override ?? base;
  }
  const out: any = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(override)) {
    if (k in out && typeof out[k] === "object" && typeof override[k] === "object") {
      out[k] = deepMerge(out[k], override[k]);
    } else {
      out[k] = override[k];
    }
  }
  return out;
}
