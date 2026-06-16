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
  Tailwind CSS + lucide-react + sonner. SSR for SEO on home, product
  list, product detail.
- **Backend**: Reused — pointed at
  `https://allsale-shop.preview.emergentagent.com` via
  `REACT_APP_BACKEND_URL` / `NEXT_PUBLIC_BACKEND_URL`. No backend was
  built in this project. The local `/app/backend/server.py` exists but
  is unused.
- **Database**: Reused (managed by the existing backend). The web frontend
  does NOT connect to MongoDB directly.
- **Auth**: JWT (HS256) issued by the existing backend, stored in browser
  `localStorage` under `allsale_token` and sent as `Authorization: Bearer …`.
  Emergent Google Auth wired via `/auth/google-callback` page.
- **Payments**: LIVE Stripe. Web posts to `/api/checkout/session`, backend
  returns a Stripe Checkout URL, web redirects.

## Personas

1. **NZ/AU/US/UK/CA shopper** — browses categories, adds to cart, pays in
   their local currency.
2. **Returning customer** — signs in via Google or email/password, tracks
   orders.
3. **Indian seller** (Phase 2) — onboards via web seller portal (currently
   uses the mobile app).

## Phase 1 — IMPLEMENTED (2026-01)

- ✅ Home page with hero, marquee trust strip, bento category grid, SSR
  featured products, brand story, newsletter signup.
- ✅ Product listing (`/products`) with category sidebar, search, sort,
  price filters, mobile filter drawer.
- ✅ Product detail (`/product/[id]`) with image gallery, color/size
  pickers, quantity, add to cart, wishlist, recommendations, SEO meta.
- ✅ Cart (`/cart`) with multi-currency display, qty controls, coupon
  apply, Stripe checkout redirect.
- ✅ Checkout success (`/checkout/success`) — polls
  `/api/checkout/status/:session_id` and confirms order.
- ✅ Checkout cancel (`/checkout/cancel`).
- ✅ Email/password login + signup + 2FA OTP fallback flow.
- ✅ Emergent Google Auth (`/auth/google-callback`).
- ✅ Account hub with sidebar nav: overview, orders list, order detail
  with shipment tracking, wishlist.
- ✅ Country / currency switcher (auto-detected via `/api/geo/detect`,
  persists in localStorage).
- ✅ Brand-on-brand design: warm orange/saffron primary, Cabinet Grotesk
  + Manrope typography, custom marquee, bento layouts, no AI-slop tropes.

## Phase 2 — DEFERRED

- Seller dashboard (web port of mobile seller screens).
- Admin dashboard with RBAC (`owner` / `manager` / `support`).
- SEO polish: sitemap.xml, robots.txt, schema.org Product JSON-LD,
  hreflang for cross-region subdomains.
- i18n via `next-intl` (English-only at launch; backend already serves
  translated content for 28 languages).
- Cross-domain SSO with classifieds (`/api/auth/sso/callback`).
- Apple sign-in (backend endpoint exists).
- Address book CRUD on account page.
- Points/rewards redemption UI inside checkout.
- Duty estimator & prohibited-items checker UI on cart.

## Next Action Items

- Run testing agent to validate Phase 1 flows end-to-end.
- User to confirm Stripe publishable key is wired (frontend currently
  redirects via backend-issued Checkout URL — no `pk_*` needed on web).
- Set up production domain (`shop.allsale.co.nz`) and CORS allowlist.
