---
name: testing-debugging
description: Use when verifying a code change, debugging a failure, or reviewing a diff in this repo. Explains which checks to run (typecheck/build/manual; no lint, no test runner) and how to locate a bug by symptom.
---

# Testing & Debugging

Read `AGENTS.md` first. There is **no test framework**; do not add one unless the task asks.

## 1. Which check to run

| Change | Run | Do not run |
|---|---|---|
| Docs / SKILL / Markdown only | Check links, paths, frontmatter; read the diff | build, typecheck |
| TS/Vue code (any) | `pnpm typecheck` | `pnpm lint` (not required for agents) |
| Server code, SSR, config, dependencies, plugins | `pnpm typecheck` then `pnpm build` | — |
| Schema | `pnpm db:generate` + review SQL (see `drizzle-database`) | `db:migrate` / `db:seed` / `db:push` just to verify |
| Behavior of a page/API | Manual flow in section 3 when a local environment exists | Anything against shared/production data |

`pnpm typecheck` must finish with **0 errors** (baseline since 2026-09-25). TypeScript is
pinned to 5.x (`^5.9.3`): `vue-tsc` 3.x crashes with `ERR_PACKAGE_PATH_NOT_EXPORTED` on
TypeScript 7, so do not upgrade it. `verbatimModuleSyntax` is on — import types with
`import type { ... }` (or `import { type X, value }`), otherwise you get TS1484.

`pnpm lint` is **not** part of the agent workflow. Do not run it, and do not
mass-reformat files. If the user explicitly asks for lint, run it and report results.

Report every check honestly: command, pass/fail, and anything you could not run and why
(e.g. no database, no Ollama/Qdrant).

## 2. Find the owning layer by symptom

| Symptom | Look first at |
|---|---|
| 401 loop / logged out unexpectedly | `server/middleware/00.auth.ts` (session row missing/revoked), `app/composables/useApi.ts` refresh, cookie names in runtime config |
| 403 on an action the user should have | Permission code string in handler vs seed `RESOURCES` vs role grants; client list is stale until refresh/`/api/auth/me` |
| Button/menu missing | `crudName` → `pascalToSnake` prefix, `v-rbac`, `useMenu.ts` `permissions` |
| 404 on CRUD form/list call | `crudName` → `pascalToCamelCase` must equal the `server/api/<module>/` folder |
| 500 with "Cannot convert ... to a BigInt" | Non-numeric ID passed to `BigInt()` |
| "$dynamic" / `.where is not a function` in list | `paginate()` inputs missing `.$dynamic()` |
| Sort/search ignored | column key missing in `paginate({ columns })` or different from client `accessorKey` |
| Wrong total count | count query lacks the same joins/filters as data query |
| Error toast shows a DB message | handler leaked `error.message`; use `serverException(error)` |
| 404 turned into 500 | `try/catch` around code that throws `createError` without rethrowing `statusCode` errors |
| Hydration mismatch / `window is not defined` | browser-only code outside `import.meta.client` or a `.client.ts` plugin |
| Missing translation key shown | key missing in `en` or `th` JSON, or file not in `fileLangNames` (`nuxt.config.ts`) |
| RAG answer ignores documents | embedding model mismatch, empty collection, `filterNames`, Qdrant URL/key (see `ai-rag`) |

## 3. Manual checks worth doing (when services are available)

- **Protected API:** success, missing permission (403), anonymous (401), wrong owner, bad body (400), missing row (404).
- **CRUD UI:** list paging/sort/search/keyword, new → edit → copy → delete, IDs stay strings.
- **UI quality:** both languages, dark mode, mobile width, SSR reload of the page.
- **AI:** see `ai-rag` §6. Use local services and test data only.

## 4. Debug procedure

1. Reproduce (or read the exact error/stack). Note the request URL, status, and payload.
2. Locate the layer with the table above; read the file **and** its caller.
3. Check `docs/FOOTGUNS.md` / `docs/OPEN_QUESTIONS.md` before "fixing" intentional behavior
   (403 on wrong login, create returns HTTP 201 with body `status: 200`).
4. Fix the cause in the owning layer with the smallest change.
5. Re-run the checks from section 1 for what you touched.
6. Review `git status --short` and `git diff`; leave unrelated user changes untouched.
