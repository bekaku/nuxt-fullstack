---
name: authentication-security
description: Use for auth and authorization work — login/refresh/logout, JWT and session cookies, server auth middleware, permission helpers, route guards, RBAC UI gating, and rate limiting. Load when the task touches server/api/auth/, server/middleware/00.auth.ts, server/utils/permission.ts, server/utils/jwt.ts, app/middleware/01.auth.global.ts, app/middleware/02.check-permit.global.ts, or permission-gated UI.
---

# Authentication & Security

## Purpose

Covers the full authN/Z system: JWT access tokens, opaque refresh rotation,
session tracking, server enforcement, client guards, permission codes, and
login hardening.

## When to Use

- Login, refresh, logout, `me`, password/profile, or session-handling changes.
- Permission checks, new permission codes, role/permission assignment.
- Client route guards, `v-rbac` gating, menu filtering by permission.
- Rate limiting, cookie handling, or token-lifetime changes.

## When Not to Use

- CRUD work that only *consumes* existing permission codes (use `nitro-backend` /
  `fullstack-feature`; load this skill only when authorization behavior changes).
- Pure UI changes with no permission logic.

## Required Reading

- `AGENTS.md` (sections 8, 10, 12).
- `docs/agent/project-map.md` (authentication & authorization).
- `docs/FOOTGUNS.md` (intentional 403, `v-rbac` is UX-only).

## Repository Evidence

- Login: `server/api/auth/login.post.ts` (rate limit → bcrypt + dummy hash → `loadUserPermissions`
  → `user_agent` + `login_log` + `access_token` rows → two HTTP-only cookies, 403 on failure).
- Refresh/logout: `server/api/auth/refresh.post.ts` (rotation), `server/api/auth/logout.post.ts`
  (revoke + cookie deletion).
- Boundary: `server/middleware/00.auth.ts` (public: login/refresh/logout only; others need
  valid `_session_` + live non-revoked `_slid_` row, else 401 + cookie wipe).
- Helpers: `server/utils/jwt.ts`, `server/utils/permission.ts`
  (`requirePermission` / `requireAnyPermission` / `getAuthUser` / `loadUserPermissions`),
  `server/utils/loginRateLimit.ts` (5 attempts / 15 min per identifier+IP), `server/utils/password.ts`.
- Client: `app/composables/useApi.ts` (single-flight silent refresh, SSR cookie forward),
  `app/composables/useAuth.ts`, `app/composables/useRbac.ts`,
  `app/middleware/01.auth.global.ts`, `app/middleware/02.check-permit.global.ts`,
  `app/plugins/rbac.ts`, `app/libs/constants.ts` (`AuthNoFilterPage`).
- Config: `nuxt.config.ts` runtimeConfig (cookie names `_session_` / `_slid_` / `_sid`,
  15 min access TTL, 7-day refresh, `acceptFiles`, 50 MB upload limit).

## Workflow

1. Read the affected auth file(s) plus `00.auth.ts` before changing anything.
2. Keep the boundary intact: cookie-only transport, server re-queries permissions
   via `loadUserPermissions` (never trust JWT permissions server-side).
3. Preserve hardening: generic login errors, dummy-hash compare, rate limiting,
   refresh rotation, revocation on logout.
4. Mirror server rules in UI only (`requiresPermission`, `v-rbac`) — never as the gate.
5. Verify with `pnpm typecheck` (+ `pnpm build` for runtime-affecting changes);
   exercise login → guarded route → refresh → logout.

## Implementation Rules

- Protected handlers call `requirePermission` / `requireAnyPermission` / `getAuthUser` FIRST.
- Permission codes are `<table>_<action>` with action in `list|view|add|edit|delete`; never invent actions.
- Cookies are `httpOnly`, `sameSite: 'lax'`, `secure` in production, `path: '/'`; names come
  from runtime config, never hardcoded.
- Bearer-header auth stays disabled (commented out by design).
- Never expose credentials, tokens, or secrets in code, logs, or responses.

## Anti-Patterns

- Client-only permission enforcement; trusting JWT permissions server-side.
- Specific login errors (account enumeration); removing dummy-hash or rate limiting.
- Refresh without rotation; logout without revocation.
- `byPassPermission` on real modules; re-enabling Bearer auth without approval.

## Verification

- `pnpm typecheck` (canonical gate); `pnpm build` for runtime-affecting changes.
- Manual flow test: login → protected endpoint → expired-access refresh → logout → revoked access.
- Report any flow step that could not be executed (e.g. no live DB).

## Completion Criteria

- Server remains the sole authorization authority; hardening preserved.
- Only relevant auth files changed; no secrets leaked; `pnpm typecheck` passes.
