---
name: nitro-backend
description: Use when adding or changing Nitro API handlers in server/api/, server routes, middleware, plugins, tasks, request validation, response envelopes, pagination, file endpoints, or WebSocket behavior. Contains copy-ready handler templates. Pair with drizzle-database, authentication-security, or ai-rag when those concerns change.
---

# Nitro Backend

Read `AGENTS.md` first. This skill tells you how to write a handler that matches
this repo. Always open the sibling handlers of the module you touch before editing.

## 1. Where things live

| Need | File |
|---|---|
| Best CRUD template (copy this) | `server/api/appUser/{index.get,[id].get,index.post,[id].delete}.ts` |
| User-scoped template (no permission code) | `server/api/aiChat/{index.get,[id].put}.ts`, `server/api/favoriteMenu/index.post.ts` |
| Auth guards | `server/utils/permission.ts` (`requirePermission`, `requireAnyPermission`, `requireAllPermission`, `getAuthUser`) |
| `:id` param / numeric IDs | `server/utils/validate.ts` → `validateID(event)` (400 unless numeric; returns a string), `assertNumericId(value, 'Name')` for query/body IDs |
| File access (owner or `file_manager_<action>`) | `server/utils/files.ts` → `assertFileAccess(event, id, 'view'\|'delete')`, `canAccessAllFiles(event, 'list')` |
| Fetch a user-supplied URL | `server/utils/safeFetch.ts` → `fetchPublicHtml(url)` / `assertPublicHttpUrl(url)` (SSRF-safe) |
| Dev/test-only endpoint | `server/utils/devOnly.ts` → `await requireDevEndpoint(event)` (404 in production + admin permission) |
| List pagination | `server/utils/dbPaging.ts` → `paginate(event, config)` |
| Safe 500 errors | `server/utils/exception.ts` → `serverException(error)` |
| Row → client model | `server/utils/modelMapper.ts` (`mapToAppUser`, `mapToFileManager`) |
| Response types | `app/types/common.ts` (`ResponseEntity<T>`, `ApiResponse<T>`), models in `app/types/models.ts` |
| DB access | `useDb()` and `schema` from `#server/database/client` |
| Other server paths | `server/routes/cdn/[...filename].ts`, `server/routes/ws.ts`, `server/tasks/cleanup-temp.ts`, `server/services/ai/` |

Nitro auto-imports `defineEventHandler`, `createError`, `readValidatedBody`,
`getQuery`, `setResponseStatus`, `useRuntimeConfig`, and everything exported from
`server/utils/`. Explicit imports (as in the templates) are also fine.

Do **not** use these as templates: `server/api/mock/**` (static demo data, no guard) and
`server/api/test/**` (dev-only import tools).

## 2. File naming → URL

`server/api/<camelCaseModule>/`:

| File | Method + URL | Guard |
|---|---|---|
| `index.get.ts` | `GET /api/<module>?page=0&size=10&sort=id,desc&_q=...&_keyword=...` | `requirePermission(event, '<table>_list')` |
| `[id].get.ts` | `GET /api/<module>/:id` | `requirePermission(event, '<table>_view')` |
| `index.post.ts` | `POST /api/<module>` (upsert: body `id` present = update) | `requireAnyPermission(event, ['<table>_add', '<table>_edit'])` |
| `[id].delete.ts` | `DELETE /api/<module>/:id` | `requirePermission(event, '<table>_delete')` |
| `findAll.get.ts` (optional) | `GET /api/<module>/findAll` (unpaged dropdown data) | `requireAnyPermission` with the codes of pages that need it |

`<module>` is camelCase (`appUser`), `<table>` is snake_case (`app_user`). The
frontend derives both from one PascalCase `crudName` (see `fullstack-feature`).

## 3. Choose the guard (always the FIRST line of the handler)

| Endpoint kind | First line | Extra rule |
|---|---|---|
| Admin/CRUD data | `await requirePermission(event, 'xxx_list')` | Code must exist in `RESOURCES` in `server/database/seed.ts` |
| Upsert POST | `await requireAnyPermission(event, ['xxx_add', 'xxx_edit'])` | For new modules also check the exact code after parsing: `await requirePermission(event, body.id ? 'xxx_edit' : 'xxx_add')` |
| Own data only (chat, profile, favorites) | `const auth = getAuthUser(event)` | Every query includes `eq(table.createdUser or appUser, BigInt(auth.sub))` |
| Public (rare) | none | Must be a deliberate decision; say so in your report |

`server/middleware/00.auth.ts` lets requests **without** a cookie through as
anonymous. A handler with no guard is therefore publicly reachable.

## 4. Templates

Replace `Xyz` / `xyz` / `xyz_table` with the real names. Keep only fields that exist.

### 4.1 List — `index.get.ts`

```ts
import { and, count, eq } from 'drizzle-orm'
import type { ApiResponse, ResponseEntity } from '~/types/common'
import type { Xyz } from '~/types/models'
import { schema, useDb } from '#server/database/client'
import { paginate } from '~~/server/utils/dbPaging'

export default defineEventHandler(async (event): Promise<ResponseEntity<ApiResponse<Xyz>>> => {
  await requirePermission(event, 'xyz_table_list')
  const db = useDb()

  // data + count MUST share the same from/joins and both end with .$dynamic()
  const dataQuery = db
    .select({
      id: schema.xyz.id,
      name: schema.xyz.name,
      active: schema.xyz.active,
      createdDate: schema.xyz.createdDate
    })
    .from(schema.xyz)
    .$dynamic()

  const countQuery = db
    .select({ value: count() })
    .from(schema.xyz)
    .$dynamic()

  const data = await paginate(event, {
    dataQuery,
    countQuery,
    // whitelist for ?sort= and ?_q= ; keys = client column accessorKey
    columns: {
      id: schema.xyz.id,
      name: schema.xyz.name,
      active: schema.xyz.active,
      createdDate: schema.xyz.createdDate
    },
    searchColumns: [schema.xyz.name], // used by ?_keyword=
    defaultSort: schema.xyz.id,
    defaultSortDirection: 'desc',
    where: and(eq(schema.xyz.deleted, false)),
    transform: (item) => ({ ...item, id: item.id.toString() })
  })

  return { status: 200, data }
})
```

`paginate` query params: `page` (0-based), `size` (default 10, max 100),
`sort=<column>,<asc|desc>` (repeatable), `_q=<col><op><value>;<col><op><value>`
with ops `: = != > >= < <=` (`:` is ILIKE; a comma value becomes `IN`),
`_keyword=<text>` (ILIKE over `searchColumns`). Unknown column names are ignored.

### 4.2 Read one — `[id].get.ts`

```ts
import { and, eq } from 'drizzle-orm'
import type { ResponseEntity } from '~/types/common'
import type { Xyz } from '~/types/models'
import { schema, useDb } from '#server/database/client'

export default defineEventHandler(async (event): Promise<ResponseEntity<Xyz>> => {
  await requirePermission(event, 'xyz_table_view')
  const id = validateID(event)

  const [row] = await useDb()
    .select({ id: schema.xyz.id, name: schema.xyz.name, active: schema.xyz.active })
    .from(schema.xyz)
    .where(and(eq(schema.xyz.id, BigInt(id)), eq(schema.xyz.deleted, false)))
    .limit(1)

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Data not found' })
  }
  return { status: 200, data: { ...row, id: row.id.toString() } }
})
```

### 4.3 Create/update — `index.post.ts`

```ts
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import type { ResponseEntity } from '~/types/common'
import type { Xyz } from '~/types/models'
import { schema, useDb } from '#server/database/client'

const bodySchema = z.object({
  id: z.string().nullish(),          // present = update
  name: z.string().trim().min(1).max(255),
  active: z.boolean().nullish()
})

export default defineEventHandler(async (event): Promise<ResponseEntity<Xyz>> => {
  await requireAnyPermission(event, ['xyz_table_add', 'xyz_table_edit'])
  const body = await readValidatedBody(event, bodySchema.parse)
  const auth = await requirePermission(event, body.id ? 'xyz_table_edit' : 'xyz_table_add')
  const db = useDb()

  // uniqueness check (409), excluding the row being edited
  const dup = body.id
    ? and(eq(schema.xyz.name, body.name), ne(schema.xyz.id, BigInt(body.id)))
    : eq(schema.xyz.name, body.name)
  const [exists] = await db.select({ id: schema.xyz.id }).from(schema.xyz).where(dup).limit(1)
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'This name is already in use.' })
  }

  let saved: { id: bigint } | undefined
  if (body.id) {
    const [updated] = await db
      .update(schema.xyz)
      .set({ name: body.name, active: body.active ?? true, updatedUser: BigInt(auth.sub) })
      .where(and(eq(schema.xyz.id, BigInt(body.id)), eq(schema.xyz.deleted, false)))
      .returning({ id: schema.xyz.id })
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'Data not found' })
    }
    saved = updated
  } else {
    const [created] = await db
      .insert(schema.xyz) // id is generated by the schema's Snowflake $defaultFn
      .values({ name: body.name, active: body.active ?? true, createdUser: BigInt(auth.sub), updatedUser: BigInt(auth.sub) })
      .returning({ id: schema.xyz.id })
    saved = created
    setResponseStatus(event, 201) // HTTP 201, body status stays 200 (intentional)
  }

  if (!saved) {
    throw createError({ statusCode: 500, statusMessage: 'Data saving failed.' })
  }
  return { status: 200, data: { id: saved.id.toString(), name: body.name, active: body.active ?? true } }
})
```

If the save writes more than one table (e.g. a row + its junction rows), wrap all
writes in `await db.transaction(async (tx) => { ... })` and use `tx` inside — see
`server/api/appUser/index.post.ts`. Do file deletions only **after** the transaction commits.

### 4.4 Delete (soft) — `[id].delete.ts`

```ts
import { and, eq } from 'drizzle-orm'
import type { ResponseEntity } from '~/types/common'
import { schema, useDb } from '#server/database/client'

export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  const auth = await requirePermission(event, 'xyz_table_delete')
  const id = validateID(event)

  const [deleted] = await useDb()
    .update(schema.xyz)
    .set({ deleted: true, updatedUser: BigInt(auth.sub) })
    .where(and(eq(schema.xyz.id, BigInt(id)), eq(schema.xyz.deleted, false)))
    .returning({ id: schema.xyz.id })

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Data not found' })
  }
  return { status: 200 }
})
```

### 4.5 User-scoped handler

```ts
const auth = getAuthUser(event) // throws 401 when anonymous
// ...every read/update/delete filters by owner:
.where(and(eq(schema.aiChat.id, BigInt(id)), eq(schema.aiChat.createdUser, BigInt(auth.sub))))
```

## 5. Rules that are easy to miss

- **Validation:** untrusted body → `readValidatedBody(event, bodySchema.parse)` (Zod 4, e.g. `z.email()`), never plain `readBody`.
  Query strings you read yourself → parse with Zod too.
- **IDs:** `BigInt(id)` throws on non-numeric strings (becomes a 500). `validateID` already
  checks `:id`; validate every other ID from user input first — `z.string().regex(/^\d+$/)` in
  Zod schemas or `assertNumericId(getQuery(event).id, 'File ID')`.
  Return IDs as strings (`.toString()`); `server/plugins/bigint.ts` is only a safety net.
- **Response shape:** always `{ status: 200, data? }`. Lists: `data` = `paginate()` result.
  A `message` in the body is shown as a toast by `useApi()` — use it only for user-facing text.
- **Errors:** expected cases → `createError({ statusCode, statusMessage })` with
  400 bad input, 401 unauthenticated, 403 forbidden, 404 not found, 409 duplicate, 429 rate limit.
  Unexpected errors → `throw serverException(error)` (never put `error.message` of a DB
  error in the response). If you wrap code in `try/catch`, rethrow errors that already have
  `statusCode` so 404/409 are not turned into 500.
- **Queries:** select explicit columns, `.limit(1)` single-row reads, filter `deleted = false`
  on tables that have `deleted`, transaction for related multi-table writes.
- **Outbound HTTP:** never `$fetch`/`fetch` a URL that came from a user — use `server/utils/safeFetch.ts`.
- **Files/CDN:** reading/deleting a stored file by id needs `assertFileAccess`. Uploads go through `server/api/fileManager/` and are stored under
  `cdnDirectory`, served only by `/cdn/**`. Keep MIME allowlists (`acceptFiles`,
  `acceptIngestFiles`) and `limitFileUploadSize` (50 MB) from `nuxt.config.ts`.
- **Scheduled work:** use Nitro tasks (`server/tasks/`, registered in `nuxt.config.ts`), not ad-hoc timers.
- **Logging:** never log tokens, passwords, cookies, request bodies with personal data, or document text.

## 6. Also load

- Schema or non-trivial query change → `drizzle-database`.
- New permission code, auth flow, ownership policy → `authentication-security`.
- Chat stream / ingestion / Qdrant → `ai-rag`.
- Page or client API change for the same endpoint → `nuxt-frontend`.

## 7. Done checklist

- [ ] Guard is the first statement; permission code exists in seed `RESOURCES` (or ownership filter present).
- [ ] Body/params validated; bigint IDs converted in and out.
- [ ] Response matches `ResponseEntity<T>` and the client caller's expected type.
- [ ] No driver error text, secrets, or tokens in responses or logs.
- [ ] `pnpm typecheck` passes; `pnpm build` passes for runtime changes. Do **not** run `pnpm lint`.
- [ ] If services are available, call the endpoint for: success, validation error (400), no permission (403), missing row (404).
