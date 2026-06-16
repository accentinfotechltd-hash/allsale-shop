# Allsale Web — PRD

## Original problem statement
WEB PORT of the Expo mobile app "Allsale: Indian Bazaar". Same backend at
`https://allsale-shop.preview.emergentagent.com`, same MongoDB. Cross-border
e-commerce: Indian sellers → buyers in NZ/AU/US/GB/CA. Live Stripe + Shiprocket.

## Architecture

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind +
  lucide-react + sonner + next-intl. SSR home / product list / PDP.
- **Backend**: Reused; the local `/app/backend/server.py` is unused.
- **Database**: Reused (managed by backend).
- **Auth**: Buyer JWT in `localStorage['allsale_token']`; admin JWT in
  `localStorage['allsale_admin_token']`. JWT HS256, validated server-side.
- **Payments**: LIVE Stripe (backend returns `cs_live_*` Checkout URLs).
- **i18n**: `next-intl` cookie-based locale (`allsale_locale`). 28 locales
  declared in `SUPPORTED_LOCALES`. Missing keys auto-fall-back to English
  via deep-merge in `i18n/request.ts`.

## Phases shipped (chronological)

### Phase 1 — Storefront MVP
Home (SSR hero + bento + featured/trending/best), products listing with
sidebar filters + sort + mobile drawer, PDP (gallery + size/colour + recs +
JSON-LD), cart (multi-currency + coupons), Stripe checkout w/ shipping-address
modal, checkout success/cancel, email/password + Emergent Google + 2FA auth,
account hub (overview / orders / order detail w/ tracking / wishlist),
country & currency switcher (geo-IP).

### Phase 2 — SEO + i18n scaffold + Seller MVP + Admin MVP
- Dynamic `/sitemap.xml` + `/robots.txt`, hreflang x6 on every page,
  schema.org Product JSON-LD, OG + Twitter cards.
- `next-intl` wired (en + hi initially), language switcher.
- **Seller portal** (`/seller/*` + `/become-seller`): KYC upgrade form,
  dashboard with tier block, document upload, products CRUD, orders + CSV
  export, payouts (held/available/paid), settings.
- **Admin RBAC console** (`/admin/*`): separate JWT login, RBAC sidebar
  (owner/manager/support), overview, users, orders, sellers + KYC queue
  with approve/reject, payouts with mark-paid, team mgmt (owner-only),
  activity log.

### Phase 3 — Personalisation + SSO + 28-locale + Admin e2e
- **Personalised home rail** (`/components/personalised-rail.tsx`) above the
  bento grid: greeting changes by country ("Kia ora 🇳🇿" / "G'day 🇦🇺" /
  "Hello 🇺🇸" / "Hi 🇬🇧" / "Hi 🇨🇦") with curated products. Falls back to
  popular-globally.
- **Cross-domain SSO** (`/sso`): accepts `?token=…&target=…` from the
  classifieds site, exchanges via `POST /api/auth/sso/callback`, sanitises
  target to internal paths only, stores the buyer JWT.
- **28-locale registry** (Indian 13 + Global 12 + Pacific 4). Files for 26
  locales are stubs ({}) waiting for real translations — UI falls back to
  English seamlessly. RTL automatic for `ar` and `ur`.
- **Admin RBAC full e2e** with `owner@allsale.co.nz` — fixed two CRITICAL
  envelope-unwrap bugs (`/api/admin/users` returns `{users:[]}`,
  `/api/admin/activity-log` returns `{events:[]}`) and one LOW SSO toast
  bug (FastAPI detail arrays now stringified into readable messages).
- Iteration 5 → 100% pass on all regression items.

## Open backlog (P2)

- Drop the 26 mobile-app JSON files into `/app/frontend/messages/<code>.json`
  (paths are already wired; just overwrite the stubs).
- Cloudflare CNAMEs (`nz/au/us/uk/ca/seller`) → `shop.allsale.co.nz`
  (DNS only, grey cloud). User will handle this once primary domain is live.
- Saved-addresses CRUD on the account page.
- Points/rewards redemption UI inside checkout.
- Seller analytics (`/api/seller/analytics` already exposes timeseries).
- Stripe Connect bank verification from seller settings.
- Admin: flash sales editor, reviews moderation, platform-wide coupons UI.
- Apple sign-in (backend endpoint exists).
- Server-side pagination for `/admin/users` (currently fetches all).
- AbortController for personalised-rail rapid country switching.
- Merge the production `robots.txt` blocks (Cloudflare adds its own).

## Test users

| Role | Email | Password |
|---|---|---|
| Buyer / Seller (KYC pending) | webtest+allsale@example.com | Test@123456 |
| Admin OWNER | owner@allsale.co.nz | AllsaleOwner2026! |
