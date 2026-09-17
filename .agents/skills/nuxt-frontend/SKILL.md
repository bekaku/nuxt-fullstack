---
name: nuxt-frontend
description: Use for Nuxt 4 frontend work — Vue pages, components, composables, client state, Nuxt UI styling, TypeScript types, and i18n. Load when the task touches anything under app/ or i18n/.
---

# Nuxt Frontend

## Purpose

Covers all client-side work in this Nuxt 4 SSR app: pages, layouts,
components, composables, client state, UI/styling, TypeScript types, and i18n.

## When to Use

- Creating or editing files under `app/` (pages, components, composables,
  layouts, middleware, plugins, utils, api, types).
- Adding or changing UI strings under `i18n/locales/`.
- Styling, theming, responsive layout, or dark-mode work.

## When Not to Use

- Pure server-only changes (`server/api/`, `server/utils/`, schema, seed).
- Pure auth-flow changes (use `authentication-security` alongside this skill
  only when login/session behavior is touched).

## Required Reading

- `AGENTS.md` (sections 6, 7, 11).
- `docs/agent/project-map.md` (frontend architecture).
- `docs/FOOTGUNS.md` only when debugging behavior it documents.

## Repository Evidence

- Pages: `app/pages/app-user/index.vue` (list, `useCrudList`), `app/pages/app-user/[crud]/[id].vue` (form).
- Components: `app/components/base/BaseTable.vue`, `app/components/base/BaseForm.vue` (generic, slotted).
- State/fetch: `app/composables/useApi.ts` (SSR cookie forward, silent refresh),
  `app/composables/useAuth.ts`, `app/composables/useRbac.ts`, `app/composables/useCrudList.ts`.
- Guards: `app/middleware/00.seo.global.ts`, `01.auth.global.ts`, `02.check-permit.global.ts`.
- UI gating: `app/plugins/rbac.ts` (`v-rbac` directive).
- Types: `app/types/common.ts`, `app/types/models.ts`, `app/types/props.ts`.
- Theme: `app/assets/css/main.css`, `app/app.config.ts`. Locales: `i18n/locales/{en,th}/*.json`.

## Workflow

1. Identify the page/component/composable involved; read it and its neighbors first.
2. For lists: use `useCrudList<T>` with PascalCase `crudName` matching the form's `useCrudForm<T>`.
3. For forms: build the Zod schema with `.describe(uiConfig(...))` and render via `BaseForm`.
4. Route protected requests through `useApi()`; gate UI with `v-rbac` or `BaseTable` permission props.
5. Add every user-facing string to BOTH `i18n/locales/en/` and `i18n/locales/th/`.
6. Verify with `pnpm typecheck`; check responsive + dark-mode rendering.

## Implementation Rules

- `<script setup lang="ts">` first, `<template>` second; never Options API.
- Shared client state via namespaced `useState`; never Pinia; never `provide`/`inject` for app state.
- Two-way binding via `defineModel`; props via reactive destructure (no new `withDefaults`).
- Emits use type-tuple syntax with kebab-case names.
- Rely on composable auto-imports; never manually import from `@/composables/`.
- Primary actions carry explicit `color="primary" variant="solid"`.
- `definePageMeta({ requiresPermission: [...] })` on protected pages; keep middleware order `00 → 01 → 02`.
- In script use `useLang()` + `t()`; in template use `$t()`; never import `useI18n` directly.
- Mobile-first Tailwind with per-element `dark:` variants; no new `<style>` blocks or global CSS files.

## Anti-Patterns

- Raw `$fetch`/`useFetch`/`useAsyncData` for protected routes (breaks refresh + SSR cookies).
- Treating `v-rbac` or route middleware as a security boundary (UX only).
- `byPassPermission` on real CRUD modules (examples only).
- Hardcoded UI strings; single-locale i18n additions.
- New `any`, new `<style>` blocks, new `withDefaults`, correcting the `usePagefecth.ts` typo by duplication.

## Verification

- `pnpm typecheck` (canonical gate).
- `pnpm build` when the change affects runtime behavior.
- Manual click-through of affected pages; confirm no hardcoded strings, responsive layout, dark mode.

## Completion Criteria

- Only relevant frontend files changed; conventions above hold.
- i18n complete in both locales; `pnpm typecheck` passes.
- Unverifiable checks (e.g. visual review) are reported, not assumed.
