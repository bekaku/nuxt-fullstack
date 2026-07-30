<script setup lang="ts">
import z from "zod";
import type { LabelValue, ResponseEntity } from "~/types/common";
import type { AppRole, Permission } from "~/types/models";

definePageMeta({
  pageName: "model.role.table",
  requiresPermission: ["app_role_view", "app_role_add", "app_role_edit"],
});

const { t } = useLang();
const api = useApi();
const schema = z.object({
  name: z
    .string()
    .min(1, t("error.validateRequireField"))
    .describe(
      uiConfig({
        label: t("model.role.name"),
        ui: {
          type: "text",
          required: true,
          clearable: true,
          maxlength: 125,
        },
      }),
    ),
  active: z
    .any()
    .describe(
      uiConfig({
        label: t("base.status"),
        ui: {
          type: "checkbox",
          separator: true,
        },
      }),
    )
    .optional(),
  selectdPermissions: z
    .array(z.string())
    .describe(
      uiConfig({
        label: t("model_permission"),
        ui: {
          type: "checkbox",
        },
      }),
    )
    .optional(),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  name: "",
  active: true,
  selectdPermissions: [],
});

const {
  crudAction,
  loading,
  crudName,
  isEditMode,
  onDelete,
  onBack,
  onEnableEditForm,
  onSubmit,
  preFectData,
} = useCrudForm<AppRole>(
  {
    crudName: "AppRole",
    methodPutIncludeId: false,
    methodPut: "POST",
    fectchDataOnLoad: true,
  },
  state,
);

const { data: permissions, pending } = await useAsyncData<Permission[]>(
  "permission-all",
  async () => {
    const response = await api<ResponseEntity<Permission[]>>(
      "/api/permission/findAllPermission",
    );
    return response.data || [];
  },
);

// const groupedPermissions = computed(() => {
//   if (!permissions.value) {
//     return [];
//   }

//   // 1. จัดกลุ่มข้อมูลตาม module
//   const groupedData = permissions.value.reduce(
//     (acc, item) => {
//       // ถ้าไม่มี module ให้ใช้คำว่า 'other'
//       const moduleName = item.module || "other";

//       if (!acc[moduleName]) {
//         acc[moduleName] = [];
//       }

//       // เก็บข้อมูลเข้ากลุ่ม
//       acc[moduleName].push({
//         label: item.code,
//         description: item.description,
//         value: item.id,
//       });

//       return acc;
//     },
//     {} as Record<string, any[]>,
//   );

//   // 2. แปลงเป็น Array ซ้อน Array ตามรูปแบบ ListboxItem[][]
//   return Object.entries(groupedData).map(([moduleName, items]) => {
//     return [
//       {
//         type: "label",
//         label: moduleName,
//       },
//       ...items,
//     ];
//   });
// });
const searchQuery = ref("");

const groupedPermissions = computed(() => {
  if (!permissions.value) return [];

  const query = searchQuery.value.toLowerCase().trim();

  const filteredPermissions = permissions.value.filter((item) => {
    const codeMatch = item.code?.toLowerCase().includes(query) || false;
    const descMatch = item.description?.toLowerCase().includes(query) || false;
    const moduleMatch = (item.module || "other").toLowerCase().includes(query);

    return codeMatch || descMatch || moduleMatch;
  });

  const grouped = filteredPermissions.reduce(
    (acc, item) => {
      const moduleName = item.module || "other";

      if (!acc[moduleName]) {
        acc[moduleName] = [];
      }

      acc[moduleName].push(item);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return Object.entries(grouped).map(([moduleName, items]) => ({
    module: moduleName,
    items: items,
  }));
});
const togglePermission = (id: string, isChecked: boolean) => {
  if (!state.value.selectdPermissions) {
    state.value.selectdPermissions = [];
  }

  if (isChecked) {
    if (!state.value.selectdPermissions.includes(id)) {
      state.value.selectdPermissions.push(id);
    }
  } else {
    state.value.selectdPermissions = state.value.selectdPermissions.filter(
      (item) => item !== id,
    );
  }
};
const selectAllState = computed<boolean | "indeterminate">(() => {
  if (!permissions.value || permissions.value.length === 0) return false;
  if (
    !state.value.selectdPermissions ||
    state.value.selectdPermissions.length === 0
  )
    return false;

  const allSelected = permissions.value.every((perm) => {
    if (!perm.id) return false;
    return state.value.selectdPermissions!.includes(String(perm.id));
  });

  return allSelected ? true : "indeterminate";
});

const toggleSelectAll = (val: boolean | "indeterminate") => {
  if (val === true) {
    state.value.selectdPermissions = permissions.value
      ? permissions.value
          .map((p) => String(p.id))
          .filter((id) => id !== "undefined" && id !== "")
      : [];
  } else {
    state.value.selectdPermissions = [];
  }
};
</script>
<template>
  <BaseDashboardPanel id="app-role-crud-index" :title="$t('model.role.table')">
    <BaseForm
      :zod-schema="schema"
      v-model="state"
      :edit-mode="isEditMode"
      :crud-action="crudAction"
      :loading="loading"
      :crud-name="crudName"
      icon="lucide:users-round"
      :title="$t('model.role.table')"
       class="max-w-[1020px]"
      @on-back="onBack"
      @on-edit-enable="onEnableEditForm"
      @on-submit="onSubmit"
      @on-delete="onDelete"
    >
      <template v-if="state.selectdPermissions" #field-selectdPermissions>
        <SkeletonCard
          v-if="pending"
          :items="3"
          containerclass="md:grid-cols-3"
        />
        <div class="mt-8">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4"
          >
            <div class="flex items-center gap-6">
              <h2 class="text-xl font-bold">
                {{ $t("base.setPermissions") }}
              </h2>
              <UCheckbox
                :model-value="selectAllState"
                @update:model-value="toggleSelectAll"
                :label="$t('base.selectAll')"
                :disabled="!permissions || permissions.length === 0"
                size="lg"
              />
            </div>

            <UInput
              v-model="searchQuery"
              icon="lucide:search"
              :placeholder="$t('base.searchModuleOrPermission')"
              class="w-full sm:w-72"
              clearable
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard
              v-for="group in groupedPermissions"
              :key="group.module"
              :ui="{
                header: 'p-4 sm:px-6 py-3',
                body: 'p-4 sm:p-6',
              }"
            >
              <template #header>
                <div class="font-semibold text-lg capitalize text-primary">
                  {{ group.module.replace("_", " ") }}
                </div>
              </template>

              <div class="space-y-3">
                <UCheckbox
                  v-for="perm in group.items"
                  :key="perm.id"
                  :model-value="
                    state.selectdPermissions?.includes(perm.id) || false
                  "
                  @update:model-value="
                    (val) => togglePermission(perm.id, val === true)
                  "
                  :label="perm.code"
                  :description="perm.description"
                  size="lg"
                />
              </div>
            </UCard>
          </div>
        </div>
        <UEmpty
          v-if="!pending && state.selectdPermissions.length === 0"
          :title="$t('permissionNotFound')"
          icon="lucide:user-key"
          variant="soft"
        />
      </template>
    </BaseForm>
  </BaseDashboardPanel>
</template>
