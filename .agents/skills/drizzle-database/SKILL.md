---
name: drizzle-database
description: Use for Drizzle ORM and PostgreSQL work — schema changes, relations, queries, transactions, migrations, seeds, and bigint ID boundaries. Load when the task touches server/database/, drizzle/, or any Drizzle query.
---

# Drizzle Database

## Purpose

Covers all persistence work: schema definition, relations, query patterns,
transactions, migrations, seed data, and the bigint ID boundary convention.

## When to Use

- Editing `server/database/schema.ts`, `server/database/seed.ts`, or `server/database/client.ts`.
- Writing or changing Drizzle queries in any handler.
- Generating or applying migrations under `drizzle/`.
- Debugging ID serialization (`bigint` vs `string`) issues.

## When Not to Use

- Handler-only changes that reuse existing queries untouched (use `nitro-backend`).
- Client-only changes with no persistence impact.

## Required Reading

- `AGENTS.md` (sections 6, 9, 12).
- `docs/agent/project-map.md` (database architecture).
- `docs/FOOTGUNS.md` (migration duplicates) and `docs/OPEN_QUESTIONS.md`
  (duplicate `0001–0003` numbers) when generating migrations.

## Repository Evidence

- Schema: `server/database/schema.ts` (Snowflake `bigint` PK helper, `auditFieldsSoftDelete()`,
  `permissionTypeEnum`, ~20 tables: RBAC, session, file, AI/RAG, Thai geography, logs).
- Client: `server/database/client.ts` (`useDb()` singleton via `postgres.js`).
- Seed: `server/database/seed.ts` (`RESOURCES` × 5 actions → permissions; Admin/Viewer roles).
- Queries: `server/api/appUser/index.get.ts` (aliased self-joins, explicit columns, `.$dynamic()`),
  `server/api/appUser/index.post.ts` + `server/api/appRole/index.post.ts` (transactions).
- Config: `drizzle.config.ts` (schema path, `drizzle/` output, PostgreSQL dialect).
- Transport: `server/plugins/bigint.ts` (bigint serialization).

## Workflow

1. Read the affected tables in `server/database/schema.ts` and their relations first.
2. For schema changes: edit `schema.ts`, then run `pnpm db:generate && pnpm db:migrate`.
   Check `drizzle/meta` journal first — duplicate `0001–0003` numbers already exist.
3. For new modules: extend `RESOURCES` in `server/database/seed.ts`, then `pnpm db:seed`.
4. For queries: select explicit columns, scope `deleted = false`, `limit(1)` single-row reads,
   `aliasedTable` for self-joins, `db.transaction` for multi-writes.
5. Convert IDs at the boundary: `BigInt(stringId)` inbound, `.toString()` outbound.
6. Verify with `pnpm typecheck`; confirm no hand-edited applied SQL.

## Implementation Rules

- PKs are app-generated Snowflake bigints (`bigint('id', { mode: 'bigint' })`); never
  `serial`/`bigserial`/`uuid` PKs.
- New tables spread `auditFieldsSoftDelete()` (permission/log tables exempt by design).
- `pnpm db:push` is local-dev only; never hand-edit applied SQL; raw SQL/views/functions
  go through custom migrations, never into `schema.ts`.
- Never compare bigint IDs with `===` against numbers (wire format is string).

## Anti-Patterns

- Hand-editing applied migrations or committing duplicate migration numbers.
- `db:push` outside local development; manual table drops.
- Running migrations without an explicit schema-change task.
- Bare `select()` on joined queries; missing soft-delete scoping; missing `limit(1)`.
- Adding transactions to login/refresh/logout (intentionally non-transactional).

## Verification

- `pnpm typecheck` (canonical gate).
- `pnpm db:generate && pnpm db:migrate` output reviewed for schema tasks (never run
  migrate/push unless the task requires schema changes).
- Confirm generated SQL touches only the intended tables.

## Completion Criteria

- Schema, queries, and seeds follow the rules above; migrations are generated, not hand-written.
- Only relevant database files changed; `pnpm typecheck` passes.
- Any migration that could not be applied (e.g. no live DB) is reported.
