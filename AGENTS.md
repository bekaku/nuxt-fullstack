# AGENTS.md

## 1. Project Identity

Nuxt 4 fullstack starter (`nuxt-fullstack`): SSR web app + Nitro API + PostgreSQL,
with JWT HTTP-only cookie auth and server-enforced RBAC. Package manager is pnpm.
No Pinia. No test framework.

## 2. Verified Technology Stack

| Layer | Technology (verified in `package.json`, `nuxt.config.ts`) |
|---|---|
| Framework | Nuxt 4.5 SSR (`app/`, `compatibilityVersion: 5`) |
| UI | Nuxt UI 4 + Tailwind CSS 4 |
| API | Nitro server routes (`server/api/`) |
| ORM / DB | Drizzle ORM 0.45 + PostgreSQL 18 |
| Validation | Zod 4 (`readValidatedBody(event, schema.parse)`) |
| Auth | `jsonwebtoken` 9 + `bcryptjs` 3, HTTP-only cookies |
| i18n | `@nuxtjs/i18n`, locales `th` (default) / `en`, `no_prefix` strategy |
| Realtime | Nitro WebSocket (`server/routes/ws.ts`); AI streaming via Vercel AI SDK 7 |

## 3. Architecture Overview

- `app/` — Nuxt client: `pages/`, `components/<domain>/*.vue`, `composables/use*.ts`,
  `api/use*Api.ts`, `middleware/00|01|02.*.global.ts`, `layouts/`, `plugins/`, `types/`.
- `server/` — Nitro backend: `api/<camelCaseModule>/` handlers, `middleware/00.auth.ts`,
  `database/{schema,client,seed}.ts`, `utils/`, `plugins/`, `routes/`, `tasks/`.
- `shared/types/` — effectively empty; canonical shared types live in `app/types/`.
- `drizzle/` — generated SQL migrations. `i18n/locales/{en,th}/` — UI strings.
- Auth boundary: `server/middleware/00.auth.ts` verifies JWT + live session;
  each handler enforces its own permission. Client `v-rbac`/route middleware is UX only.

## 4. Required Reading

1. Read this file (`AGENTS.md`) first.
2. Identify the task type and load only the matching skill(s) from `.agents/skills/`
   (see `docs/agent/skills-index.md`). Read supporting references only when needed.
3. Inspect the affected source files before modifying them.

## 5. Repository Navigation

- Pages: `app/pages/<kebab-case>/index.vue` (list) + `app/pages/<kebab-case>/[crud]/[id].vue` (form).
- Client API helpers: `app/api/use*Api.ts` (via `useApi()`).
- Server handlers: `server/api/<camelCaseModule>/{index.get,index.post,[id].get,[id].delete}.ts`.
- Schema: `server/database/schema.ts`. Seed/permissions: `server/database/seed.ts`.
- AuthN/Z helpers: `server/utils/{jwt,permission,password,loginRateLimit}.ts`,
  `server/utils/validate.ts` (`validateID`), `server/utils/dbPaging.ts` (`paginate`),
  `server/utils/{exception,modelMapper}.ts`.
- Types: `app/types/{common,models,props}.ts`. Response envelope: `ResponseEntity<T>`.
- Open questions: `docs/OPEN_QUESTIONS.md`. Known traps: `docs/FOOTGUNS.md`.
- Agent architecture docs: `docs/agent/`.

## 6. Coding Conventions

- Inspect existing code first; follow the conventions of the files you touch.
- Reuse existing utilities, components, and composables; do not reinvent them.
- Make the smallest change that satisfies the task; modify only relevant files.
- Preserve backward compatibility (API shapes, permission codes, i18n keys) unless asked.
- Naming: components PascalCase domain-grouped (`base/Base*.vue`); composables
  `use*.ts` (keep the `usePagefecth.ts` typo as-is); server module dirs camelCase
  (`appUser/`, `appRole/`); page dirs kebab-case; DB tables/columns snake_case,
  TS fields camelCase; permission codes `<table>_<action>` with
  action in `list|view|add|edit|delete`; API paths `/api/<camelCase>`;
  cookies `_session_` / `_slid_` / `_sid` (from runtime config, never hardcode).
- Style: 2-space indent, LF, no trailing commas, 1tbs braces, max 3 attributes
  per single-line element, kebab-case custom events. No new `<style>` blocks
  (Tailwind inline), no new `withDefaults` (reactive prop destructure), no new
  `any` (do not mass-refactor existing `any` either).

## 7. Frontend Rules

- `<script setup lang="ts">` first, `<template>` second; never Options API.
- Shared client state via namespaced `useState` (never Pinia, never
  `provide`/`inject` for app state). Two-way binding via `defineModel`.
- Protected requests go through `useApi()` (silent refresh, SSR cookie forward);
  never raw `$fetch`/`useFetch`/`useAsyncData` for protected routes.
- Gate UI with `v-rbac` / `BaseTable` permission props (UX only, never security).
- Pages declare `definePageMeta({ requiresPermission: [...] })`;
  keep middleware order `00.seo → 01.auth → 02.check-permit`.
- Every user-facing string goes to both `i18n/locales/en/*.json` and `th/*.json`
  via `useLang()`/`$t`; handle `dark:` variants and mobile-first responsive layout.
- Preserve SSR behavior; keep explicit `color="primary" variant="solid"` on
  primary actions (global button default is `subtle/neutral`).

## 8. Backend Rules

- Every protected handler calls its auth guard FIRST, before any DB work:
  `requirePermission` (single code), `requireAnyPermission` (upsert POST),
  or `getAuthUser` (user-scoped only).
- Validate untrusted bodies with `readValidatedBody(event, bodySchema.parse)`
  (Zod 4); `:id` params via `validateID(event)`; filters via `paginate()`.
- Response shape is `ResponseEntity<T>` (`{ status: 200, data? }`); lists wrap in
  `ApiResponse<T>` via `paginate()` (both queries end with `.$dynamic()`,
  page size caps at 100); create sets HTTP 201 header while returning
  `{ status: 200, data }`; delete returns `{ status: 200 }` with no `data`.
- Errors via `createError({ statusCode, statusMessage })` (400/401/403/404/409/429;
  login wrong-credentials is intentionally 403); catch-all via `serverException`
  (never leak driver errors).
- Multi-write operations wrap in `db.transaction` (login/refresh/logout stay
  non-transactional by design). Scope soft-deleted rows, select explicit columns,
  `limit(1)` single-row reads.

## 9. Database Rules

- Schema in `server/database/schema.ts` uses `pgTable` + app-generated
  Snowflake bigint PKs (`bigint('id', { mode: 'bigint' })`); never
  `serial`/`bigserial`/`uuid` PKs. New tables spread `auditFieldsSoftDelete()`.
- Day-to-day: `pnpm db:generate && pnpm db:migrate`. `db:push` is local-dev only.
  Never hand-edit applied SQL; raw SQL/views go through custom migrations.
- Bigint boundary: inbound `BigInt(stringId)`, outbound `.toString()`; never
  compare bigint IDs with `===` against numbers.
- New modules extend `RESOURCES` in `server/database/seed.ts` (all five
  `<table>_{list,view,add,edit,delete}` permissions), then `pnpm db:seed`.

## 10. Security Rules

- Client-side RBAC is never a security boundary; protected handlers must enforce
  authorization server-side.
- Never expose credentials, tokens, or secrets in code, logs, or responses.
- Login keeps generic error messages, dummy-hash compare, and rate limiting
  (5 attempts / 15 min per identifier+IP); do not weaken them.
- Validate MIME whitelist + 50 MB limit on uploads; store under `cdnDirectory`
  and serve via `/cdn/**` only.

## 11. Testing and Verification

- No test framework exists; do not add one without an explicit task.
- Canonical gate: `pnpm typecheck`. Run `pnpm build` for runtime-affecting changes.
- Follow the database skill for schema changes (generated migrations only).
- Verify affected code and report any tests/checks that could not be executed.

## 12. Forbidden Operations

- No destructive database operations (`db:push` outside local dev, manual
  table drops, hand-edited applied migrations).
- No migrations without an explicit task requiring schema changes.
- No silently introduced dependencies, frameworks, or architectural patterns.
- No credential exposure. No weakening auth/RBAC/error-handling behavior
  documented as intentional (see `docs/FOOTGUNS.md`).

## 13. Standard Agent Workflow

1. Read `AGENTS.md` and discover skills (section 14).
2. Load only the relevant `SKILL.md` file(s); read references on demand.
3. Inspect affected source files; plan the minimal change.
4. Implement, reusing existing utilities/components and preserving conventions.
5. Verify (`pnpm typecheck`, plus `pnpm build` when runtime-affected).
6. Review the diff; confirm only relevant files changed and no secrets leaked.
7. Stop when success criteria pass; report unverifiable checks and residual risks.

## 14. Skill Discovery and Selection

1. Read `AGENTS.md`.
2. Skim skill descriptions in `docs/agent/skills-index.md`
   (or the `description` frontmatter of each `.agents/skills/*/SKILL.md`).
3. Load only the `SKILL.md` files relevant to the task.
4. Read supporting `references/` and `docs/agent/` files only when necessary.
5. Inspect affected source files.
6. Plan and implement the requested changes.
7. Verify the result per the skill's Verification section.

If the agent does not support automatic skill discovery, read the relevant
`SKILL.md` files directly by path. Do not load every skill by default.
