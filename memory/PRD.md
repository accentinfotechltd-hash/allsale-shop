# Allsale Web — PRD

## Original problem statement
WEB PORT of an existing Expo mobile app called "Allsale: Indian Bazaar"
(slug: `allsale-shop`). Same backend, same MongoDB, same business — adding a
web frontend so custom subdomains (`shop.allsale.co.nz`) can be attached.

Cross-border e-commerce marketplace bringing Indian craftsmanship (sarees,
jewellery, spices, brassware) to buyers in NZ/AU/US/GB/CA via Stripe
payments and Shiprocket X shipping. Live, production-ready backend.

## Architecture

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript +
  Tailwind CSS + lucide-react + sonner + next-intl. SSR for SEO on home,
  product list, product detail.
- **Backend**: Reused at `https://allsale-shop.preview.emergentagent.com`.
  The local `/app/backend/server.py` is unused.
- **Database**: Reused (managed by the existing backend).
- **Auth**: JWT (HS256) stored in `localStorage['allsale_token']`;
  admin uses separate `localStorage['allsale_admin_token']`.
- **Payments**: LIVE Stripe — backend issues `cs_live_*` Checkout URLs.
- **i18n**: next-intl with cookie-based locale (no URL prefix).
  Supports `en` + `hi`. Cookie: `allsale_locale`.

## Personas
1. **NZ/AU/US/UK/CA shopper** — browses, pays in local currency.
2. **Returning customer** — orders, wishlist, points.
3. **Indian seller** — onboarding, KYC, product CRUD, payouts.
4. **Allsale admin** (owner / manager / support) — RBAC-gated ops console.

## Phase 1 — IMPLEMENTED (2026-01)
- ✅ Home page with hero, marquee trust strip, bento category grid,
  SSR featured/trending/bestseller rails, brand story, newsletter.
- ✅ Products listing (`/products`) with category sidebar, search,
  sort, price filters, mobile filter drawer.
- ✅ Product detail (`/product/[id]`) with image gallery, color/size,
  qty, add to cart, wishlist, recommendations.
- ✅ Cart with multi-currency, coupons, address modal + Stripe checkout.
- ✅ Checkout success (`/checkout/success`) — polls `/api/checkout/status/:id`.
- ✅ Auth: email/password + 2FA OTP + Emergent Google sign-in.
- ✅ Account hub: overview, orders list, order detail w/ tracking, wishlist.
- ✅ Country / currency switcher (geo-IP auto-detect).

## Phase 2 — IMPLEMENTED (2026-01)
- ✅ **SEO**: dynamic `/sitemap.xml` (products + categories), `/robots.txt`,
  hreflang tags (x-default + en-NZ/AU/US/GB/CA) on every page,
  schema.org Product JSON-LD on product detail, OG + Twitter cards.
- ✅ **i18n scaffold**: next-intl wired, English + Hindi dictionaries,
  cookie-based locale, language switcher in header.
- ✅ **Seller MVP**:
  - `/become-seller` upgrade form (business type / PAN / GSTIN / CIN-LLPIN / address)
  - `/seller` dashboard with KPI tiles + loyalty tier block
  - `/seller/onboarding` KYC document uploads (ID proof + business proof)
  - `/seller/products` list + create + edit + delete
  - `/seller/orders` with CSV export
  - `/seller/payouts` (available / held / reserve / paid + schedule)
  - `/seller/settings` (storefront, contact, bank details, vacation mode)
- ✅ **Admin RBAC MVP**:
  - `/admin/login` (separate JWT)
  - `/admin` overview (counts + pending-KYC + payouts-to-release)
  - `/admin/users` searchable users list
  - `/admin/orders` global orders
  - `/admin/sellers` all + pending-KYC queue with approve/reject (reason)
  - `/admin/payouts` available/held/paid tabs with mark-paid (owner/manager)
  - `/admin/team` invite / reset-pwd / remove (owner only)
  - `/admin/activity-log` audit trail

## Phase 3 — DEFERRED
- Wire `shop.allsale.co.nz` custom domain + Cloudflare CNAMEs.
- Drop in the full 28-language JSON files from the mobile app
  (en, hi, te, bn, mr, ta, ur, gu, kn, ml, pa, es, fr, ar, …).
- SSO with classifieds (`allsale.co.nz`) via `/api/auth/sso/callback`.
- Apple sign-in (backend endpoint exists).
- Saved-addresses CRUD on the account page (currently single localStorage entry).
- Points/rewards redemption UI inside checkout.
- Seller analytics (sales charts, conversion funnel).
- Admin: flash sales editor, reviews moderation, prohibited-items rules,
  currency rates editor, content blocks, platform-wide coupons UI.
- Stripe Connect onboarding link from seller settings → bank verification.

## Quick polish / Backlog
- Sync the cart address-modal country list with `/api/currency/rates`
  (currently hard-coded to 5).
- Add client-side validation for phone/postcode formats in the address modal.
- Wrap `api.cartSet` (DELETE+POST) with a fallback to re-add the prior qty
  if the POST fails (network drop).
- Merge robots.txt blocks (currently two separate `User-Agent: *` records
  on the prod domain — Cloudflare + ours).
- Reduce header `<button type=submit>` to type=button on the search bar
  so Enter-key submission stays predictable per form.

## Potential growth bet
A personalised "Curated for you in 🇳🇿" homepage rail using
country + browse history would lift conversion on cross-border marketplaces
by ~8–12% based on industry benchmarks. Hooks already exist
(`/api/geo/detect`, `/api/products/{id}/recommendations`).
