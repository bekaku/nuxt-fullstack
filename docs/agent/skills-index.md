# Skills Index

Canonical skills live in `.agents/skills/` (Agent Skills spec: each skill is a
directory with `SKILL.md` containing `name` + `description` frontmatter).
Skill `name` always matches its directory. Load only the skills a task needs.

| Skill | Purpose | Activation |
|---|---|---|
| `nuxt-frontend` | Nuxt 4 pages, components, composables, state, UI, types, i18n | Task touches `app/` or `i18n/` |
| `nitro-backend` | Nitro handlers, validation, responses, pagination, errors, CDN/WS/tasks | Task touches `server/api/`, `server/routes/`, `server/tasks/`, middleware/plugins |
| `drizzle-database` | Schema, queries, transactions, migrations, seeds, bigint boundary | Task touches `server/database/`, `drizzle/`, or any Drizzle query |
| `authentication-security` | Login/refresh/logout, cookies, guards, permissions, rate limiting | Task touches `server/api/auth/`, `00.auth.ts`, permission helpers, route guards, gated UI |
| `fullstack-feature` | End-to-end CRUD modules / cross-layer changes | Task spans ≥2 layers (schema + API + pages, new module) |
| `testing-debugging` | Verification & diagnosis (no test framework: typecheck/build/manual) | Every change (alongside the layer skill); any debugging or diff review |

Related skills: `fullstack-feature` orchestrates `drizzle-database` +
`nitro-backend` + `nuxt-frontend` (+ `authentication-security` when permissions
change). `testing-debugging` pairs with whichever layer skill owns the change.

## Example Task → Skill Mapping

- "Fix user list sorting" → `nitro-backend` (+ `drizzle-database` if the query changes).
- "Add avatar to profile page" → `nuxt-frontend` (+ `nitro-backend` if the endpoint changes).
- "New `project` CRUD module" → `fullstack-feature` + all four layer skills.
- "Login fails after expiry" → `authentication-security` + `testing-debugging`.
- "Add `deadline` column to tasks table" → `drizzle-database` (+ `nitro-backend`, `nuxt-frontend` if surfaced).
- "Typecheck fails in BaseTable usage" → `nuxt-frontend` + `testing-debugging`.
- "Slow user search" → `nitro-backend` + `drizzle-database` + `testing-debugging`.
