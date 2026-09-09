# Auth & RBAC Skill

Use for login, refresh/logout, JWT/refresh cookies, server auth middleware, route guards, permission checks, RBAC UI gating, and authorization changes.

## 7. Auth & RBAC — MUST follow

- Flow: login (`auth/login.post.ts`) validates → rate-limit check → bcrypt → `loadUserPermissions` → inserts `user_agent`+`login_log`+`access_token{token: generateRefreshToken(), expiresAt}` → sets both cookies (`httpOnly, sameSite:'lax', secure in prod, path:'/'`). Refresh (`auth/refresh.post.ts`) MUST rotate (new opaque token persisted, old replaced) and re-`loadUserPermissions`. Logout MUST set `revoked:true, logoutedDate` and delete both cookies.

- `server/middleware/00.auth.ts` allows ONLY `/api/auth/login|refresh|logout` public; every other `/api/**` requires valid `_session_` + live non-revoked `_slid_` row (401 + cookie wipe otherwise). Cookie-only — Bearer header support is commented out, NEVER re-enable without team sign-off.

- Client MUST call protected APIs via `useApi()` (auto silent-refresh on 401, SSR cookie forward, `Accept-Apiclient` + `Accept-Language` headers). NEVER raw `$fetch`/`useFetch`/`useAsyncData` for protected routes — `useFetch`/`useAsyncData` are allowed ONLY for `/api/mock/**` and public GETs (`pages/index.vue:40-61`, `example/*`, `settings/members.vue:4`), plus `useAsyncData` for permission-gated lookups (`app-role/[crud]/[id].vue:79`, `app-user/[crud]/[id].vue:160`).

- Client route guard chain MUST stay ordered `00.seo → 01.auth → 02.check-permit` (numeric prefix = execution order). Pages MUST declare:

  ```ts

  definePageMeta({ pageName: 'model_user', requiresPermission: ['app_user_list'] }) // list

  definePageMeta({ layout: false }) // login (app/pages/auth/login.vue:5-7)

  ```

  `01.auth.global.ts` redirects unauthed to `/auth/login?continue=...` unless in `AuthNoFilterPage` (`app/libs/constants.ts:71-77`); `02.check-permit.global.ts` throws 403 if `isHavePermissionLazy(requiresPermission)` fails. Permissions ride in the access-JWT payload — after role changes tokens MUST refresh (client silent-refresh covers this; do not read perms from JWT server-side, server re-queries via `loadUserPermissions`).

- Login rate limit (`server/utils/loginRateLimit.ts`): key `identifier|ip`, 5 attempts / 15 min via `useStorage('login-rate-limit')`. MUST keep dummy-hash compare on unknown user (timing-attack guard in `login.post.ts`).


## Security Boundary

Client `v-rbac` and route middleware improve UX only. Server-side permission/auth checks remain authoritative.
