# Frontend Skill

Use for Vue components, pages, composables, client state, Nuxt UI, Tailwind, TypeScript, and i18n work.

## 3. Components — MUST follow

- ALWAYS `<script setup lang="ts">` first, `<template>` second. NEVER Options API. NEVER `<style>` blocks in new components (all Tailwind inline; no component ships a style block except legacy cases).

- Import order MUST be external (`@nuxt/ui`, `zod`, `@tanstack/table-core`) → `~/libs|~/types`. Composables (`useLang`, `useRbac`, `useBase`) MUST rely on auto-import (NEVER manually import from `@/composables/` — only violation is `BaseMarkdownEditor.vue:3`, do not copy it).

- Props in new code MUST use reactive destructure with defaults; NEVER `withDefaults` in new code (11 legacy files still use `withDefaults`: `BaseDashboardPanel`, `BaseModal`, `BaseItem`, `BaseInfiniteScroll`, `BaseMarkdownEditor` — migrate on touch):

  ```ts

  // CORRECT (BaseTable.vue:32, BaseForm.vue:13)

  const { showPaging = true, byPassPermission = false } = defineProps<{ showPaging?: *boolean*; byPassPermission?: *boolean* }>()

  ```

- Emits MUST be type-tuple syntax with kebab-case names (enforced by `vue/custom-event-name-casing: warn`); NEVER runtime array/object syntax:

  ```ts

  // CORRECT (BaseTable.vue:63-75, BaseForm.vue:50-56)

  const emit = defineEmits<{ 'on-page-no-change': [v: *number* | *undefined*]; 'on-item-click': [index: *number*, type: *ICrudAction*] }>()

  ```

- Two-way binding MUST use `defineModel` (verified in 20+ components); NEVER `modelValue` prop + `update:modelValue` emit manually:

  ```ts

  // CORRECT (BaseModal.vue:29, BaseForm.vue:62, BaseTable.vue:78-84)

  const modelValue = defineModel<*boolean*>({ default: false })

  const paging = defineModel<*IPagination* | *undefined*>('paging', { default: undefined })

  ```

- Prefer Nuxt UI components (`UButton`, `UCard`, `UInput`, `UTable`, `UForm`) over raw HTML. NOTE `app.config.ts` sets `button.defaultVariants: { variant: 'subtle', color: 'neutral' }` — MUST pass explicit `color="primary" variant="solid"` for primary actions, NEVER rely on defaults.

- `BaseTable<T>` / `BaseForm<T>` generics MUST be parameterized (`BaseTable<UserProfile>`, columns as `TableColumn<UserProfile>[]`). Slots: `#field-<key>` overrides an auto field in `BaseForm`; any `accessorKey`/`id` works as `#<key>-cell` slot in `BaseTable`; `BaseTable` forwards unknown slots to `UTable`. Column filter/sort config lives in `meta.options as ICrudFilterOptions` (with `as any` cast — keep it, see Gotchas).

- `v-rbac` is UI-hiding ONLY, NEVER a security boundary (directive removes `el` in `app/plugins/rbac.ts`). MUST still enforce server-side. Usage:

  ```vue

  <UButton *v-rbac*="{ permissions: ['app_role_add'], condition: 'any' }" />

  ```

  `by-pass-permission` / `byPassPermission` MUST only appear on example pages or genuinely public tables — NEVER on real CRUD modules (only hit outside examples: none; `example/form.vue:369` is the exception).


## 4. State — MUST follow

- Client shared state MUST use `useState` with namespaced keys. NEVER Pinia (`defineStore` = 0 hits, not installed):

  ```ts

  // CORRECT (useAuth.ts, useTheme.ts:6, useAiChat.ts:16-18, useAppChat.ts:8-15)

  const auth = useState<*AppUser* | *null*>('auth:user', () => null)

  const appNavigations = useState<*AppNavigationMenuItem*[]>('auth:navigations', () => [])

  ```

- NEVER `provide`/`inject` for app state (zero `inject()` in `app/`; `provide` only in plugins for `$toast`, pdf, plyr, datefns). For cross-component singletons use `createSharedComposable` (`useDashboard.ts:25`) or module-singleton + `useOverlay().create()` (`useLoader.ts:3`, `useConfirmDialog.ts:13`).

- Server state boundary: SSR cookie forwarding lives ONLY in `useApi.ts` (`useRequestHeaders(['cookie'])`, `_responseCookies` map, `_refreshPromise` single-flight). NEVER reimplement refresh logic in pages/components — ALWAYS go through `useApi()`.


## 8. Styling — MUST follow

- Tailwind 4 + Nuxt UI 4 ONLY. Theme tokens live in `app/assets/css/main.css` (`@theme static`: `font-sans GoogleSans`, `success/error/warning/graphite/umbra` scales, `--ui-text-*`, `--ui-radius: 0.375rem`) and component defaults in `app/app.config.ts` (actual values: `primary:'blue'`, `neutral:'stone'`, `info:'sky'`, `secondary:'slate'` — NOT teal/mist). NEVER introduce new global CSS files; NEVER SCSS.

- Dark mode MUST be handled per-element with `dark:` variants (`bg-neutral-50 dark:bg-neutral-900`, `text-neutral-900 dark:text-neutral-50`, `dark:prose-invert` — see `layouts/default.vue:122`). Base `body` (`bg-neutral-50 dark:bg-neutral-950`) is already set — NEVER override it per-page.

- Responsive MUST be mobile-first Tailwind (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, `hidden md:inline`, `flex flex-wrap`, `my-4 md:my-0` — see `BaseTable.vue:660`, `BasePaging.vue:28-53`). Form orientation MUST collapse via `isMobile ? 'vertical' : orientation` (`BaseForm.vue:371`).

- Icons MUST be `lucide:*` / iconify names via `@nuxt/icon` (`icon.size: '18px'` default; toast icons `lucide:circle-check` / `lucide:octagon-alert`).


## 9. TypeScript — MUST follow

- Canonical type homes: `app/types/common.ts` (`ResponseEntity`, `ApiResponse`, `CrudListApiOptions`, `CrudFormApiOptions`, `IPagination`, `ISort`), `app/types/models.ts` (`AppUser`, `AppRole`, `Permission`, `FileManager`, `AiChat`), `app/types/props.ts` (`RBACProps`). NEVER put shared server/client types in `shared/types/` (empty file — do not revive without team decision).

- Handlers/pages MUST type returns (`Promise<ResponseEntity<ApiResponse<X>>>`, `TableColumn<UserProfile>[]`, `useCrudList<UserProfile>`). `any` is lint-allowed (`no-explicit-any: off`) and pervasive (e.g. `meta.options as any`, `useApi` generics default `any`) — avoid `any` in NEW code but NEVER mass-refactor existing `any`s in the same PR.

- `tsconfig.json` only references `.nuxt/tsconfig.*` (default Nuxt strictness, no override). `bigint` IDs: type inbound as `string`, convert at DB boundary (see §6).


## 12. i18n — MUST follow

- MUST add every user-facing string to BOTH `i18n/locales/en/*.json` AND `i18n/locales/th/*.json` (files: `app,base,helper,model,error.json` + `index.ts`). Strategy `no_prefix`, default/fallback `th`, browser-detect via `locale` cookie (`nuxt.config.ts:85-110`). NEVER hardcode Thai/English UI text.

- In script MUST use `const { t } = useLang()` + `t('base.x')`; in template MUST use `$t('base.x')` (both patterns coexist in `BaseTable/BaseForm/BasePaging` — keep whichever the file already uses). NEVER import `useI18n` directly (wrap via `useLang`: locale-switch reload logic lives there).
