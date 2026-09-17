---
name: fullstack-feature
description: Use when creating a new CRUD module or making changes that span schema plus permissions plus server API plus client pages. Load when a task crosses more than one layer (database, backend, frontend, auth).
---

# Fullstack Feature

## Purpose

Orchestrates end-to-end CRUD module creation and cross-layer changes so that
schema, permissions, server handlers, client pages, and i18n stay consistent.

## When to Use

- Creating a new CRUD module (table → permissions → API → pages).
- Any change spanning two or more layers (e.g. new field from DB to form).
- Modifying the shared CRUD framework (`useCrudList`, `useCrudForm`, `BaseTable`, `BaseForm`).

## When Not to Use

- Single-layer tasks (load only that layer's skill instead).
- Schema-only, auth-only, or styling-only tasks.

## Required Reading

- `AGENTS.md` (all rule sections).
- `docs/agent/project-map.md` (end-to-end feature flows).
- Companion skills for each touched layer: `drizzle-database`, `nitro-backend`,
  `authentication-security` (when permissions involved), `nuxt-frontend`.

## Repository Evidence

- Reference module: `appUser` — `server/database/schema.ts` (table) →
  `server/database/seed.ts` (`RESOURCES`) → `server/api/appUser/` (4 handlers) →
  `app/pages/app-user/index.vue` + `app/pages/app-user/[crud]/[id].vue` →
  `i18n/locales/{en,th}/model.json` (`model.<table>` keys) → `app/types/models.ts`.
- Framework: `app/composables/useCrudList.ts`, `app/composables/useCrudForm.ts`,
  `app/components/base/BaseTable.vue`, `app/components/base/BaseForm.vue`.

## Workflow

1. Schema: add `pgTable` in `server/database/schema.ts` → `pnpm db:generate && pnpm db:migrate`.
2. Permissions: extend `RESOURCES` in `server/database/seed.ts`
   (auto-creates `<table>_{list,view,add,edit,delete}`) → `pnpm db:seed`.
3. Model: add the PascalCase interface in `app/types/models.ts`.
4. i18n: add `model.<table>` keys in BOTH `th/model.json` and `en/model.json`.
5. Server: `index.get.ts` (`*_list` + `paginate`), `index.post.ts` (`[add,edit]` + validation +
   transaction for junction writes), `[id].get.ts` (`*_view` + `validateID` + 404),
   `[id].delete.ts` (`*_delete` + soft-delete).
6. Client: list page (`useCrudList<T>` + `requiresPermission: ['<table>_list']` + `BaseTable`
   with per-action permission props) and form page (Zod schema + `useCrudForm<T>` + `BaseForm`).
7. Run the pre-commit checklist below.

## Implementation Rules

- Follow each layer skill's rules for its files; keep `camelCase` server modules,
  `kebab-case` page dirs, PascalCase `crudName` consistent between list and form.
- Guards on the server are the real gate; `v-rbac`/page meta are UX mirrors.
- Bigint IDs: `BigInt()` inbound, `.toString()` outbound.

## Anti-Patterns

- Shipping a module with only 4 (or fewer) permission codes; missing `requiresPermission` on pages.
- Raw `$fetch` to the new endpoints; hardcoded UI strings; single-locale i18n.
- Hand-edited migrations; `db:push` beyond local dev.

## Verification

- Pre-commit checklist:
  - [ ] `pnpm typecheck` passes (plus `pnpm build` for runtime-affecting changes).
  - [ ] Migrations generated and applied; no hand-edited SQL.
  - [ ] All five permission codes seeded; handlers guard FIRST; pages declare `requiresPermission`.
  - [ ] i18n keys in BOTH locales; dark mode and mobile-first responsive checked.
  - [ ] Protected fetch via `useApi()`; no new `withDefaults`, `<style>` blocks, Pinia, or `provide`/`inject` state.

## Completion Criteria

- Feature works end-to-end (list → view → create → edit → delete, including permission denials).
- Checklist complete; `pnpm typecheck` passes; gaps reported, not assumed.
