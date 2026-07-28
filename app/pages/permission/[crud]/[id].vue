<script setup lang="ts">
import z from "zod";
import type { LabelValue } from "~/types/common";
import type { Permission } from "~/types/models";

definePageMeta({
  pageName: "model_permission",
  requiresPermission: ["permission_view", "permission_add", "permission_edit"],
});

const ui = (config: LabelValue<any>) => JSON.stringify(config);
const { t } = useLang();
const schema = z.object({
  code: z
    .string()
    .min(1, t("error.validateRequireField"))
    .describe(
      ui({
        label: t("model_permission_name"),
        description: "This is help text for Permission code",
        icon: "lucide:key",
        trailingIcon: "lucide:file-headphone",
        ui: {
          type: "text",
          required: true,
          clearable: true,
          maxlength: 125,
        },
      }),
    ),
  module: z
    .any()
    .describe(
      ui({
        label: "Module",
        ui: {
          type: "text",
        },
      }),
    )
    .optional(),
  description: z
    .string()
    .describe(
      ui({
        label: t("model_permission_description"),
        ui: {
          type: "textarea",
          maxlength: 125,
          clearable: true,
          separator: true,
        },
      }),
    )
    .optional(),
  operationType: z
    .enum(["CRUD", "REPORT", "OTHER", "FEATURE"])
    .describe(
      ui({
        label: "Permission type",
        icon: "lucide:settings",
        ui: {
          type: "select",
        },
        children: [
          { label: "เพิ่ม/ลบ/แก้ไข", value: "CRUD" },
          { label: "รายงาน", value: "REPORT" },
          { label: "อื่นๆ", value: "OTHER" },
          { label: "ฟีเจอร์", value: "FEATURE" },
        ],
      }),
    )
    .optional(),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  code: "",
  description: "",
  module: "",
  operationType: "CRUD",
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
} = useCrudForm<Permission>(
  {
    crudName: "Permission",
  },
  state,
);
</script>
<template>
  <BaseDashboardPanel
    id="permission-crud-index"
    :title="$t('model_permission')"
  >
    <BaseForm
      :zod-schema="schema"
      v-model="state"
      :edit-mode="isEditMode"
      :crud-action="crudAction"
      :loading="loading"
      :crud-name="crudName"
      icon="lucide:shield-cog-corner"
      :title="$t('model_permission')"
      description="Permission management"
      orientation="horizontal"
      class="max-w-[1020px]"
      @on-back="onBack"
      @on-edit-enable="onEnableEditForm"
      @on-submit="onSubmit"
      @on-delete="onDelete"
    >
    </BaseForm>
  </BaseDashboardPanel>
</template>
