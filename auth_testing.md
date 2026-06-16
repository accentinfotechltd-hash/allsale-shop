# Allsale Web — Auth Testing Playbook (Emergent Google Auth)

This project is a **web frontend** that calls an **existing FastAPI backend** at
`https://allsale-shop.preview.emergentagent.com`. The backend already
implements all auth (email/password, JWT, Emergent Google Auth, 2FA).

This file documents how to test the auth-gated flows from the web app.

## Flow Summary

1. User clicks "Sign in with Google" on the web.
2. Web redirects to `https://auth.emergentagent.com/?redirect={origin}/auth/callback`.
3. Emergent completes Google OAuth and redirects back to
   `{origin}/auth/callback#session_id=<sid>`.
4. The `/auth/callback` page reads `session_id` from the URL hash and POSTs
   to the existing backend: `POST /api/auth/google-session` with `{session_id}`.
5. Backend returns `{access_token: "<jwt>", user: {...}}` (JWT signed HS256).
6. Web stores the JWT in `localStorage["allsale_token"]` and uses it for all
   subsequent API calls via `Authorization: Bearer <jwt>` header.

> Note: Allsale's backend uses **JWT Bearer tokens**, not Emergent's
> `session_token` cookie pattern. The standard Emergent cookie-based session
> management does **not** apply here — the backend issues its own JWT.

## Test Credentials

See `/app/memory/test_credentials.md` for live test accounts.

## Email/Password Login Test (no Google needed)

```bash
API="https://allsale-shop.preview.emergentagent.com"
# Register
curl -s -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"webtest@example.com","password":"Test@1234","full_name":"Web Test","country":"NZ"}'

# Login
TOKEN=$(curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"webtest@example.com","password":"Test@1234"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))")
echo "Token: $TOKEN"

# Authed call
curl -s -X GET "$API/api/auth/me" -H "Authorization: Bearer $TOKEN"
```

## Browser Test (Playwright)

```javascript
// Pre-seed the JWT so the page loads as authenticated:
await page.context.add_init_script({
  content: `window.localStorage.setItem('allsale_token', '${JWT}');`
});
await page.goto("https://<preview>/account");
```

## Success Indicators
- ✅ `/api/auth/me` returns user data
- ✅ Account page loads without redirect
- ✅ Add-to-cart, checkout flows work

## Failure Indicators
- ❌ 401 Unauthorized → JWT missing/expired or backend URL wrong
- ❌ Stuck on `/auth/callback` → session_id not in URL hash
