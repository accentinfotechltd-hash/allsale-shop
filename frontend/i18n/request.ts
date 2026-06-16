import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./config";

function pickFromHeader(acceptLang: string | null): Locale {
  if (!acceptLang) return DEFAULT_LOCALE;
  const wanted = acceptLang.split(",").map((p) => p.split(";")[0].trim().toLowerCase());
  for (const w of wanted) {
    const base = w.split("-")[0] as Locale;
    if ((SUPPORTED_LOCALES as readonly string[]).includes(base)) return base;
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

  const messages = (await import(`../messages/${locale}.json`)).default;

  return { locale, messages };
});
