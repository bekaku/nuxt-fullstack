# Skills Index

Canonical skills live in `.agents/skills/` (Agent Skills spec: each skill is a
directory with `SKILL.md` containing `name` + `description` frontmatter).
Skill `name` always matches its directory. Load only the skills a task needs.

Every skill has the same shape: **where things live → rules/decision table →
copy-ready template → done checklist**. Verification is always `pnpm typecheck`
(+ `pnpm build` for runtime changes); agents do not run `pnpm lint`.

| Skill | Purpose | Load when the task touches |
|---|---|---|
| `nuxt-frontend` | Pages, components, composables, client API, menu, i18n; CRUD list/form templates; `crudName` naming rule | `app/`, `i18n/` |
| `nitro-backend` | Handlers, guards, Zod validation, `paginate()`, responses/errors; list/get/upsert/delete templates | `server/api/`, `server/routes/`, `server/tasks/`, `server/middleware/`, `server/plugins/` |
| `drizzle-database` | Table template, query cheatsheet, bigint boundary, migration + seed procedure | `server/database/`, `drizzle/`, any Drizzle query |
| `authentication-security` | Auth flow, guard decision, permission codes, invariants, file/URL/dev-endpoint policies | `server/api/auth/`, `00.auth.ts`, `server/utils/permission.ts`, route guards, RBAC UI |
| `fullstack-feature` | Naming table + ordered 12-step checklist for a new module; cross-layer changes | ≥2 layers (schema + API + page), new CRUD module |
| `ai-rag` | Ingestion and chat-stream flows, provider config, failure domains | `server/services/ai/`, `server/utils/ai/`, `server/utils/tools/`, `server/api/aiChat/`, `server/api/aiDocumentMeta/`, `useAiChat.ts` |
| `testing-debugging` | Which check to run, symptom → layer table, manual flows | Verifying code, debugging, reviewing a diff |

Related skills: `fullstack-feature` points to the layer skills for templates.
`ai-rag` pairs with `nitro-backend` for its endpoints, and with database/frontend
skills only when those files change. `testing-debugging` pairs with the owning
skill for code changes.

## Example Task → Skill Mapping

- "New `project` CRUD module" → `fullstack-feature` + `drizzle-database` + `nitro-backend` + `nuxt-frontend`.
- "Fix user list sorting" → `nitro-backend` (+ `drizzle-database` if the query changes).
- "Add avatar to profile page" → `nuxt-frontend` (+ `nitro-backend` if the endpoint changes).
- "Add `deadline` column to tasks table" → `drizzle-database` (+ `nitro-backend`, `nuxt-frontend` if surfaced).
- "Add a permission check to fileManager list" → `authentication-security` + `nitro-backend`.
- "Login fails after expiry" → `authentication-security` + `testing-debugging`.
- "Typecheck fails in BaseTable usage" → `nuxt-frontend` + `testing-debugging`.
- "Slow user search" → `nitro-backend` + `drizzle-database` + `testing-debugging`.
- "Embedding batches fail on large documents" → `ai-rag` + `testing-debugging`.
- "Change chat stream and its UI" → `ai-rag` + `nitro-backend` + `nuxt-frontend`.
