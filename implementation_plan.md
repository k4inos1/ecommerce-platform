# TechStore — Implementation Plan: Core Features 4.0

> **Status**: Sprint 4.0 ✅ Complete (see [PR #1](https://github.com/k4inos1/ecommerce-platform/pull/1))

---

## ✅ Sprint 3.0 — Completed

| Feature | Status |
|---------|--------|
| User Profile (`/profile`) — addresses & phones | ✅ Done |
| Password Recovery (forgot/reset flow + Nodemailer) | ✅ Done |
| Product Reviews (1–5 stars + comments) | ✅ Done |
| Backend Cloudinary (image CDN upload) | ✅ Done |

---

## ✅ Sprint 4.0 — Completed (PR #1)

> Changes landed in branch `copilot/vscode-mn9cpbw5-tvgz` → PR #1.

### 4.1 Payments

| Feature | Status | Notes |
|---------|--------|-------|
| Stripe Checkout (`POST /api/orders/stripe`) | ✅ Done | International card payments |
| Transbank / WebPay Plus (`POST /api/orders/transbank`) | ✅ Done | Dedicated `webpayToken` field on Order model |
| Stripe webhook secret documented | ✅ Done | `STRIPE_WEBHOOK_SECRET` in `backend/.env.example` |
| Transbank credentials documented | ✅ Done | `TRANSBANK_COMMERCE_CODE` / `TRANSBANK_API_KEY` |

### 4.2 Analytics & Dashboards

| Feature | Status | Notes |
|---------|--------|-------|
| Admin analytics (`/admin/analytics`) | ✅ Done | Sales charts (14-day / 7-week), donut by status, top products, KPIs |
| Customer order history (`/mis-ordenes`) | ✅ Done | Tracking states + progress bar + expandable order detail |
| Real supplier finder (`supplierFinder.ts`) | ✅ Done | Playwright scrapes Alibaba; Axios fallback; no synthetic data |
| Real market analysis (`marketAnalysis.ts`) | ✅ Done | DuckDuckGo + eBay sold listings; sources[] array in response |

### 4.3 Search & Filters

| Feature | Status | Notes |
|---------|--------|-------|
| Price range filter (`/products`) | ✅ Done | `minPrice`/`maxPrice` params; UI panel with debounced inputs + presets |
| Active filter indicator | ✅ Done | Dot badge + inline clear button |
| "No results" adapts to price filter | ✅ Done | Contextual message when price filter is active |

### 4.4 Security & Production Config

| Feature | Status | Notes |
|---------|--------|-------|
| Rate limiting on scraping endpoints | ✅ Done | `express-rate-limit` — 10 req/min on `/search`, `/market`, `/suppliers` |
| `backend/.env.example` complete | ✅ Done | Added OAuth, email, payment, and webhook variables |
| `next.config.js` Cloudinary domain | ✅ Done | `res.cloudinary.com` added to `remotePatterns` |
| Admin import error surfacing | ✅ Done | `apiFetch` now shows real backend error messages |

---

## ✅ Sprint 5.0 — Completed (develop branch)

> Changes landed in branch `develop`.

### 5.1 Social Login (OAuth2)

| Feature | Status | Notes |
|---------|--------|-------|
| Google OAuth2 (`GET /api/auth/google`) | ✅ Done | Passport GoogleStrategy; JWT issued on callback; redirects to frontend with token |
| Facebook OAuth2 (`GET /api/auth/facebook`) | ✅ Done | Passport FacebookStrategy; same JWT flow as Google |
| Frontend social login buttons | ✅ Done | Login page shows "Continuar con Google" and "Continuar con Facebook" links |
| OAuth error handling | ✅ Done | `failureRedirect` with `?error=oauth_failed`; error surfaced in login UI |

### 5.2 Email Improvements

| Feature | Status | Notes |
|---------|--------|-------|
| Welcome email on registration | ✅ Done | `sendWelcomeEmail()` called async after `POST /api/auth/register`; skipped for guest accounts |
| Premium corporate email templates | ✅ Done | Unified CSS layout with Unsplash banners, brand colours, styled tables — applied to order confirmation and welcome emails |

### 5.3 Bug Fixes & Stability

| Feature | Status | Notes |
|---------|--------|-------|
| Express.User type mismatch with Passport | ✅ Done | Global `Express.User` interface extended to match app user shape |
| Passport sync crash on missing OAuth keys | ✅ Done | Strategies only registered when `GOOGLE_CLIENT_ID` / `FACEBOOK_APP_ID` env vars are set |
| Transbank SDK TS2554 constructor error | ✅ Done | Explicit options object passed to Transbank WebpayPlus constructor |
| nixpacks `ca-certificates` → `cacert` | ✅ Done | Replaced Debian package name with Nix-compatible `cacert` in `nixpacks.toml` |
| CI Node.js version bump | ✅ Done | GitHub Actions workflow updated to Node 20; removed `ttf-dejavu` from Nix packages |

---

## ✅ Sprint 6.0 — Completed

| Feature | Status | Notes |
|---------|--------|-------|
| Wishlist / favorites | ✅ Done | Persistent across sessions; `GET/POST/DELETE /api/users/wishlist` + frontend at `/wishlist` |
| Push notifications (order status changes) | ✅ Done | In-app via `Notification` model + `NotificationsContext`; email on order create |
| Coupon / discount code system | ✅ Done | Admin CRUD at `/admin/coupons`; validation at checkout via `POST /api/coupons/validate` |
| Product recommendations | ✅ Done | `GET /api/products/:id/related` + displayed on product detail page |
| Multi-currency support | ✅ Done | `CurrencyContext` (USD/CLP, fixed rate 940) wrapped in root layout |
| SEO optimization (sitemap, meta tags) | ✅ Done | `robots.ts` + `sitemap.ts` in Next.js App Router; OpenGraph meta in `layout.tsx` |
| Support chat | ✅ Done | `POST/GET /api/support/*` + `SupportChat` component + admin inbox at `/admin/support` |
| Order detail page | ✅ Done | `/orders/[id]` with progress tracker, items, shipping & payment info |
| Register page | ✅ Done | `/register` — standalone registration page with OAuth + email form |

---

## ✅ Daily Verification Checklist

- [x] Backend: `npm run build` — no TypeScript errors
- [x] Frontend: `npm run build` — no lint/build errors
- [x] Git: Atomic commits pushed to remote
- [x] Env vars: Verified in Railway (backend) and Vercel (frontend)
- [x] Payment flows: Stripe & Transbank tested in sandbox mode
