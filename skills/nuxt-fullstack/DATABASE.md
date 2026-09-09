# Database Skill

Use for Drizzle ORM, PostgreSQL schema, migrations, seed data, transactions, queries, and bigint boundaries.

## 6. Database — MUST follow

- Schema MUST use `pgTable` + Snowflake-bigint app-generated PKs; NEVER `serial`/`bigserial`/`uuid` PKs (sole exception: legacy `app_user_test.integer('id')`):

  ```ts

  // CORRECT (schema.ts)

  const id = () => bigint('id', { mode: 'bigint' }).primaryKey().$defaultFn(() => nextId())

  ```

- New tables MUST spread audit helper (`auditFieldsSoftDelete()` → `deleted/createdDate/createdUser/updatedDate/updatedUser`); `permission` (no timestamps) and log tables (own columns) are the only exceptions.

- Day-to-day migration workflow MUST be `pnpm db:generate && pnpm db:migrate`. `db:push` is dev-only. NEVER hand-edit applied SQL in `drizzle/*.sql`. Raw SQL (views like `performance_dashboard`, functions like `create_monthly_partitions()`) MUST go through `drizzle-kit generate --custom`, NEVER into `schema.ts`.

- Queries MUST select explicit columns (never `select()` bare on joined queries), MUST use `aliasedTable` for self-joins (`fileManager/index.get.ts:13`), MUST scope soft-deleted rows (`where: and(eq(t.deleted, false))`), MUST `limit(1)` single-row reads.

- Multi-write MUST wrap in `db.transaction` (only 3 exist: `appUser/index.post.ts:80` user+roles, `appRole/index.post.ts:35` role+perms, `permission/index.post.ts:28`). Login/refresh/logout sequential writes are intentionally non-transactional — do not add transactions there.

- Seed MUST extend `RESOURCES`/`ACTIONS` in `server/database/seed.ts` for new modules, then `pnpm db:seed`. Permissions for a new table MUST be all five (`list/view/add/edit/delete`); `Viewer` role gets only `list+view`:

  ```ts

  const RESOURCES = ['app_user', 'app_role', 'permission', 'api_client', 'files_directory', 'file_manager', 'ai_document_meta'] as const

  ```

- Bigint boundary MUST be: inbound `BigInt(stringId)` (`eq(t.id, BigInt(id))`, `BigInt(auth.sub)`, `BigInt(body.avatarFileId)`), outbound `.toString()` (`id: user.id.toString()`, `sub: user.id.toString()`). NEVER compare bigint IDs with `===` against numbers (wire format is string; `server/plugins/bigint.ts` only covers transport).


## Migration Commands

Use the repository workflow from the core skill. Do not hand-edit already-applied migrations.
