---
name: fullstack-feature
description: Use for a new CRUD module or any feature change that spans two or more layers (database, Nitro API, Nuxt pages, permissions, i18n). Gives the ordered file checklist and naming table; the layer skills hold the code templates.
---

# Fullstack Feature

Read `AGENTS.md` first. This skill is the **order of work**; open the layer skill
named in each step for the template. Skip steps for layers the task does not touch
(e.g. a new field on an existing API + page needs no seed and maybe no migration).

## 1. Fix the names before writing code

Pick one PascalCase entity name and derive everything from it. Example `ProjectTask`:

| Thing | Rule | Example |
|---|---|---|
| `crudName` (frontend) | PascalCase | `ProjectTask` |
| DB table / permission prefix | snake_case | `project_task` → `project_task_list` … `_delete` |
| Drizzle export in `schema.ts` | camelCase | `projectTask` |
| Server module folder / API path | camelCase | `server/api/projectTask/` → `/api/projectTask` |
| Page folder / URL | kebab-case | `app/pages/project-task/` → `/project-task` |
| Client model | PascalCase interface | `ProjectTask` in `app/types/models.ts` |
| i18n keys | nested under `model` | `model.project_task.table`, `model.project_task.<field>` |

The shared components derive URLs and permission codes from `crudName`
(`pascalToKebab`, `pascalToCamelCase`, `pascalToSnake`). A mismatch silently hides
buttons or produces 404s.

## 2. New permission-based CRUD module — ordered checklist

Reference implementation to open side by side: `appRole` (simple) or `appUser` (joins, files, roles).

| # | File(s) | What to do | Template in |
|---|---|---|---|
| 1 | `server/database/schema.ts` | Add table with `id()` + `...auditFieldsSoftDelete()` | `drizzle-database` §2 |
| 2 | `drizzle/` | `pnpm db:generate`, review SQL. Apply with `pnpm db:migrate` only to an intended DB | `drizzle-database` §5 |
| 3 | `server/database/seed.ts` | Add `'project_task'` to `RESOURCES` | `drizzle-database` §6 |
| 4 | `app/types/models.ts` | `export interface ProjectTask extends Id { ... }` (IDs as strings) | — |
| 5 | `server/api/projectTask/index.get.ts` | Paged list, guard `_list` | `nitro-backend` §4.1 |
| 6 | `server/api/projectTask/[id].get.ts` | Read one, guard `_view`, 404 | `nitro-backend` §4.2 |
| 7 | `server/api/projectTask/index.post.ts` | Upsert, guard add/edit, Zod, 409, 201 on create | `nitro-backend` §4.3 |
| 8 | `server/api/projectTask/[id].delete.ts` | Soft delete, guard `_delete`, 404 | `nitro-backend` §4.4 |
| 9 | `app/pages/project-task/index.vue` | List page, `crudName: 'ProjectTask'`, `apiEndpoint: '/api/projectTask'` | `nuxt-frontend` §3.1 |
| 10 | `app/pages/project-task/[crud]/[id].vue` | Form page, `methodPut: 'POST'`, `methodPutIncludeId: false` | `nuxt-frontend` §3.2 |
| 11 | `i18n/locales/en/model.json` + `th/model.json` | Same keys in both languages | `nuxt-frontend` §4 |
| 12 | `app/composables/useMenu.ts` | Menu item with `permissions: ['project_task_list']` | `nuxt-frontend` §5 |

Contract that must line up across steps 5–10:

- Server `paginate({ columns })` keys = client column `accessorKey`s that are sortable/searchable.
- Upsert body fields = form `state` fields sent by `useCrudForm` (extra client-only fields
  such as file arrays must be removed or ignored by the Zod schema).
- `[id].get.ts` returns the fields the form needs to prefill `state`.
- Every ID crosses the API as a string.

## 3. Changing an existing feature across layers

1. Start from the contract: which endpoint and which fields change.
2. Change the server first (schema → query → handler), then the client type, then the page.
3. Keep existing field names, response shapes, permission codes, URLs, and i18n keys
   unless the task asks to change them; when a contract changes, update both ends in the same work.
4. Load only the layer skills you actually edit, plus `authentication-security` if access rules change
   and `ai-rag` if the chat or ingestion flow changes.

## 4. Done checklist

- [ ] Names follow the table in §1 everywhere.
- [ ] Each handler has its server guard; page meta, buttons, and menu use the same codes.
- [ ] Schema change → SQL generated and reviewed; report whether it was applied and where.
- [ ] New permissions → `RESOURCES` updated; say whether `pnpm db:seed` (idempotent) was run and against which database.
- [ ] Both locales updated.
- [ ] `pnpm typecheck` and `pnpm build` pass. Do **not** run `pnpm lint`.
- [ ] If services are available: list, search, sort, paging, create, edit, copy, delete, and a
      user without permission. Report any flow not exercised.
