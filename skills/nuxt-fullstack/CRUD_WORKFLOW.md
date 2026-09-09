# CRUD Workflow Skill

Use when creating a new CRUD module or making changes that span schema + permissions + server API + client pages.

## CRUD module creation workflow (normative)

1. Schema: add `pgTable` in `server/database/schema.ts` → `pnpm db:generate && pnpm db:migrate`.

2. Permissions: extend `RESOURCES` in `server/database/seed.ts` (auto-creates `<table>_{list,view,add,edit,delete}`) → `pnpm db:seed`.

3. Model: add interface in `app/types/models.ts` (PascalCase, extend `Id`).

4. i18n: add keys under `model.<table>` in BOTH `th/model.json` and `en/model.json`.

5. Server: `server/api/<camel>/index.get.ts` (requirePermission `*_list` + `paginate`), `index.post.ts` (requireAnyPermission `[add,edit]` + `readValidatedBody` + transaction if junction writes), `[id].get.ts` (`*_view` + `validateID` + 404), `[id].delete.ts` (`*_delete` + soft-delete `set({deleted:true})` + `serverException` catch).

6. Client: `app/pages/<kebab>/index.vue` (`useCrudList<T>` + `definePageMeta requiresPermission: ['<table>_list']` + `BaseTable` with per-action permission props) and `app/pages/<kebab>/[crud]/[id].vue` (Zod schema with `.describe(uiConfig(...))` + `useCrudForm<T>` + `BaseForm`).


## Before you commit checklist

- [ ] `pnpm typecheck` passes (canonical gate; `pnpm lint` known-broken — still hand-check: no trailing commas, 1tbs braces, ≤3 attrs per single-line element, kebab-case emits).

- [ ] New/edited tables: `pnpm db:generate && pnpm db:migrate` applied; no hand-edited SQL; `db:push` never used beyond local dev.

- [ ] New module: all 5 permission codes seeded; server handler calls `requirePermission`/`requireAnyPermission`/`getAuthUser` FIRST; page sets `requiresPermission`; destructive actions have `v-rbac` or `BaseTable` permission props (UI-only, server check is the real gate).

- [ ] Bigint IDs stringified at boundary (`BigInt()` in, `.toString()` out); no `===` number comparisons.

- [ ] i18n keys added to BOTH `en` and `th`; no hardcoded UI strings; dark mode (`dark:`) and mobile-first responsive checked.

- [ ] Protected fetch goes through `useApi()` in try/catch; no new raw `$fetch`/`useFetch` to protected routes; no new `withDefaults` (reactive destructure only); no new `<style>` blocks; no new Pinia/provide-inject state.


## Required Companion Skills

A CRUD task normally also requires:

- `DATABASE.md`
- `SERVER_API.md`
- `AUTH_RBAC.md` when permissions are involved
- `FRONTEND.md`
