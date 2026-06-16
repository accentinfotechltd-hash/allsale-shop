// Tiny client-side A/B framework — cookie-stable 50/50 buckets per experiment.
// Persists the variant for 30 days so a returning visitor always sees the same flavour.
// Override via ?variant=control or ?variant=treatment in the URL (for QA / sharing links).

export type Variant = "control" | "treatment";

const COOKIE_PREFIX = "allsale_ab_";
const COOKIE_TTL_DAYS = 30;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * COOKIE_TTL_DAYS;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function urlOverride(): Variant | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("variant");
  return v === "control" || v === "treatment" ? v : null;
}

/**
 * Get (and remember) the variant for a given experiment.
 * Stable 50/50 split with cookie persistence.
 */
export function getVariant(experiment: string): Variant {
  const override = urlOverride();
  if (override) {
    writeCookie(COOKIE_PREFIX + experiment, override); // sticky once overridden
    return override;
  }
  const stored = readCookie(COOKIE_PREFIX + experiment) as Variant | null;
  if (stored === "control" || stored === "treatment") return stored;
  const v: Variant = Math.random() < 0.5 ? "control" : "treatment";
  writeCookie(COOKIE_PREFIX + experiment, v);
  return v;
}

/**
 * Fire-and-forget analytics ping. Tries window.allsaleTrack (if any host page
 * has wired one up), then falls back to console.info so we have a paper trail
 * during local QA. Replace with a real /api/events POST when ready.
 */
export function trackExperiment(experiment: string, variant: Variant, extra?: Record<string, any>) {
  const payload = { experiment, variant, t: Date.now(), ...extra };
  try {
    const w = window as any;
    if (typeof w?.allsaleTrack === "function") {
      w.allsaleTrack("experiment_view", payload);
      return;
    }
  } catch {}
  if (typeof console !== "undefined") {
    // eslint-disable-next-line no-console
    console.info("[ab]", payload);
  }
}
