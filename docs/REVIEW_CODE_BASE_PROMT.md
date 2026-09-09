You are performing a full, in-depth codebase review of this project and then authoring
(or updating) a `SKILLS.md` file at the project root that encodes the project's actual
coding rules and conventions. This file will be read and STRICTLY FOLLOWED by AI agents
(including yourself) on every future task in this repo, so it must be accurate, specific,
and enforceable — not generic best-practice advice.

## Project context
- Framework: Nuxt 4 (full-stack, server routes under server/)
- UI: Nuxt UI 4 (built on Tailwind CSS 4)
- ORM: Drizzle ORM, with Postgres (and/or MySQL) as the database
- Auth: JWT with HTTP-only cookies, refresh-token rotation, server-side RBAC middleware
- Tooling: ESLint (@nuxt/eslint), Prettier, TypeScript, vue-tsc, pnpm
- i18n via @nuxtjs/i18n, icons via @nuxt/icon + iconify sets

## Phase 1 — Deep codebase review
Systematically go through the project and document your findings before writing any
rules. Cover at minimum:

1. **Project structure**: how app/, server/, shared/ (if any), composables/, components/,
   layouts/, middleware/, and stores are organized. Note any deviations from Nuxt 4
   conventions (e.g. use of the new `app/` directory structure).
2. **Naming conventions**: files, components, composables, database tables/columns,
   API routes, permission codes (you already use "<table_name>_<action>" style — verify
   this is consistent everywhere).
3. **Component patterns**: how Nuxt UI components are extended/wrapped, slot usage
   patterns (e.g. known quirks like UPageSection needing the `container` slot),
   prop conventions, v-model usage, script setup conventions (order of imports,
   defineProps/defineEmits style, composables usage).
4. **State management**: how state is shared (useState, Pinia, provide/inject), and
   where server vs client state boundaries are drawn.
5. **API / server routes**: request validation approach (zod schemas — confirm),
   response shape conventions, error handling pattern, status codes used.
6. **Database layer**: Drizzle schema conventions, migration workflow (db:generate /
   db:migrate / db:push usage — which is actually used day-to-day), query patterns,
   transaction usage, seed data conventions.
7. **Auth & RBAC**: how JWT/cookie auth is implemented, refresh-token rotation flow,
   how permission checks are applied in middleware vs individual routes, any
   inconsistencies or missing checks.
8. **Styling**: Tailwind 4 usage conventions, design tokens/theme customization,
   dark mode handling, responsive patterns actually used.
9. **TypeScript discipline**: how strict typing is (or isn't) enforced, use of `any`,
   shared types location, whether server/client share types.
10. **Testing**: what exists (if anything) and how it's structured.
11. **Lint/format setup**: actual ESLint + Prettier rules configured (read eslint config,
    don't assume defaults), and any rules that are configured but frequently violated
    in the codebase (this signals rules that need to be either enforced harder or
    relaxed to match reality).
12. **Anti-patterns / inconsistencies**: flag places where the same problem is solved
    differently in different parts of the codebase — these are the highest-priority
    items to standardize.

Do not skip files because they look repetitive — repetition is exactly what reveals
the *real* convention vs. one-off exceptions.

## Phase 2 — Write SKILLS.md
Based on Phase 1 findings (not generic Nuxt/Vue best practices from training data),
write SKILLS.md with these properties:

- **Prescriptive, not descriptive**: state rules as "MUST", "MUST NOT", "ALWAYS",
  "NEVER" — not "it's recommended to...". This file is meant to be followed strictly.
- **Concrete over abstract**: every rule should include a short real code example
  from THIS codebase (or a minimal representative snippet), not a hypothetical.
- **Organized by area**: mirror the Phase 1 sections (structure, naming, components,
  state, API/server, database, auth/RBAC, styling, TypeScript, testing, lint/format).
- **Call out the exceptions you found**: if 90% of the codebase does X but a few files
  do Y, state which is correct and that Y should be migrated — don't silently pick one.
- **Include a "Before you commit" checklist**: lint, typecheck, and any manual checks
  an agent should run before considering a task done (map these to the actual npm
  scripts: lint, typecheck, db:generate, etc.).
- **Include a section on what NOT to do**: known footguns specific to this stack
  (e.g. Nuxt UI slot gotchas, Drizzle migration pitfalls, auth/RBAC bypass risks).
- Keep it as dense reference material — bullet points and short code blocks, not prose
  paragraphs. Assume the reader is an AI agent with limited context budget, not a human
  onboarding for the first time.

## Phase 3 — Self-check
After drafting SKILLS.md, re-scan a sample of files across different areas of the
codebase and verify each rule you wrote actually holds true in at least 3 real
locations. Remove or soften any rule you can't verify. Then output the final file.

Do not ask me clarifying questions before starting — make reasonable assumptions
based on what you find in the code, and note any assumptions at the top of SKILLS.md
under an "Open questions for the team" section instead.
