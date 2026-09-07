---
name: nuxt-fullstack-dev
description: Use when working in this Nuxt 4 + Drizzle + PostgreSQL fullstack repo — adding API routes, CRUD modules, RBAC permissions, auth changes, DB schema/migrations, file uploads/CDN, websockets, or i18n strings. Covers project structure, conventions, and verification commands.
---

# Nuxt Fullstack Development

Nuxt 4 (SSR) + Nuxt UI 4 + Tailwind 4 + Pinia + Drizzle ORM + PostgreSQL 18.
Zod 4 for request-body validation. pnpm is pinned via `packageManager` (pnpm@11).
JWT HTTP-Only cookie auth (15m access token `_session_`, 7d opaque refresh token `_slid_`) with RBAC.

Notable client libraries: date-fns (+ `@internationalized/date`), ApexCharts, CropperJS v2 (web components), plyr (video), `@tato30/vue-pdf` / pdf-lib, jszip, browser-image-compression, isomorphic-dompurify, md-editor-v3 (markdown editor/viewer), vue-draggable-plus (drag & drop), `@tanstack/table-core`, cheerio, tailwind-merge, clsx. Fonts (`GoogleSans`, `NotoSansThaiLooped`) are self-hosted via the `fonts` config (@nuxt/fonts) in `nuxt.config.ts`.

## Commands

```bash
pnpm dev              # dev server on 0.0.0.0:3000
pnpm lint             # eslint (stylistic: no comma dangle, 1tbs braces)
pnpm typecheck        # nuxt typecheck
pnpm build            # production build
pnpm preview          # preview built output
pnpm db:generate      # drizzle-kit generate (after editing schema)
pnpm db:migrate       # apply migrations
pnpm db:push          # push schema directly (dev only)
pnpm db:studio        # drizzle studio
pnpm db:seed          # seed permissions/roles/admin user
docker compose -f docker-compose-postgres.yml up -d   # local Postgres 18
```

There are NO tests. Verify work with `pnpm lint && pnpm typecheck`.

## Project layout

- `app/pages/` — pages; generic CRUD modules have a listing page at `<module>/index.vue` and detail/form pages at `<module>/[crud]/[id].vue`
- `app/composables/` — ~26 composables: `useApi` (auto silent-refresh on 401), `useAuth` (login/logout/fetchMe/can()/hasRole()), `useRbac`, `useCrudList`, `useCrudForm`, `usePaging`, `useSort`, `useSocket`, `useUpload`, `useLang`, `useTheme`, `useMenu`, `useLoader`, `useConfirmDialog`, etc.
- `app/api/` — typed client-side API call helpers (e.g. `useFavoriteMenuApi`); auto-imported via `imports.dirs: ['api']` in `nuxt.config.ts`
- `app/utils/`, `app/libs/` — client utilities (`dateUtil`, `fileUtil`, `appUtil`) and shared libs (`Snowflake.ts`, `constants.ts`)
- `app/components/` — auto-imported components grouped by feature (`base/`, `chart/`, `customers/`, `inbox/`, `settings/`, `user/`, ...)
- `app/layouts/` — `default.vue`, `empty.vue`, `feed.vue`
- `app/app.config.ts` — Nuxt UI theme colors (primary: teal, neutral: mist, info: sky, secondary: slate) and component defaults (button/badge/card/link/avatar variants, `icon.size: '18px'`)
- `app/types/` — app-level TypeScript types (`chart.ts`, `common.ts`, `models.ts`, `props.ts`)
- `app/middleware/` — numbered global chain: `00.seo.global.ts` → `01.auth.global.ts` → `02.check-permit.global.ts`
- `app/plugins/` — `rbac.ts` registers `v-rbac` directive (UI-side permission checks); also `00.auth.client.ts`/`00.auth.server.ts`, `cropperjs.client.ts`, `apexchart.client.ts`, `plyr.client.ts`, `pdfVue.client.ts`, `toast.client.ts`, `datefns.ts`
- `server/api/` — Nitro API routes: `auth/`, `appUser/` (incl. `password.post.ts`, `profile.post.ts`), `appRole/`, `permission/`, `fileManager/`, `favoriteMenu/`, plus `mock/` and a `test-socket-send.post.ts`
- `server/middleware/00.auth.ts` — global JWT guard for `/api/**`; public paths: `/api/auth/login|refresh|logout` only
- `server/database/` — `schema.ts` (all 22 tables), `client.ts` (`useDb()` singleton postgres.js connection), `seed.ts` (`RESOURCES` × `ACTIONS` permission matrix + Admin/Viewer roles + admin user)
- `server/utils/` — `jwt.ts`, `password.ts` (bcryptjs), `permission.ts` (`requirePermission(event, code)` returns the token payload), `dbPaging.ts` (`paginate()` — caps page size at 100, escapes LIKE wildcards), `validate.ts`, `modelMapper.ts`, `storage.ts`, `files.ts`, `loginRateLimit.ts`, `exception.ts`, `wsManager.ts`, `snowflake.ts`
- `server/plugins/` — `bigint.ts` (bigint ⇄ string serialization), `date.ts`
- `server/tasks/cleanup-temp.ts` — scheduled task (see Gotchas)
- `server/routes/ws.ts` — WebSocket handler (`defineWebSocketHandler`); broadcast via `server/utils/wsManager.ts`
- `shared/types/` — types shared between client and server (`index.d.ts`)
- `i18n/locales/{en,th}/` — each locale has `app.json`, `base.json`, `error.json`, `helper.json`, `model.json` (+ an `index.ts`); strategy is `no_prefix`, default locale `th`, browser-detect via `locale` cookie

## Key conventions

### RBAC
- Permission naming: `<table>_<action>` where action is one of `list`/`view`/`add`/`edit`/`delete` (e.g. `app_user_add`).
- Server-side: call `requirePermission(event, '<table>_<action>')` at the top of each handler (from `server/utils/permission.ts`).
- Client-side: use the `v-rbac` directive:
  ```vue
  <UButton
    v-rbac="{
      permissions: ['user_manage_not_exist', 'app_role_add'],
      condition: 'any',
    }"
  />
  ```
- Permissions are carried inside the JWT access token payload — after changing a user's roles, tokens must be refreshed.

### CRUD Module Creation Workflow

1. **Define Database Schema**
   * Add the table definition in `server/database/schema.ts`.
   * Run migration commands:
     ```bash
     pnpm db:generate && pnpm db:migrate
     ```

2. **Seed Permissions**
   * Create an SQL migration query under `drizzle/` to insert permission rows using the pattern: `<table_name>_list`, `<table_name>_view`, `<table_name>_add`, `<table_name>_edit`, and `<table_name>_delete`.
   * Generate each permission record ID using `nextId()` from `server/utils/snowflake.ts`.

3. **Define TypeScript Model Interface**
   * Add the table model interface in `app/types/models.ts`, extending base types (e.g. `Id`):
     ```ts
     export interface UserProfile extends Id {
       name: string;
       department?: string;
       description?: string;
       statusType?: number | string;
       enable?: boolean;
       joinDate?: string;
       createdDate?: string;
       updatedDate?: string;
     }
     ```

4. **Configure Localization (i18n)**
   * Add field and table translations to `i18n/locales/th/model.json` and `i18n/locales/en/model.json` under the `model` namespace:
     ```json
     "model": {
       "tableName": {
         "table": "User data",
         "employeeId": "Employee id",
         "fullName": "Fullname",
         "mobilePhone": "Phone no",
         "positionName": "Position"
       }
     }
     ```

5. **Implement Server API Endpoints**
   * Use **camelCase** for the server module directory name (e.g., `userProfile/`).
   * Create the route handlers:
     * `server/api/<moduleName>/index.get.ts`
     * `server/api/<moduleName>/index.post.ts`
     * `server/api/<moduleName>/[id].get.ts`
     * `server/api/<moduleName>/[id].delete.ts`
   * Follow the conventions in `appUser/`: validate request bodies using Zod via `readValidatedBody`, and wrap listing responses using `paginate()` from `dbPaging.ts`.

6. **Build Frontend Views**
   * Use **kebab-case** for the frontend module directory name (e.g., `user-profile/`).
   * Create pages using the `useCrudList` and `useCrudForm` composables:
     * `app/pages/<module-name>/index.vue` (List view)
     * `app/pages/<module-name>/[crud]/[id].vue` (Form / Detail view)

#### CRUD List Types & Options Reference

```ts
export interface ICrudFilterOptions {
  searchable?: boolean;
  searchType?: ICrudListHeaderOptionSearchType;
  searchModel?: any;
  searchColunm?: string;
  sortable?: boolean;
  sortColunm?: string;
  label?: string;
  searchOperation?: SearchOperation;
  searchOperationReadonly?: boolean;
  func?: any;
  selectOption?: {
    items: LabelValue<any>[];
    multiple?: boolean;
  };
}

export enum ICrudListHeaderOptionSearchType {
  TEXT,
  NUMBER,
  BOOLEAN,
  DATE,
  DATETIME,
  OPTIONS,
}

export type SearchOperation = ':' | '>' | '>=' | '<' | '<=' | '=' | '!=';
```

#### Example List Page: `app/pages/<module>/index.vue`

```vue
<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  ICrudListHeaderOptionSearchType,
  type ICrudFilterOptions,
} from "~/types/common";
import type { UserProfile } from "~/types/models"; // Example model (PascalCase)

definePageMeta({
  pageName: "model.userProfile.table",
  requiresPermission: ["user_profile_list"],
});

const UButton = resolveComponent("UButton");
const { t } = useLang();

const {
  dataList,
  loading,
  firstLoaded,
  pages,
  sorts,
  onPageChange,
  onPerPageChange,
  onSort,
  onReload,
  onSearch,
  onItemDelete,
  onNewForm,
  onItemClick,
  onItemCopy,
  crudName,
  onKeywordSearch,
} = useCrudList<UserProfile>({
  crudName: "UserProfile", // PascalCase (e.g. UserProfile, AppRole, OrderItem)
  apiEndpoint: "/api/userProfile", // camelCase (e.g. /api/userProfile, /api/appRole)
  headers: [],
  itemsPerPage: 10,
  defaultSorts: [
    {
      column: "name",
      mode: "asc",
    },
    {
      column: "id",
      mode: "desc",
    },
  ],
});

const columns = ref<TableColumn<UserProfile>[]>([
  {
    accessorKey: "department",
    header: t("model.userProfile.department"),
    cell: ({ row }) => row.getValue("department"),
  },
  {
    accessorKey: "name",
    header: t("model.userProfile.name"),
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
  {
    accessorKey: "description",
    header: t("model.userProfile.description"),
    cell: ({ row }) => row.getValue("description"),
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
  {
    accessorKey: "statusType",
    header: t("model.userProfile.statusType"),
    cell: ({ row }) => {
      const typeVal = row.getValue("statusType");
      if (!typeVal) {
        return null;
      }
      return h(
        UButton,
        {
          class: "rounded-full",
          variant: "soft",
          color: "primary",
          size: "xs",
          onClick: () => {
            onCellTypeClick(row.index);
          },
        },
        () => typeVal,
      );
    },
    meta: {
      options: {
        searchable: true,
        searchType: ICrudListHeaderOptionSearchType.OPTIONS,
        searchOperation: ":",
        searchModel: "",
        selectOption: {
          items: [
            {
              label: "Active",
              value: 1,
            },
            {
              label: "Inactive",
              value: 2,
            },
            {
              label: "Pending",
              value: 3,
            },
          ],
        },
      } as ICrudFilterOptions,
    } as any,
  },
]);

const onCellTypeClick = (index: number) => {
  const rowItem = dataList.value[index];
  console.log("rowItem", rowItem);
};
</script>

<template>
  <BaseDashboardPanel :title="$t('model.userProfile.table')" id="user-profile-index">
    <BaseTable :add-permission="{
        permissions: ['user_profile_add'],
      }" :columns="columns" :crud-name="crudName" :delete-permission="{
        permissions: ['user_profile_delete'],
      }" :edit-permission="{
        permissions: ['user_profile_edit'],
      }" :first-loaded="firstLoaded" :list="dataList" :loading="loading" :show-checkbox="true" :title="$t('model.userProfile.table')" :view-permission="{
        permissions: ['user_profile_view'],
      }" @on-item-click="onItemClick" @on-item-copy="onItemCopy" @on-item-delete="onItemDelete" @on-items-perpage-change="onPerPageChange" @on-keyword-search="onKeywordSearch" @on-new-form="onNewForm" @on-page-no-change="onPageChange" @on-reload="onReload" @on-search="onSearch" @on-sort="onSort" description="User profile management" icon="lucide:user-check" show-keword-search v-model:paging="pages" v-model:sorts="sorts">
      <!--
      accessorKey or id of column can be used as slots everywhere inside BaseTable
      <template #actions-cell="{ row }">
        Action slot
      </template>
      <template #name-cell="{ row }">
        Name slot
      </template>
      -->
    </BaseTable>
  </BaseDashboardPanel>
</template>
```

#### CRUD Form Types & Options Reference

Form generation uses Zod schemas annotated with `.describe(uiConfig(...))` to configure auto-generated UI components mapped to PostgreSQL types.

```ts
export const uiConfig = (config: LabelValue<any>) => JSON.stringify(config);

export interface LabelValue<Type> {
  avatar?: AvatarProps;
  border?: boolean;
  children?: LabelValue<Type>[];
  color?: AppColor;
  disable?: boolean;
  description?: string;
  fetch?: boolean;
  icon?: IconProps | string;
  trailingIcon?: IconProps | string;
  label?: string;
  id?: any;
  noActiveLink?: boolean;
  params?: string[];
  queries?: string[];
  rbac?: RBACProps;
  translateLabel?: boolean;
  to?: string;
  value?: Type;
  additionalValue?: any;
  ui?: {
    type?:
      | 'text'
      | 'date'
      | 'date-range'
      | 'password'
      | 'email'
      | 'number'
      | 'number-step'
      | 'file'
      | 'search'
      | 'select'
      | 'textarea'
      | 'checkbox'
      | 'switch'
      | 'checkbox-group'
      | 'radio-group'
      | 'input-menu'
      | 'input-tags'
      | 'input-pin'
      | 'slider';
    placeholder?: string;
    variant?: 'outline' | 'soft' | 'subtle' | 'ghost' | 'none' | 'list' | 'card' | 'table';
    required?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    clearable?: boolean;
    readonly?: boolean;
    multiple?: boolean;
    separator?: boolean;
    separatorLength?: number | number[];
    maxlength?: number;
    rows?: number;
    min?: number;
    max?: number;
    step?: number;
    orientation?: 'horizontal' | 'vertical';
    layout?: 'list' | 'grid';
    class?: string;
    tooltip?: boolean | string;
    progress?: boolean | number;
    numberOfMonths?: number;
    acceptFiles?: string;
  };
  onHandle?: (...params: any[] | []) => void;
}
```

##### PostgreSQL to Auto-Form UI Mapping

| PostgreSQL Column Type | Zod Type | `ui.type` Config |
| :--- | :--- | :--- |
| `varchar`, `text` (short) | `z.string()` | `'text'` |
| `text` (long) | `z.string()` | `'textarea'` |
| `int`, `serial`, `numeric` | `z.number()` | `'number'` or `'number-step'` |
| `boolean` | `z.boolean()` | `'switch'` or `'checkbox'` |
| `date`, `timestamp` | `z.string()` | `'date'` |
| `date` range (composite) | `z.object({ start, end })` | `'date-range'` |
| `enum` | `z.enum([...])` | `'select'` or `'radio-group'` (use `children` for options) |
| `jsonb` / array (relations) | `z.array(z.string())` | `'checkbox-group'` or `'input-tags'` |

---

#### Example Form Page: `app/pages/<module-name>/[crud]/[id].vue`

```vue
<script setup lang="ts">
import z from "zod";
import type { UserProfile } from "~/types/models";

const { t } = useLang();

useSeoMeta({
  title: t("model.userProfile.table"),
});

// Auto-generated Form Schema based on DB types & i18n
const schema = z.object({
  name: z
    .string()
    .min(1, t("error.validateRequireField"))
    .describe(
      uiConfig({
        label: t("model.userProfile.name"),
        icon: "lucide:user",
        ui: {
          type: "text",
          required: true,
          placeholder: t("model.userProfile.name"),
          clearable: true,
          maxlength: 100,
        },
      }),
    ),
  description: z
    .string()
    .describe(
      uiConfig({
        label: t("model.userProfile.description"),
        ui: {
          type: "textarea",
          maxlength: 500,
          clearable: true,
        },
      }),
    )
    .optional(),
  statusType: z
    .enum(["ACTIVE", "INACTIVE", "PENDING"])
    .describe(
      uiConfig({
        label: t("model.userProfile.statusType"),
        icon: "lucide:activity",
        ui: {
          type: "select",
          required: true,
        },
        children: [
          { label: "Active", value: "ACTIVE" },
          { label: "Inactive", value: "INACTIVE" },
          { label: "Pending", value: "PENDING" },
        ],
      }),
    ),
  enable: z
    .boolean()
    .describe(
      uiConfig({
        label: t("model.userProfile.active"),
        ui: {
          type: "switch",
          required: true,
        },
      }),
    )
    .optional(),
  joinDate: z
    .string()
    .describe(
      uiConfig({
        label: t("model.userProfile.joinDate"),
        ui: {
          type: "date",
        },
      }),
    )
    .optional(),
});

type Schema = z.output<typeof schema>;

const state = ref<Partial<Schema>>({
  name: "",
  description: "",
  statusType: "ACTIVE",
  enable: true,
  joinDate: "",
});

const {
  crudAction,
  loading,
  crudName,
  onDelete,
  onBack,
  onEnableEditForm,
  onSubmit,
} = useCrudForm<UserProfile>(
  {
    crudName: "UserProfile", // PascalCase (must match useCrudList)
    preValidate: false,
  },
  state,
);

const orientation = ref<"horizontal" | "vertical">("horizontal");
</script>

<template>
  <BaseDashboardPanel :title="$t('model.userProfile.table')" id="user-profile-form">
    <BaseForm :crud-action="crudAction" :crud-name="crudName" :loading="loading" :orientation="orientation" :title="$t('model.userProfile.table')" :zod-schema="schema" @on-back="onBack" @on-delete="onDelete" @on-edit-enable="onEnableEditForm" @on-submit="onSubmit" by-pass-permission class="max-w-[1020px]" description="User profile management and configuration" icon="lucide:user-check" v-model="state">
      <template #header-end>
        <URadioGroup :items="['horizontal', 'vertical']" orientation="horizontal" v-model="orientation"/>
      </template>

      <!-- Override specific field using slot: #field-<key> -->
      <!--
      <template #field-name>
        <UFormField :label="$t('model.userProfile.name')" class="w-full" name="name">
          Custom input here
        </UFormField>
      </template>
      -->
    </BaseForm>
  </BaseDashboardPanel>
</template>
```

### Auth flow
- Access JWT carries `permissions[]` in its payload. Refresh token is opaque and validated against the DB `access_token` table (revocation-aware).
- Client calls go through `useApi()` which silently refreshes on 401 (refresh is shared/deduped across instances). Never call `$fetch('/api/...')` directly for protected endpoints.
- Login is rate-limited per identifier+IP via in-memory tracking in `server/utils/loginRateLimit.ts` (blocks after repeated failures).

### Files / CDN
- Uploads via `server/api/fileManager/`, stored under the directory from runtimeConfig `cdnDirectory` (env `NUXT_CDN_DIRECTORY=data`), served at `/cdn/**` by `server/routes/cdn/[...filename].ts`.
- MIME whitelist + size limits configured in `nuxt.config.ts` runtimeConfig public keys (`acceptFiles`, `limitFileUploadSize`, `maxImageToResize*`).

### i18n
All user-facing strings must be added to BOTH `th` and `en` JSON files under `i18n/locales/`. Default/fallback locale is Thai.

## AI code generation guidelines

1. **Composition API:** Always use `<script setup lang="ts">`. Do not use Options API.
2. **Nuxt UI components:** Prefer native Nuxt UI components (`<UButton>`, `<UCard>`, `<UInput>`, ...) over raw HTML.
3. **TypeScript:** Define proper interfaces/types for props, emits, and API responses. Avoid `any` (the lint rule is off, but still avoid it).
4. **Auto-imports:** Rely on Nuxt auto-imports for Vue APIs, Nuxt UI components, and composables from `app/composables/` and `app/api/`.
5. **API fetching:** Never call `$fetch` or `useFetch` directly for backend API calls — use the function from `useApi()` (wraps `ofetch`, forwards cookies during SSR, sends `Accept-Apiclient` / `Accept-Language` headers, handles silent refresh), wrapped in try/catch:
   ```typescript
   const api = useApi()
   try {
     const data = await api<ApiResponse<Permission>>('/api/permission', { method: 'GET' })
   } catch (error) {
     console.error('Failed to fetch data', error)
   }
   ```
6. **Props:** Prefer reactive destructuring with default values for `defineProps`; avoid `withDefaults` in new code:
   ```typescript
   const { count = 0, message = 'hello' } = defineProps<{ count?: number; message?: string }>()
   ```
7. **Emits:** Type-based declaration with tuple syntax, no runtime array/object syntax:
   ```typescript
   const emit = defineEmits<{ 'on-close': []; change: [id: number]; update: [value: string] }>()
   ```
8. **SFC block order:** `<script setup lang="ts">` → `<template>` → `<style scoped>` (if needed).
9. **Styling & dark mode:** Prefer Tailwind utility classes with `dark:` variants; custom styles use plain scoped CSS (no SCSS). Always consider dark mode.
10. **Comments:** Do not add comments unless explicitly required.

## Infrastructure & DevOps

- **Dockerfile:** multi-stage — `node:24` build stage → `node:24-alpine` runtime (non-root `node` user, `dumb-init`, HEALTHCHECK on port 3000, `TZ=Asia/Bangkok` + tzdata). Runs Nitro via PM2 (`pm2-runtime ecosystem.config.cjs`, cluster mode) serving `server/index.mjs` as process `nuxt-web` on port 3000.
- **docker-compose.yml** (`nuxtui-web`): maps host `3002` → container `3000`. Build helpers: `build-app.sh` / `build-app.ps1`.
- **CI:** `.github/workflows/ci.yml` (manual `workflow_dispatch` trigger) — Node 22 + pnpm, runs `pnpm lint` then `pnpm typecheck`.
- **Dependencies:** Renovate enabled (`renovate.json`).

## Gotchas
- Runtime config secrets come from `.env` (see `.env.example`) — never hardcode JWT secrets. Public runtime keys (`jwtKeyName`, `refreshJwtKeyName`, `currentUserKeyName`, paging defaults, etc.) are in `nuxt.config.ts`.
- Bigint IDs serialize as strings across the wire; server plugin `bigint.ts` handles conversion — don't compare IDs with `===` against numbers.
- Cropperjs custom elements (`cropper-canvas` etc.) are registered as Vue custom elements in `nuxt.config.ts`.
- Nitro experimental features in use: openAPI, websocket, tasks. Scheduled task `cleanup-temp` runs nightly at 3 AM (cron in `nitro.scheduledTasks`).
- `/api/**` has CORS enabled via `routeRules`; `/api/auth/**` is cache-disabled.
- The `performance_dashboard` view and `create_monthly_partitions` function are NOT in the Drizzle schema — add as raw SQL migrations (`npx drizzle-kit generate --custom`) if needed.
- ESLint stylistic rules (no trailing commas, 1tbs) are enforced via `eslint.config.mjs`/nuxt config — match them or `pnpm lint` fails. Other enforced/warned Vue rules: max 3 attributes per single-line element, `kebab-case` custom events, `vue/attributes-order`, explicit emits required; `vue/multi-word-component-names` is off.
