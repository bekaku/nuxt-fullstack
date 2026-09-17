# Audit Report

Inspection date (UTC): 2026-09-17. Branch: `main` (clean, in sync with `origin/main`).
Uncommitted changes: none — nothing to preserve. No secrets were read
(`.env` was listed but never opened; only `.env.example` was inspected).

## Inspection Coverage

Read fully or in relevant part: `AGENTS.md`, `SKILLS.md`, all 6 files under
`skills/nuxt-fullstack/`, `docs/{FOOTGUNS,OPEN_QUESTIONS,SPLIT_MAP}.md`, `README.md`,
`package.json`, `nuxt.config.ts`, `drizzle.config.ts`, `tsconfig.json`, `.env.example`,
`.github/workflows/ci.yml`, `server/database/{schema,seed}.ts` (schema partially —
490 lines, head + key sections), `server/middleware/00.auth.ts`,
`server/api/{appUser/index.get,auth/login.post}.ts`, `app/{composables/useApi,pages/app-user/index,types}`,
`server/utils/validate.ts`, plus directory listings of `app/`, `server/`, `shared/`,
`drizzle/`, `i18n/`, `.github/`.

NOT inspected line-by-line: every page/component/handler (covered by representative
traces + grep counts: 42 guard call sites, `RESOURCES`/`ACTIONS` in seed).
Generated/caches excluded: `node_modules/`, `.nuxt/`, `data/`, `public/` binaries.

Classification: findings below are VERIFIED (read in source) unless marked INFERRED
(structure-implied, spot-checked) or UNKNOWN.

## Verified Findings

- Nuxt 4.5 SSR + Nuxt UI 4 + Tailwind 4 + Nitro + Drizzle 0.45 + PostgreSQL 18 +
  Zod 4 + JWT cookies + pnpm 11.13.1 — all confirmed in `package.json`/`nuxt.config.ts`.
- Guard-first handlers (42 grep hits), three tiers, `paginate()` + `.$dynamic()`,
  `ResponseEntity` envelope, 201-header/200-body duality, login-403 — all read in source.
- Snowflake bigint PKs, `auditFieldsSoftDelete()`, `RESOURCES`×`ACTIONS` seed,
  `useApi()` single-flight refresh + SSR cookie forward — all read in source.
- No Pinia, no test files, `shared/types/` empty, `usePagefecth.ts` typo — confirmed.
- Existing agent config: `AGENTS.md` + `SKILLS.md` + `skills/nuxt-fullstack/` (6 files).
  No `CLAUDE.md` / `GEMINI.md` / copilot-instructions / `.cursor` / `.claude` /
  `.codex` / `.opencode` / `.gemini` / `.agents` — confirmed absent via directory listing.

## Documentation Conflicts

1. `README.md` says "22-table schema" / "20+ tables"; schema lists ~24 tables.
   Minor drift — project-map counts what is in `schema.ts`. (INFERRED exact count; low risk.)
2. `README.md` auth section says "no per-request database lookup", while `00.auth.ts`
   queries `access_token` per request with a valid token. The accurate statement:
   permissions are not re-queried per request, but session liveness IS checked per request.
3. `README.md` permission example shows `file_manager_manage`, but `manage` is not a
   valid action (`list|view|add|edit|delete`) — the skills are authoritative here.
4. Legacy skill claimed "`app.config.ts` sets button `subtle/neutral`" — kept as stated;
   not re-verified against `app/app.config.ts` (UNKNOWN, flagged not assumed).

## Architectural Risks

- `drizzle/` has duplicate migration numbers (`0001`×2, `0002`×2, `0003`×2) — verify
  the `drizzle/meta` journal before generating (see `docs/OPEN_QUESTIONS.md`).
- `fileManager/index.get.ts` imports `requirePermission` but never calls it; `favoriteMenu`
  handlers carry dead `requirePermission` imports; `test-socket-send.post.ts` and `meta.ts`
  are unguarded — each could be intentional or a missing check (see `docs/OPEN_QUESTIONS.md`).
- Session liveness is stateful per request (`access_token` lookup) — scales with DB, not
  purely stateless despite README wording.

## Missing Information

- `app/app.config.ts` actual theme values (cited but not opened).
- Full RAG pipeline internals (`server/services/ai/`) — summarized from README only (INFERRED).
- Whether `permission/index.get.ts` relies on `bigint.ts` plugin vs explicit transform
  (open question, unchanged).

## Unverified Assumptions

- Exact table count and every handler's guard tier beyond grep hits (INFERRED from
  representative files + grep; full per-file audit was out of scope).
- Cross-agent compatibility beyond OpenCode (marked DOCUMENTED BUT NOT TESTED or
  UNKNOWN in `compatibility.md`; only OpenCode's `AGENTS.md` loading is VERIFIED,
  evidenced by this session).
