---
name: nuxt-frontend
description: Use when changing Nuxt pages, Vue components, composables, client API helpers, menus, UI state, styles, client types, or translations under app/ and i18n/. Contains copy-ready CRUD list/form page templates and the crudName naming rules. Pair with authentication-security when permission behavior changes.
---

# Nuxt Frontend

Read `AGENTS.md` first. Open the page/component you change and its nearest sibling
before editing; copy their structure instead of inventing a new one.

## 1. Where things live

| Need | File |
|---|---|
| CRUD list page template | `app/pages/app-user/index.vue` (also `app-role`, `ai-document-meta`) |
| CRUD form page template | `app/pages/app-role/[crud]/[id].vue` (simple), `app/pages/app-user/[crud]/[id].vue` (file upload + custom field) |
| List/form logic | `app/composables/useCrudList.ts`, `app/composables/useCrudForm.ts`, `app/composables/usePagefecth.ts` (typo is intentional — never add a correctly spelled copy) |
| Generic table / auto form | `app/components/base/BaseTable.vue`, `app/components/base/BaseForm.vue`, page shell `BaseDashboardPanel.vue` |
| HTTP client | `app/composables/useApi.ts` → `useApi()` (cookies, SSR forward, silent refresh, toast of `message`) |
| Client API helpers | `app/api/use*Api.ts` (example `useFavoriteMenuApi.ts`) |
| Auth state / permissions | `app/composables/useAuth.ts`, `app/composables/useRbac.ts`, directive `app/plugins/rbac.ts` (`v-rbac`) |
| Sidebar menu | `app/composables/useMenu.ts` (`permissions: [...]` per item) |
| Route guards | `app/middleware/00.seo.global.ts` → `01.auth.global.ts` → `02.check-permit.global.ts` |
| Types | `app/types/common.ts` (`ResponseEntity`, `ApiResponse`, CRUD options), `app/types/models.ts`, `app/types/props.ts` |
| Helpers | `app/utils/appUtil.ts` (`uiConfig`, `pascalToSnake/Kebab/CamelCase`), constants `app/libs/constants.ts` |
| Translations | `i18n/locales/{en,th}/{app,base,error,helper,model}.json` (both languages, same keys) |
| Theme | `app/app.config.ts`, `app/assets/css/main.css` |

## 2. The `crudName` naming rule (CRUD pages)

One PascalCase `crudName` drives URLs and permission checks inside the shared components:

| Derived by | Used for | `crudName: 'AppUser'` gives |
|---|---|---|
| `pascalToKebab` | page folder + navigation (`/<kebab>/<action>/<id>`) | `app/pages/app-user/` |
| `pascalToCamelCase` | API path used by `useCrudForm` and list delete | `/api/appUser` → `server/api/appUser/` |
| `pascalToSnake` | default permission prefix in `BaseTable` / `BaseForm` | `app_user_list/view/add/edit/delete` |

If one of the three names does not match, buttons disappear or requests 404. Form routes
use `<action>` = `new | edit | view | copy`, and `new` uses id `0` (`/app-user/new/0`).

## 3. Templates

Replace `Xyz` / `xyz` / `xyz_table` (see the table above for each form).

### 3.1 List page — `app/pages/<kebab>/index.vue`

```vue
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { ICrudListHeaderOptionSearchType, type ICrudFilterOptions } from "~/types/common";
import type { Xyz } from "~/types/models";

definePageMeta({
  pageName: "model.xyz_table.table",
  requiresPermission: ["xyz_table_list"],
});

const { t } = useLang();
const {
  dataList, loading, firstLoaded, pages, sorts, crudName,
  onPageChange, onPerPageChange, onSort, onReload, onSearch, onKeywordSearch,
  onItemDelete, onNewForm, onItemClick, onItemCopy,
} = useCrudList<Xyz>({
  crudName: "Xyz",                 // PascalCase
  apiEndpoint: "/api/xyz",         // camelCase server module
  itemsPerPage: 10,
  defaultSorts: [{ column: "name", mode: "asc" }],
});

// accessorKey must equal a key in the server paginate() `columns` map to sort/search it
const columns = ref<TableColumn<Xyz>[]>([
  {
    accessorKey: "name",
    header: t("model.xyz_table.name"),
    cell: ({ row }) => row.getValue("name"),
    meta: {
      options: {
        sortable: true,
        searchable: true,
        searchType: ICrudListHeaderOptionSearchType.TEXT,
        searchOperation: ":",
        searchModel: "",
      } as ICrudFilterOptions,
    } as any,
  },
]);
</script>

<template>
  <BaseDashboardPanel id="xyz-index" :title="$t('model.xyz_table.table')">
    <BaseTable
      icon="lucide:list"
      :title="$t('model.xyz_table.table')"
      :crud-name="crudName"
      :list="dataList"
      :loading="loading"
      :first-loaded="firstLoaded"
      :columns="columns"
      v-model:sorts="sorts"
      v-model:paging="pages"
      @on-item-delete="onItemDelete"
      @on-page-no-change="onPageChange"
      @on-items-perpage-change="onPerPageChange"
      @on-new-form="onNewForm"
      @on-item-click="onItemClick"
      @on-item-copy="onItemCopy"
      @on-sort="onSort"
      @on-reload="onReload"
      @on-keyword-search="onKeywordSearch"
      @on-search="onSearch"
    />
  </BaseDashboardPanel>
</template>
```

### 3.2 Form page — `app/pages/<kebab>/[crud]/[id].vue`

```vue
<script setup lang="ts">
import z from "zod";
import type { Xyz } from "~/types/models";

definePageMeta({
  pageName: "model.xyz_table.table",
  requiresPermission: ["xyz_table_view", "xyz_table_add", "xyz_table_edit"],
});

const { t } = useLang();

// BaseForm renders one field per schema key; .describe(uiConfig(...)) sets label + widget.
// ui.type: text | email | number | password | textarea | select | checkbox | switch |
//          checkbox-group | radio-group | input-menu | number-step | input-tags | date | date-range | file
const schema = z.object({
  name: z
    .string()
    .min(1, t("error.validateRequireField"))
    .describe(uiConfig({ label: t("model.xyz_table.name"), ui: { type: "text", required: true, maxlength: 255 } })),
  active: z
    .boolean()
    .describe(uiConfig({ label: t("base.status"), ui: { type: "checkbox" } }))
    .optional(),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({ name: "", active: true });

const { crudAction, loading, crudName, isEditMode, onDelete, onBack, onEnableEditForm, onSubmit } =
  useCrudForm<Xyz>(
    {
      crudName: "Xyz",
      methodPut: "POST",          // edits go to the same upsert POST /api/xyz
      methodPutIncludeId: false,
    },
    state,
  );
</script>

<template>
  <BaseDashboardPanel id="xyz-crud" :title="$t('model.xyz_table.table')">
    <BaseForm
      v-model="state"
      :zod-schema="schema"
      :edit-mode="isEditMode"
      :crud-action="crudAction"
      :loading="loading"
      :crud-name="crudName"
      icon="lucide:list"
      :title="$t('model.xyz_table.table')"
      orientation="horizontal"
      @on-back="onBack"
      @on-edit-enable="onEnableEditForm"
      @on-submit="onSubmit"
      @on-delete="onDelete"
    >
      <!-- override one field: <template #field-<schemaKey>> ... </template> -->
    </BaseForm>
  </BaseDashboardPanel>
</template>
```

`useCrudForm` loads `GET /api/<camel>/<id>` for edit/view/copy, submits `POST` for
new/copy and `methodPut` for edit, shows the success toast, and navigates back.

### 3.3 Client API helper (non-CRUD calls) — `app/api/useXyzApi.ts`

```ts
import type { ResponseEntity } from "~/types/common";
import type { Xyz } from "~/types/models";

export const useXyzApi = () => {
  const api = useApi();
  const findAll = () => api<ResponseEntity<Xyz[]>>("/api/xyz/findAll");
  const toggle = (id: string) => api<ResponseEntity<Xyz>>(`/api/xyz/${id}/toggle`, { method: "POST" });
  return { findAll, toggle };
};
```

Inside a page, data needed for SSR: `await useAsyncData("xyz-all", async () => (await api<ResponseEntity<Xyz[]>>("/api/xyz/findAll")).data || [])`
— the request itself must go through `useApi()` (see `app-user/[crud]/[id].vue`).

## 4. Rules that are easy to miss

- **Requests:** protected endpoints only through `useApi()` (or `useApi().raw` for streams).
  Never raw `$fetch` / `useFetch` for `/api/**` that needs auth. Only exception: silent best-effort
  calls whose failure just hides UI (link preview in `BaseOpenGraphItemAlt.vue`), wrapped in `try/catch`.
  `useApi()` shows a toast for any response that has a `message`.
- **Permissions in UI:** `definePageMeta({ requiresPermission: [...] })` on protected pages,
  `v-rbac="{ permissions: ['xyz_table_add'] }"` on buttons, `permissions` on menu items in
  `useMenu.ts`. All of this is cosmetic — the server handler must check the same code.
- **i18n:** every visible string in **both** `en` and `th` files with the same key.
  New modules use nested keys in `model.json`: `"model": { "xyz_table": { "table": "...", "name": "..." } }`.
  Script: `const { t } = useLang()`; template: `$t('...')`. Do not add a new top-level file
  unless it is registered in `nuxt.config.ts` (`fileLangNames`).
- **State:** shared state = `useState('<namespace>:<key>', ...)`. No Pinia, no provide/inject for app state.
  Two-way props = `defineModel`. Props = reactive destructure of `defineProps<...>()` (no new `withDefaults`).
- **Vue style:** `<script setup lang="ts">` then `<template>`; kebab-case custom events
  (`@on-submit`); max 3 attributes on a single-line element; no new `<style>` blocks
  (Tailwind classes); no new `any` except the existing `meta: {...} as any` column pattern.
- **UI:** primary actions `color="primary" variant="solid"` (global default is subtle/neutral);
  add `dark:` variants and check mobile width.
- **SSR:** use `import.meta.client` guards for browser-only APIs; `*.client.ts` plugins for browser libraries.
- **IDs** are strings on the client. Never convert to `Number`.

## 5. Adding a menu entry

Add an item in the right group of `appNavs` in `app/composables/useMenu.ts`:
`{ label: t("model.xyz_table.table"), icon: "lucide:list", to: "/xyz", permissions: ["xyz_table_list"] }`.
Use a permission code that exists in the seed, and the same code in the page's `requiresPermission`.

## 6. Done checklist

- [ ] `crudName`, page folder, API folder, and permission prefix match section 2.
- [ ] Page meta permission + button/menu permission set; server enforces the same codes.
- [ ] All new strings exist in `en` and `th`.
- [ ] Calls go through `useApi()`; response types use `ResponseEntity<T>` / `ApiResponse<T>`.
- [ ] `pnpm typecheck` passes; `pnpm build` for runtime/SSR changes. Do **not** run `pnpm lint`.
- [ ] If the dev server is available: open the page, check list/search/sort/paging, new/edit/delete,
      a user without permission, both languages, dark mode, and mobile width. Report what you could not check.
