---
name: nuxt-fullstack-dev
description: Use when working in this Nuxt 4 + Drizzle + PostgreSQL fullstack repo. Load additional task-specific skill files only when relevant.
---

# Nuxt Fullstack Core Skill

Nuxt 4 (SSR, `app/` dir, `compatibilityVersion: 5`) + Nuxt UI 4 + Tailwind 4 + Drizzle ORM + PostgreSQL 18.

Zod 4 for validation. pnpm is pinned to `pnpm@11.13.1`. Authentication uses JWT HTTP-only cookies (15m access `_session_`, 7d opaque refresh `_slid_`) with RBAC.

No Pinia. No tests. `shared/types/index.d.ts` is empty; shared types live in `app/types/`.

## Scope

Use this skill for work in this Nuxt 4 + Drizzle + PostgreSQL fullstack repository.

## Core Project Rules

## 1. Project structure — MUST follow

- MUST use Nuxt 4 `app/` directory (no `src/`). Server routes under `server/`, never under `app/server/`.

- Layout: `app/pages/`, `app/composables/use*.ts` (28 files), `app/components/<domain>/*.vue`, `app/api/use*Api.ts` (auto-imported via `imports.dirs: ['api']`), `app/utils/`, `app/libs/` (only `constants.ts`), `app/types/`, `app/middleware/00|01|02.*.global.ts`, `app/plugins/`, `app/layouts/{default,empty,feed,ai,chat}.vue`.

- Server: `server/api/<camelCaseModule>/{index.get,index.post,[id].get,[id].delete}.ts`, `server/middleware/00.auth.ts` (Nitro, no `.global` suffix), `server/database/{schema,client,seed}.ts`, `server/utils/*.ts`, `server/plugins/{bigint,date}.ts`, `server/routes/{cdn/[...filename].ts,ws.ts}`, `server/tasks/cleanup-temp.ts`.

- Server module dirs MUST be camelCase (`appUser/`, `appRole/`, `aiChat/`, `fileManager/`, `favoriteMenu/`); lowercase only for `auth/`, `permission/`, `mock/`, `test/`. Verified in `server/api/` listing.

- Frontend page dirs MUST be kebab-case (`app/pages/app-user/`, `app-role/`); generic CRUD = `<module>/index.vue` (list) + `<module>/[crud]/[id].vue` (form/detail). Verified: `app/pages/app-user/index.vue` + `app/pages/app-user/[crud]/[id].vue`.

- Client API helpers MUST live in `app/api/use*Api.ts` (only `useFavoriteMenuApi.ts` exists — follow it):

  ```ts

  export const useFavoriteMenuApi = () => {

    const api = useApi()

    return { createFavorite: (*url*: *string*) => api('/api/favoriteMenu', { method: 'POST', body: { url } }) }

  }

  ```


## 2. Naming — MUST follow

- Components MUST be PascalCase, domain-grouped: `base/Base*.vue` (~41 files), `chat/Chat*.vue`, `chart/Chart*.vue`, `inbox/Inbox*.vue`, `user/User*.vue`. NEVER flat-lowercase.

- Composables MUST be `usePascalCase.ts` (`useApi`, `useAuth`, `useRbac`, `useCrudList`, `useCrudForm`, `usePaging`, `useSort`, `useSocket`, `useUpload`, `useLang`, `useTheme`, `useMenu`, `useLoader`, `useConfirmDialog`). Keep typo `usePagefecth.ts` as-is; NEVER create a second correctly-spelled copy.

- DB tables/columns MUST be snake_case (`app_user`, `avatar_file_id`), TS fields camelCase (`avatarFileId`). Verified in `server/database/schema.ts`:

  ```ts

  export const appUser = pgTable('app_user', { avatarFileId: bigint('avatar_file_id', { mode: 'bigint' }) })

  ```

- Permission codes MUST be `<table>_<action>`, action in `list|view|add|edit|delete` (e.g. `app_user_add`). Verified in 27+ call sites (`appUser/index.get.ts:15`, `appRole/[id].delete.ts:8`, `aiDocumentMeta/ingest/[id].post.ts:11`). `seed.ts` generates via `` `${resource}_${action}` `` from `RESOURCES × ACTIONS`. NEVER invent actions (`manage`, `create`, `remove`).

- API endpoint paths MUST be `/api/<camelCase>` (`/api/appUser`, `/api/appRole`, `/api/userProfile`); `crudName` option MUST be PascalCase (`UserProfile`, `AppRole`) and MUST match between `useCrudList` and `useCrudForm`.

- Cookie/key names MUST be `jwtKeyName: '_session_'`, `refreshJwtKeyName: '_slid_'`, `currentUserKeyName: '_sid'` (from `nuxt.config.ts` runtimeConfig). NEVER hardcode other names.


## Commands and Verification

## Commands

```bash

pnpm dev              # dev server on 0.0.0.0:3000

pnpm typecheck        # nuxt typecheck (vue-tsc; canonical verifier)

pnpm build            # production build

pnpm preview          # preview built output

pnpm db:generate      # drizzle-kit generate (after editing schema)

pnpm db:migrate       # apply migrations (day-to-day canonical)

pnpm db:push          # push schema directly (dev only, NEVER in prod)

pnpm db:studio        # drizzle studio

pnpm db:seed          # tsx server/database/seed.ts — permissions/roles/admin user

docker compose -f docker-compose-postgres.yml up -d   # local Postgres 18

```

There are NO tests (`**/*.{test,spec}.*` = 0 hits, no vitest/jest/playwright). Verify with `pnpm typecheck`.


## 10. Testing — MUST follow

- No test infra exists. MUST NOT add `vitest/jest/playwright/cypress` config in feature PRs without team sign-off. Verification = `pnpm typecheck` (+ manual click-through of affected pages/endpoints).


## 11. Lint/format — MUST follow

- Actual config (`eslint.config.mjs` + `nuxt.config.ts:112-119` + `.editorconfig`): 2-space indent, LF, `commaDangle: never`, `braceStyle: 1tbs`, `vue/max-attributes-per-line: singleline 3` (max 3 attrs per line — split BaseTable/BaseForm prop lists multiline like existing pages), custom events kebab-case, `vue/attributes-order` + `vue/html-self-closing` + `vue/require-explicit-emits` as warn, `no-console: off`, `no-explicit-any: off`, `multi-word-component-names: off`. No `.prettierrc` (stylistic via eslint + editorconfig).

- MUST use `pnpm typecheck` as the gate; MUST still hand-match the style rules above (no trailing commas, 1tbs braces, ≤3 attrs/line).


## Task Routing

Read additional files only when relevant:

- Frontend/components/state/styling/types/i18n → `FRONTEND.md`
- Nitro APIs/server routes → `SERVER_API.md`
- Drizzle/database/migrations → `DATABASE.md`
- Auth/RBAC/permissions → `AUTH_RBAC.md`
- Full CRUD creation/change → `CRUD_WORKFLOW.md`

When debugging unusual existing behavior, consult `../../docs/FOOTGUNS.md`.
