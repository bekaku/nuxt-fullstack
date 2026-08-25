---
name: nuxt-fullstack-dev
description: Use when working in this Nuxt 4 + Drizzle + PostgreSQL fullstack repo — adding API routes, CRUD modules, RBAC permissions, auth changes, DB schema/migrations, file uploads/CDN, websockets, or i18n strings. Covers project structure, conventions, and verification commands.
---

# Nuxt Fullstack Development

Nuxt 4 (SSR) + Nuxt UI 4 + Tailwind 4 + Pinia + Drizzle ORM + PostgreSQL 18.
JWT HTTP-Only cookie auth (15m access token `_session_`, 7d opaque refresh token `_slid_`) with RBAC.

## Commands

```bash
pnpm dev              # dev server on 0.0.0.0:3000
pnpm lint             # eslint (stylistic: no comma dangle, 1tbs braces)
pnpm typecheck        # nuxt typecheck
pnpm db:generate      # drizzle-kit generate (after editing schema)
pnpm db:migrate       # apply migrations
pnpm db:push          # push schema directly (dev only)
pnpm db:studio        # drizzle studio
pnpm db:seed          # seed permissions/roles/admin user
docker compose -f docker-compose-postgres.yml up -d   # local Postgres 18
```

There are NO tests. Verify work with `pnpm lint && pnpm typecheck`.

## Project layout

- `app/pages/` — pages; generic CRUD pages live at `<module>/[crud]/[id].vue`
- `app/composables/` — ~30 composables: `useAuth`, `useApi` (auto silent-refresh on 401), `useRbac`, `useCrudList`, `useCrudForm`, `useSocket`, `useUpload`
- `app/middleware/` — numbered global chain: `00.seo.global.ts` → `01.auth.global.ts` → `02.check-permit.global.ts`
- `app/plugins/rbac.ts` — registers `v-rbac` directive (UI-side permission checks)
- `server/api/` — Nitro API routes (`auth/`, `appUser/`, `appRole/`, `permission/`, `fileManager/`, `favoriteMenu/`)
- `server/middleware/00.auth.ts` — global JWT guard; public paths: login/refresh/logout only
- `server/database/schema.ts` — all 22 tables; PKs are Snowflake-style bigints
- `server/utils/` — `jwt.ts`, `password.ts` (bcryptjs), `permission.ts` (`requirePermission`), `dbPaging.ts`, `snowflake.ts`
- `shared/types/` — types shared between client and server
- `i18n/locales/{en,th}/` — each locale has `app.json`, `base.json`, `error.json`, `helper.json`, `model.json`; strategy is `no_prefix`, default locale `th`

## Key conventions

### RBAC
- Permission naming: `<table>_<action>` (e.g. `app_user_create`).
- Server-side: protect endpoints with `requirePermission('<table>_<action>')` from `server/utils/permission.ts`.
- Client-side: use the `v-rbac` directive:
  ```vue
  <UButton
    v-rbac="{
      permissions: ['user_manage_not_exist', 'app_role_add'],
      condition: 'any',
    }"
  />
  ```
- Permissions are carried inside the JWT access token payload — after changing a user's roles, tokens must be refreshed.

### Adding a CRUD module
1. Add table to `server/database/schema.ts`, then `pnpm db:generate && pnpm db:migrate`.
2. Add permission rows to seed (`server/database/seed.ts`) or insert directly.
3. Create `server/api/<module>/index.get.ts`, `index.post.ts`, `[id].get.ts`, `[id].delete.ts` — follow the existing `appUser/` routes and use `dbPaging.ts` for lists.
4. Create page at `app/pages/<module>/[crud]/[id].vue` using `useCrudList` / `useCrudForm` composables.

### Auth flow
- Access JWT carries `permissions[]` in its payload. Refresh token is opaque and validated against the DB `access_token` table (revocation-aware).
- Client calls go through `useApi()` which silently refreshes on 401. Never call `$fetch('/api/...')` directly for protected endpoints.

### Files / CDN
- Uploads via `server/api/fileManager/`, stored under `data/<YYYYMM>/`, served at `/cdn/**` by `server/routes/cdn/[...filename].ts`.
- MIME whitelist + size limits configured in `nuxt.config.ts` runtimeConfig (`acceptFiles`, `limitFileUploadSize`).

### i18n
All user-facing strings must be added to BOTH `th` and `en` JSON files under `i18n/locales/`. Default/fallback locale is Thai.

## Gotchas
- Runtime config secrets come from `.env` (see `.env.example`) — never hardcode JWT secrets.
- Bigint IDs serialize as strings across the wire; server plugin `bigint.ts` handles conversion — don't compare IDs with `===` against numbers.
- Cropperjs custom elements (`cropper-canvas` etc.) are registered as Vue custom elements in `nuxt.config.ts`.
- Nitro experimental features in use: openAPI, websocket, tasks. Scheduled task `cleanup-temp` runs nightly at 3 AM.
