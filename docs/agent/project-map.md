# Project Map (verified)

Source of architectural truth for agents. Claims below were read from the
repository files cited; see `audit-report.md` for coverage and open questions.

## Verified Technology Stack

| Layer | Technology | Evidence |
|---|---|---|
| Framework | Nuxt 4.5 SSR, `compatibilityVersion: 5`, `app/` dir | `package.json` (`nuxt ^4.5.2`), `nuxt.config.ts:330` |
| UI | Nuxt UI 4 + Tailwind CSS 4 | `package.json` (`@nuxt/ui ^4.11.0`, `tailwindcss ^4.3.3`) |
| API | Nitro (`.ts` handlers, middleware, plugins, tasks, WebSocket) | `server/api/`, `server/middleware/00.auth.ts`, `nuxt.config.ts:304-319` |
| ORM / DB | Drizzle ORM 0.45 / drizzle-kit 0.31 + PostgreSQL 18 | `package.json`, `drizzle.config.ts`, `docker-compose-postgres.yml` |
| Validation | Zod 4 | `package.json` (`zod ^4.4.3`), `server/api/auth/login.post.ts:12` |
| Auth | `jsonwebtoken` 9 + `bcryptjs` 3, HTTP-only cookies | `package.json`, `server/api/auth/login.post.ts` |
| i18n | `@nuxtjs/i18n`, `no_prefix`, default/fallback `th`, locales `en`/`th` | `nuxt.config.ts:85-110`, `i18n/locales/` |
| Realtime/AI | Nitro WebSocket (`crossws`), Vercel AI SDK 7, Ollama, Qdrant | `server/routes/ws.ts`, `package.json` (`ai ^7.0.79`) |
| Package manager | pnpm `11.13.1` (pinned) | `package.json:97` |
| Node target | Node 22 (Nitro esbuild target; CI matrix node 22) | `nuxt.config.ts:306`, `.github/workflows/ci.yml` |

No Pinia (`defineStore` = 0 hits). No test files (`*.test.*` / `*.spec.*` = 0 hits).

## Repository Directory Map

```
app/                  Nuxt client (SSR)
  pages/              Routes: index, auth/, app-user/, app-role/, permission/,
                      ai-chats/, ai-document-meta/, my-drive/, watch/, example/, test/, settings/
  components/<domain>/*.vue   base/ (~41 Base*.vue), chat/, chart/, inbox/, user/, ...
  composables/use*.ts (28)    useApi, useAuth, useRbac, useCrudList, useCrudForm, usePagefecth*, ...
  api/use*Api.ts      Client API helpers (only useFavoriteMenuApi.ts — template for new ones)
  middleware/         00.seo.global.ts, 01.auth.global.ts, 02.check-permit.global.ts
  layouts/            default, empty, feed, ai, chat
  plugins/            00.auth.client/server, rbac (v-rbac), toast, datefns, apexchart, ...
  types/              common.ts (ResponseEntity, ApiResponse, pagination), models.ts, props.ts
  libs/               constants.ts (AuthNoFilterPage), snowflake re-export
  utils/              Client utilities
  assets/css/main.css Theme tokens (@theme: fonts, success/error/warning scales, --ui-*)
  app.config.ts       UI defaults (primary blue, neutral stone; button default subtle/neutral)
server/               Nitro backend
  api/<camelCase>/    auth/ appUser/ appRole/ permission/ aiChat/ aiDocumentMeta/
                      fileManager/ favoriteMenu/ mock/ test/ + meta.ts, test-socket-send.post.ts
  middleware/00.auth.ts  JWT + live-session gate for /api/**
  database/           schema.ts, client.ts (useDb), seed.ts, migrate/, mysql/
  utils/              jwt, permission, password, loginRateLimit, validate, dbPaging,
                      exception, modelMapper, snowflake, storage, files, wsManager, user, ...
  plugins/            bigint.ts (transport), date.ts
  routes/             cdn/[...filename].ts, ws.ts
  tasks/              cleanup-temp.ts (nightly 3 AM cron)
  services/ai/        RAG pipeline (document-parser, document-chunker, embedding, ingestion)
shared/types/         Effectively empty (index.d.ts) — canonical types live in app/types/
drizzle/              Generated SQL migrations (+ meta journal)
i18n/locales/{en,th}/  app, base, helper, model, error .json + index.ts
```

Naming: server modules camelCase (`appUser`, `appRole`, `aiChat`, `fileManager`, `favoriteMenu`);
lowercase only `auth`, `permission`, `mock`, `test`. Pages kebab-case. DB snake_case, TS camelCase.

## Frontend Architecture

- Routing: file-based; list page `<module>/index.vue` + form page `<module>/[crud]/[id].vue`.
- Data: `useCrudList<T>` (pagination/sort/search/delete/navigation) + `useCrudForm<T>`;
  `usePagefecth<T>` (sic — keep typo, never duplicate correctly-spelled) for query-synced fetch.
- Transport: ALL protected calls via `useApi()` (`app/composables/useApi.ts`) — SSR cookie
  forward (`useRequestHeaders(['cookie'])`), shared `_responseCookies` map, single-flight
  `_refreshPromise` → `POST /api/auth/refresh` on 401 → retry. Raw `$fetch`/`useFetch`/
  `useAsyncData` allowed only for `/api/mock/**` and public GETs.
- State: namespaced `useState` (`auth:user`, `auth:navigations`); `createSharedComposable`
  / module singletons for cross-component singletons; `provide` only in plugins (`$toast` etc.).
- UI: Nuxt UI components; generics `BaseTable<T>`/`BaseForm<T>` with `#field-<key>` /
  `#<key>-cell` slots; explicit `color="primary" variant="solid"` on primary actions.
- Guards: `definePageMeta({ requiresPermission })` → `01.auth` (redirect to
  `/auth/login?continue=`) → `02.check-permit` (403). `v-rbac` hides DOM nodes (UX only).
- i18n: `useLang()` + `t()` in script, `$t()` in template; `no_prefix`; `locale` cookie.

## Backend Architecture

- Handlers: `defineEventHandler` per file; guard FIRST, then DB. Three tiers:
  `requirePermission(event, code)` · `requireAnyPermission(event, [add, edit])` (upsert POST) ·
  `getAuthUser(event)` (user-scoped: aiChat, fileManager writes, profile/password, me).
- Validation: `readValidatedBody(event, bodySchema.parse)` (Zod 4); `validateID(event)`
  for `:id`; `getQuery` filters through `paginate()`.
- Responses: `ResponseEntity<T>` = `{ status: 200, data? }`; lists = `ApiResponse<T>`
  (`totalPages/currentPage/totalElements/last/dataList`) via `paginate()`; create sets
  HTTP 201 header but returns `{ status: 200, data }`; delete returns `{ status: 200 }`.
- Errors: `createError({ statusCode, statusMessage })`; login wrong-credentials = 403
  (intentional); catch-all `serverException` strips driver internals.
- Listing: `paginate(event, { dataQuery, countQuery, columns, defaultSort, where, transform })`;
  BOTH queries end `.$dynamic()`; page size caps at 100; syntax `?sort=email,asc`,
  `?_q=active=true;email:foo`, `?_keyword=foo`.
- Writes: `db.transaction` for multi-write (user+roles, role+perms); login/refresh/logout
  intentionally non-transactional. Soft-delete `set({ deleted: true })`.

## Database Architecture

- `server/database/schema.ts` (~490 lines, ~20 tables): RBAC (`app_user`, `app_role`,
  `app_user_role`, `permission`, `role_permission`), session (`access_token`, `login_log`,
  `user_agent`, `api_client`, `api_client_ip`), files (`file_manager`, `file_mime`,
  `files_directory`, `files_directory_path`), AI/RAG (`ai_chat`, `ai_chat_message`,
  `ai_document_meta`, `ai_document_vector_ids`, `ai_document_metadata`),
  Thai geography (`province`, `district`, `sub_district`), misc (`favorite_menu`,
  `audit_log`, `system_activity_logs`).
- PKs: app-generated Snowflake bigints (`bigint('id', { mode: 'bigint' })` + `nextId()`);
  never serial/uuid. Audit mixin `auditFieldsSoftDelete()` on new tables.
- Boundary: `BigInt(stringId)` in, `.toString()` out; transport via `server/plugins/bigint.ts`.
- Migrations: `pnpm db:generate && pnpm db:migrate`; `db:push` dev-only; custom SQL via
  `drizzle-kit generate --custom`. Seed: `RESOURCES` (7) × `ACTIONS` (5) = 35 permissions;
  Admin (all) + Viewer (list/view) + `admin@example.com` / `Admin@12345`.
- Connection: `useDb()` singleton (`server/database/client.ts`, `postgres.js`); seed script
  uses its own connection (runs outside Nuxt via `tsx`).

## Authentication & Authorization

Dual-token: 15-min stateless access JWT (embeds `permissions[]`/`roles[]`) in `_session_`
+ 7-day opaque refresh in `_slid_` (`access_token` table, rotation on refresh, revoke on
logout). `00.auth.ts` allows `/api/auth/login|refresh|logout` public; all other `/api/**`
with a token require a live non-revoked session row (else 401 + cookie wipe); no token =
anonymous, route decides. Login hardened: generic errors, dummy bcrypt compare,
5 attempts / 15 min per identifier+IP (`useStorage('login-rate-limit')`).

## End-to-End Feature Flows (traced)

1. **App User list** — `app/pages/app-user/index.vue:9-49`
   (`requiresPermission: ['app_user_list']`, `useCrudList<AppUser>` `crudName: 'AppUser'`,
   `apiEndpoint: '/api/appUser'`) → `useApi()` (cookies, refresh) →
   `server/api/appUser/index.get.ts:15` (`requirePermission 'app_user_list'`) →
   Drizzle `select` + `aliasedTable` self-joins + `.$dynamic()` → `paginate()` →
   `mapToAppUser` (bigint→string, CDN URLs) → `{ status: 200, data: ApiResponse }`.
2. **Login** — `app/pages/auth/login.vue` → `POST /api/auth/login` →
   `server/api/auth/login.post.ts` (Zod body → rate-limit check → bcrypt/dummy-hash →
   `loadUserPermissions` → `user_agent`/`login_log`/`access_token` inserts → two cookies) →
   client `useAuth().setAuth()` → `useState('auth:user')`; guards + `v-rbac` activate.
3. **AI chat stream (user-scoped)** — `app/pages/ai-chats/c/*.vue` → `useAiChat()` →
   `POST /api/aiChat/stream.post.ts:24` (`getAuthUser`, no permission code) → RAG
   (embed query → Qdrant top-4 → context) → `streamText()` SSE via Vercel AI SDK.

## Build and Verification Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server `0.0.0.0:3000` |
| `pnpm typecheck` | Canonical gate (`nuxt typecheck` / vue-tsc) |
| `pnpm build` / `pnpm preview` | Production build / preview |
| `pnpm lint` | ESLint (CI runs install → lint → typecheck) |
| `pnpm db:generate` / `pnpm db:migrate` | Generate / apply migrations |
| `pnpm db:push` | Local-dev only schema push |
| `pnpm db:seed` | Permissions + roles + admin user (`tsx server/database/seed.ts`) |
| `pnpm db:studio` | Browse DB |
| `docker compose -f docker-compose-postgres.yml up -d` | Local PostgreSQL 18 |
