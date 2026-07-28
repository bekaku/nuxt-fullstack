<script setup lang="ts">
import z from "zod";
import type { LabelValue } from "~/types/common";
import type { Permission } from "~/types/models";

definePageMeta({
  pageName: "model_permission",
  requiresPermission: ["permission_view", "permission_add", "permission_edit"],
});

const ui = (config: LabelValue<any>) => JSON.stringify(config);

const schema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .describe(
      ui({
        label: "permission_code",
        description: "This is help text for Permission code",
        icon: { name: "lucide:key" },
        required: true,
        additionalValue: { placeholder: "Enter code...", variant:'subtle' },
      }),
    ),
  description: z
    .string()
    .describe(
      ui({
        label: "Description",
        icon: { name: "lucide:pencil" },
      }),
    )
    .optional(),
  operationType: z
    .enum(["CRUD", "REPORT", "OTHER", "FEATURE"])
    .describe(
      ui({
        label: "Operation Type",
        type: "select",
      }),
    )
    .optional(),
});
type Schema = z.output<typeof schema>;
const state = reactive<Partial<Schema>>({
  code: "",
  description: "",
  operationType: undefined,
});
const entity: Permission = Object.freeze<Permission>({
  id: null,
  code: "",
  description: null,
  operationType: "CRUD",
});
const {
  crudAction,
  loading,
  crudEntity,
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
  entity,
);
</script>
<template>
  <BaseDashboardPanel
    id="permission-crud-index"
    :title="$t('model_permission')"
  >
    <BaseCrudForm
      :zod-schema="schema"
      v-model="state"
      :crud-action="crudAction"
      :loading="loading"
      :crud-entity="crudEntity"
      :crud-name="crudName"
      icon="lucide:shield-cog-corner"
      :title="$t('model_permission')"
      description="Permission management"
      class="max-w-[720px]"
      @on-back="onBack"
      @on-edit-enable="onEnableEditForm"
      @on-submit="onSubmit"
      @on-delete="onDelete"
    >
      <!-- <UFormField label="Code" name="code">
        <UInput v-model="state.code" />
      </UFormField>

      <UFormField label="Description" name="description">
        <UInput v-model="state.description" type="description" />
      </UFormField> -->

      <!-- <template #field-code>
        <UFormField label="Password" name="code" class="w-full">
          Override code
        </UFormField>
      </template>
      <template #field-description>
        <UFormField label="Password" name="description" class="w-full">
          Override description
        </UFormField>
      </template>
      <template #field-operationType>
        <UFormField label="Password" name="operationType" class="w-full">
          Override operationType
        </UFormField>
      </template> -->
    </BaseCrudForm>
  </BaseDashboardPanel>
</template>
