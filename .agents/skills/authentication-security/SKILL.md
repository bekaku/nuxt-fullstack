---
name: authentication-security
description: Use when changing login, refresh, logout, sessions, cookies, JWT, permission helpers, permission codes, route guards, RBAC UI behavior, ownership rules, or login rate limiting. A normal handler that only calls an existing permission code needs nitro-backend instead.
---

# Authentication & Security

Read `AGENTS.md` first, then the files for the path you change. Check
`docs/FOOTGUNS.md` before "fixing" anything that looks odd — several behaviors are intentional.

## 1. How auth works here (verified in code)

```
login.post.ts ──► access JWT {sub:userId} in cookie `_session_` (15 min)
               └► opaque refresh token (uuidv7) in cookie `_slid_` + row in `access_token` table (7 days)
every /api/** ─► server/middleware/00.auth.ts
                   no access cookie        → request continues ANONYMOUS (handler decides)
                   cookie valid + session row live → event.context.user = { sub }
                   cookie invalid / session revoked → clear cookies, 401
handler ───────► requirePermission / requireAnyPermission / requireAllPermission (DB lookup of current grants)
                 or getAuthUser (401 if anonymous) + owner filter
client 401 ───► useApi() calls POST /api/auth/refresh once (single-flight), rotates tokens, retries
```

- The JWT holds only `sub`. Roles/permissions are **not** in the token; the login and
  `/api/auth/me` responses give them to the client (`auth.value.permissions`).
- Cookie names come from runtime config (`jwtKeyName`, `refreshJwtKeyName`); never hardcode them.
  Flags: `httpOnly`, `sameSite: 'lax'`, `path: '/'`, `secure` in production.
- Bearer-header auth is commented out in `00.auth.ts`; enabling it is an auth design change.

| Concern | Files |
|---|---|
| Login / refresh / logout / me | `server/api/auth/{login.post,refresh.post,logout.post,me.get}.ts` |
| Token + password helpers | `server/utils/{jwt,password,loginRateLimit}.ts` |
| Server guards | `server/utils/permission.ts` |
| Permission codes | `server/database/seed.ts` (`RESOURCES` × `list,view,add,edit,delete`) |
| Client auth / RBAC | `app/composables/{useApi,useAuth,useRbac,useMenu}.ts`, `app/plugins/{00.auth.client,00.auth.server,rbac}.ts` |
| Client route guards | `app/middleware/01.auth.global.ts`, `app/middleware/02.check-permit.global.ts` |

## 2. Decide the protection level of an endpoint

| Question | Answer → guard |
|---|---|
| Is it admin/business data managed by roles? | `requirePermission(event, '<table>_<action>')` |
| Is it one upsert endpoint for add + edit? | `requireAnyPermission(event, ['<t>_add','<t>_edit'])`, then after parsing the body `requirePermission(event, body.id ? '<t>_edit' : '<t>_add')` |
| Does the user only touch **their own** rows? | `const auth = getAuthUser(event)` and filter every query by owner (`createdUser` / `appUser` = `BigInt(auth.sub)`) |
| Must anonymous users call it? | No guard — only with an explicit reason; validate input strictly and rate-limit if abusable |

The guard is the first statement, before any DB, file, or external-service work.

## 3. Adding permission codes

1. Add the snake_case resource to `RESOURCES` in `server/database/seed.ts` (gives 5 codes).
   A code outside the 5 actions (e.g. `report_export`) needs a manual row in `permission`
   (Permission admin page) — keep the `<table>_<action>` shape.
2. Use the same strings in: handler guards, `definePageMeta({ requiresPermission })`,
   `v-rbac` / `BaseTable`/`BaseForm` permission props, `useMenu.ts` `permissions`.
3. Existing databases get new codes by rerunning `pnpm db:seed` (idempotent: adds only missing
   codes/grants). Run it only when applying to a known, intended database is in scope; otherwise report it as a deploy step.
4. The client only sees new permissions after re-login, a token refresh, or `/api/auth/me`.

Client checks (`requiresPermission`, `v-rbac`, menu `permissions`, `byPassPermission`)
only hide UI. They are never a substitute for the server guard.

## 4. Invariants — do not change unless the task explicitly asks

- Wrong credentials return **403** with one generic message; unknown users still run bcrypt
  against `DUMMY_HASH` (timing safety).
- Rate limit: 5 failures / 15 min per identifier+IP (`loginRateLimit.ts`) → 429 (storage: see §5).
- Refresh rotates the refresh token; logout revokes it; password change deletes other sessions.
- Login/refresh/logout are intentionally not wrapped in one transaction.
- Never log or return passwords, hashes, tokens, cookies, or secrets. Never put secrets in `runtimeConfig.public`.

## 5. Established policies (reuse, do not reinvent)

| Situation | Use |
|---|---|
| Read/stream/delete a stored file by id | `assertFileAccess(event, BigInt(id), 'view' \| 'delete')` — owner, or `file_manager_<action>` permission |
| List files | `canAccessAllFiles(event, 'list')` → all files, else `owner = auth.sub` |
| Server fetches a URL the user supplied | `fetchPublicHtml` / `assertPublicHttpUrl` (`server/utils/safeFetch.ts`): login required, http(s) only, blocks private/loopback/link-local IPs on every redirect |
| Developer/test endpoint | `await requireDevEndpoint(event)` (`server/utils/devOnly.ts`) — 404 in production builds |
| Upsert POST | any-check first, then exact `_add`/`_edit` after parsing (all current upserts do this) |

Still open (by design, not bugs): `server/api/mock/**` returns static demo data without a guard.
Login rate limiting uses per-process memory storage mounted in `nuxt.config.ts`
(`nitro.storage['login-rate-limit']`); `ecosystem.config.cjs` runs one instance — switch that mount to
a shared driver (Redis) before scaling out.

## 6. Done checklist

- [ ] Every new/changed protected handler starts with the right guard (section 2).
- [ ] Owner filter present on user-scoped reads, updates, and deletes.
- [ ] Permission strings identical in seed, handler, page meta, buttons, and menu.
- [ ] No weakened invariant from section 4; no secrets in code, logs, or responses.
- [ ] `pnpm typecheck`; `pnpm build` for runtime changes. Do **not** run `pnpm lint`.
- [ ] With a local environment: login → protected call → wait/force 401 → refresh → logout → old cookie rejected,
      plus one denied-permission and one wrong-owner request. Report steps you could not run.
