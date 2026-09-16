# AGENTS.md

## Project

Nuxt 4 fullstack application using:

- Nuxt 4 SSR (`app/`, compatibilityVersion 5)
- Nuxt UI 4 + Tailwind 4
- Nitro server routes
- Drizzle ORM
- PostgreSQL 18
- Zod 4
- JWT HTTP-only cookie authentication + RBAC
- pnpm

No Pinia and no test infrastructure currently exist.

## Core Working Rules

- Make the smallest change required for the current task.
- Follow existing project structure and naming conventions.
- Do not refactor unrelated code.
- Do not add dependencies, test frameworks, or architectural patterns unless required by the task.
- Preserve SSR behavior.
- Avoid new `any`; do not mass-refactor existing `any` usage.
- Never treat client-side RBAC as a security boundary; protected server handlers must enforce authorization.
- Never use `db:push` outside local development.
- Preserve bigint IDs as strings at transport boundaries.

## Required Reading

Always read:

- `skills/nuxt-fullstack/SKILL.md`

Then read only the files relevant to the task:

- Frontend components/state/UI/types → `skills/nuxt-fullstack/FRONTEND.md`
- Nitro API/server handlers → `skills/nuxt-fullstack/SERVER_API.md`
- Drizzle/PostgreSQL/schema/migrations → `skills/nuxt-fullstack/DATABASE.md`
- Authentication/RBAC/session/permissions → `skills/nuxt-fullstack/AUTH_RBAC.md`
- New CRUD module or end-to-end CRUD changes → `skills/nuxt-fullstack/CRUD_WORKFLOW.md`

Optional references:

- Unresolved repository questions → `docs/OPEN_QUESTIONS.md`
- Known traps / legacy behavior → `docs/FOOTGUNS.md`

Do not read unrelated skill/reference files unless implementation discovers a direct dependency.

## Validation

Use the narrowest applicable verification.

Current canonical gate:

```bash
pnpm typecheck
```

For runtime-affecting changes, run `pnpm build` when appropriate.

For schema changes, follow the database skill and use generated migrations.

## Stop Rule

When the task's success criteria are satisfied and targeted validation passes, stop. Do not continue repo-wide cleanup or refactoring.
