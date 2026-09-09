# Server API Skill

Use for Nitro API handlers, validation, response shapes, pagination, server error handling, file/server endpoints, and protected server routes.

## 5. API / server routes — MUST follow

- Every protected handler MUST call an auth guard FIRST, before any DB work. Three tiers (verified across 42 call sites):

  ```ts

  await requirePermission(event, 'app_user_list')              // single code (list/view/delete/get)

  await requireAnyPermission(event, ['app_user_add', 'app_user_edit']) // upsert POST (appUser/index.post.ts:23, appRole/index.post.ts:18)

  const auth = getAuthUser(event)                              // user-scoped only (aiChat/*, fileManager post/delete, profile.post.ts:22, password.post.ts:19)

  ```

  Known violations to fix, NOT to copy: `fileManager/index.get.ts` imports but never calls `requirePermission`; `favoriteMenu/index.{post,delete}.ts` import `requirePermission` unused (dead import); `test-socket-send.post.ts` + `meta.ts` have no guard at all.

- Request bodies MUST validate with `readValidatedBody(event, bodySchema.parse)` using Zod 4 (12 handlers do this; `aiChat/stream.post.ts:62`, `auth/login.post.ts:37`). NEVER `readBody` for untrusted input (only exception: `test-socket-send.post.ts` debug endpoint). Query/params: `getQuery` for filters (via `paginate`), `validateID(event)` from `server/utils/validate.ts` for `:id`.

- Response shape MUST be `ResponseEntity<T>` (`app/types/common.ts:614`): `{ status: 200, data? }`. List endpoints MUST wrap in `ApiResponse<T>` via `paginate()`:

  ```ts

  // CORRECT (appUser/index.get.ts, fileManager/index.get.ts:60-63)

  return { status: 200, data } // data: { totalPages, currentPage, totalElements, last, dataList }

  return { status: 200 }       // delete (appUser/[id].delete.ts) — NO data key

  ```

  On create MUST call `setResponseStatus(event, 201)` AND still return `{ status: 200, data }` (both `appUser/index.post.ts` and `appRole/index.post.ts` do this — keep the duality, do not "fix" to 201 body).

- Errors MUST use `createError({ statusCode, statusMessage })` with these codes: 400 validation/bad-id, 401 unauthenticated, 403 forbidden/wrong-credentials (login uses 403, keep it), 404 not found (`[id].get.ts`), 409 duplicate (`index.post.ts`), 429 rate-limited (login), 500 via `serverException(error)` (catch-all; strips PG internals — `server/utils/exception.ts`). NEVER leak driver errors to client.

- Listing MUST use `paginate(event, { dataQuery, countQuery, columns, defaultSort, where, transform })` with BOTH queries ending in `.$dynamic()` (verified in all 5 list handlers). `columns` whitelist MUST contain every sortable/filterable field; page size caps at 100 (`dbPaging.ts`). Sort/filter query syntax: `?sort=email,asc&sort=id,desc`, `?_q=active=true;email:foo`, `?_keyword=foo`.


## Related Reading

- If authorization/session behavior is touched, also read `AUTH_RBAC.md`.
- If DB queries/schema are touched, also read `DATABASE.md`.
- For a complete CRUD module, also read `CRUD_WORKFLOW.md`.
