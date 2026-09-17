---
name: nitro-backend
description: Use for Nitro server API work — route handlers, Zod validation, ResponseEntity shapes, paginate() listings, error handling, file/CDN endpoints, WebSocket and scheduled tasks. Load when the task touches anything under server/api/, server/routes/, server/tasks/, or server middleware/plugins.
---

# Nitro Backend

## Purpose

Covers all server-side request handling in this Nitro backend: API routes,
validation, response envelopes, pagination, errors, file serving, realtime,
and scheduled tasks.

## When to Use

- Creating or editing files under `server/api/`, `server/routes/`, `server/tasks/`,
  `server/middleware/`, or `server/plugins/`.
- Changing request/response shapes, pagination, sorting, or filtering.
- File upload/download, CDN serving, WebSocket, or scheduled-task work.

## When Not to Use

- Pure client work under `app/` (use `nuxt-frontend`).
- Pure schema/migration/seed work (use `drizzle-database`; combine when handlers change queries).
- Pure login/session/permission-model changes (use `authentication-security` alongside).

## Required Reading

- `AGENTS.md` (sections 6, 8, 10, 12).
- `docs/agent/project-map.md` (backend architecture, end-to-end flows).
- `docs/FOOTGUNS.md` only when debugging behavior it documents.

## Repository Evidence

- Guard-first list: `server/api/appUser/index.get.ts` (`requirePermission` + `paginate` + `.$dynamic()`).
- Upsert: `server/api/appUser/index.post.ts` (`requireAnyPermission`, `readValidatedBody`, `db.transaction`).
- Single-row: `server/api/appUser/[id].get.ts` (`validateID`, 404); delete: `server/api/appUser/[id].delete.ts` (soft-delete, `{ status: 200 }`).
- Auth boundary: `server/middleware/00.auth.ts` (JWT + live session check).
- Helpers: `server/utils/validate.ts`, `server/utils/dbPaging.ts`, `server/utils/exception.ts`, `server/utils/modelMapper.ts`.
- CDN: `server/routes/cdn/[...filename].ts`. Realtime: `server/routes/ws.ts`. Cron: `server/tasks/cleanup-temp.ts`.

## Workflow

1. Read the existing handler(s) for the module; note the guard tier and response shape.
2. Call the auth guard FIRST (`requirePermission` / `requireAnyPermission` / `getAuthUser`) before any DB work.
3. Validate untrusted bodies with `readValidatedBody(event, bodySchema.parse)` (Zod 4);
   `:id` params with `validateID(event)`; listing filters with `paginate()`.
4. Return `ResponseEntity<T>`; wrap lists in `ApiResponse<T>` via `paginate()`;
   soft-delete via `set({ deleted: true })`.
5. Map errors to `createError({ statusCode, statusMessage })`; catch-all via `serverException`.
6. Verify with `pnpm typecheck` (+ `pnpm build` for runtime-affecting changes).

## Implementation Rules

- Guard-first is mandatory on every protected handler; user-scoped routes use `getAuthUser`.
- Both `paginate()` queries end with `.$dynamic()`; `columns` whitelist covers every sortable/filterable field; page size caps at 100.
- Create sets the HTTP 201 header yet returns `{ status: 200, data }` (intentional duality — keep it).
- Login wrong-credentials returns 403 (intentional — keep it); never leak driver internals.
- Multi-write operations use `db.transaction`; login/refresh/logout stay non-transactional by design.
- Select explicit columns on joined queries; use `aliasedTable` for self-joins; scope `deleted = false`; `limit(1)` single-row reads.
- Uploads validate MIME whitelist + 50 MB limit; files live under `cdnDirectory`, served via `/cdn/**` only.

## Anti-Patterns

- `readBody` for untrusted input; missing `.$dynamic()` on paginated queries.
- Bare `select()` on joined queries; unscoped soft-deleted rows.
- Returning raw bigint IDs without string transform.
- "Fixing" the 403-on-bad-login or the 201-header/200-body duality without team approval.
- Re-enabling Bearer-header auth (commented out by design).

## Verification

- `pnpm typecheck` (canonical gate).
- `pnpm build` for runtime-affecting changes.
- Exercise affected endpoints (status codes, envelopes, guard rejections); report what could not be run.

## Completion Criteria

- Guards, validation, response shapes, and error codes follow the rules above.
- Only relevant server files changed; no secrets in code, logs, or responses.
- `pnpm typecheck` passes; unverifiable checks are reported.
