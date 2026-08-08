<script setup lang="ts">
import z from "zod";
import type { Permission } from "~/types/models";

useSeoMeta({
  title: "Form page",
});

const { t } = useLang();
const schema = z.object({
  text: z
    .string()
    .min(1, t("error.validateRequireField"))
    .describe(
      uiConfig({
        label: "Text",
        description: "This is help text for Permission code",
        icon: "lucide:key",
        trailingIcon: "lucide:search",
        color: "warning",
        ui: {
          type: "text",
          required: true,
          placeholder: "Enter code...",
          size: "xl",
          clearable: true,
          maxlength: 50,
        },
      }),
    ),
  text2: z
    .any()
    .describe(
      uiConfig({
        label: "Text",
        ui: {
          type: "text",
        },
      }),
    )
    .optional(),
  textarea: z
    .string()
    .describe(
      uiConfig({
        label: "Textarea",
        avatar: {
          src: "https://github.com/nuxt.png",
          loading: "lazy",
        },
        ui: {
          type: "textarea",
          maxlength: 500,
          clearable: true,
          separator: true,
        },
      }),
    )
    .optional(),
  date: z
    .string()
    .describe(
      uiConfig({
        label: "Date",
        ui: {
          type: "date",
          numberOfMonths: 2,
        },
      }),
    )
    .optional(),
  dateRange: z
    .object({
      start: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: t("error.validateDate") }),
      end: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: t("error.validateDate") }),
    })
    .describe(
      uiConfig({
        label: "Date range",
        ui: {
          type: "date-range",
          numberOfMonths: 2,
        },
      }),
    )
    .optional(),
  inputfile: z
    .array(z.any())
    .describe(
      uiConfig({
        label: "Input file",
        description: "This is help text for input file",
        ui: {
          type: "file",
          layout: "list",
          multiple: true,
          max: 5,
        },
      }),
    )
    .optional(),
  enum: z
    .enum(["CRUD", "REPORT", "OTHER", "FEATURE"])
    .describe(
      uiConfig({
        label: "Enum",
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
  enable: z
    .boolean()
    .describe(
      uiConfig({
        description: "Enable permission",
        label: "Switch",
        icon: "lucide:toggle-right",
        ui: {
          type: "switch",
          required: true,
        },
      }),
    )
    .optional(),
  checkbox: z
    .boolean()
    .describe(
      uiConfig({
        description: "Checkbox",
        label: "Checkbox",
        ui: {
          type: "checkbox",
          required: true,
        },
      }),
    )
    .optional(),
  number: z
    .number()
    .describe(
      uiConfig({
        label: "Number step",
        ui: {
          type: "number-step",
          step: 1,
          min: 1,
          max: 10,
          required: true,
        },
      }),
    )
    .optional(),
  inputMenu: z
    .any()
    .describe(
      uiConfig({
        label: "Input Menu",
        ui: {
          type: "input-menu",
          // type: "checkbox-group",
        },
        icon: "lucide:brush",
        children: [
          {
            label: "System",
            description: "This is the first option.",
            value: "system",
            icon: "i-lucide-laptop",
          },
          {
            label: "Light",
            description: "This is the second option.",
            value: "light",
            icon: "i-lucide-sun",
          },
          {
            label: "Dark",
            description: "This is the third option.",
            value: "dark",
            icon: "i-lucide-moon",
          },
        ],
      }),
    )
    .optional(),
  checkgroups: z
    .array(z.string())
    .describe(
      uiConfig({
        label: "Checkbox group",
        ui: {
          type: "checkbox-group",
          separator: true,
        },
        children: [
          {
            label: "System",
            description: "This is the first option.",
            value: "system",
          },
          {
            label: "Light",
            description: "This is the second option.",
            value: "light",
          },
          {
            label: "Dark",
            description: "This is the third option.",
            value: "dark",
          },
        ],
      }),
    )
    .optional(),
  radiogroups: z
    .string()
    .describe(
      uiConfig({
        label: "Radio group",
        ui: {
          type: "radio-group",
          variant: "list",
          orientation: "horizontal",
        },
        children: [
          {
            label: "System",
            description: "This is the first option.",
            value: "system",
          },
          {
            label: "Light",
            description: "This is the second option.",
            value: "light",
          },
          {
            label: "Dark",
            description: "This is the third option.",
            value: "dark",
          },
        ],
      }),
    )
    .optional(),
  tags: z
    .array(z.string())
    .describe(
      uiConfig({
        label: "Input Tags",
        ui: {
          type: "input-tags",
        },
      }),
    )
    .optional(),
  pins: z
    .array(z.number())
    .describe(
      uiConfig({
        label: "Input Pins",
        ui: {
          type: "input-pin",
          placeholder: "*",
          max: 7,
          separatorLength: [3, 4],
        },
      }),
    )
    .optional(),
  slider: z
    .number()
    .describe(
      uiConfig({
        label: "Slider",
        ui: {
          type: "slider",
          orientation: "vertical",
          class: "h-38",
          min: 0,
          max: 100,
          step: 10,
          tooltip: true,
        },
      }),
    )
    .optional(),
  sliders: z
    .array(z.number())
    .describe(
      uiConfig({
        label: "Multiple Slider",
        ui: {
          type: "slider",
          min: 0,
          max: 100,
          step: 10,
          tooltip: true,
          separator: true,
        },
      }),
    )
    .optional(),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  text: "test",
  textarea: "test",
  text2: "test",
  inputMenu: "system",
  enum: "CRUD",
  enable: true,
  checkbox: false,
  radiogroups: "system",
  checkgroups: ["system"],
  tags: ["vue"],
  pins: [1, 2, 3, 4, 5, 6, 7],
  slider: 0,
  sliders: [25, 75],
  inputfile: [],
  number: 999,
  date: "2026-01-01",
  dateRange: {
    start: "2026-01-01",
    end: "2026-01-02",
  },
});

const {
  crudAction,
  loading,
  crudName,
  isEditMode,
  onDelete,
  onBack,
  onEnableEditForm,
  onSubmit: onSubmitBase,
} = useCrudForm<Permission>(
  {
    crudName: "Permission",
    preValidate: false,
  },
  state,
);

const onSubmit = () => {
  console.log("onSubmit", state.value);
};

const orientation = ref<"horizontal" | "vertical">("horizontal");
</script>
<template>
  <BaseDashboardPanel id="example-form" title="Form page">
    <BaseForm
      :zod-schema="schema"
      v-model="state"
      by-pass-permission
      :show-back="false"
      :edit-mode="true"
      :crud-action="crudAction"
      :loading="loading"
      :crud-name="crudName"
      icon="lucide:shield-cog-corner"
      title="Form"
      description="Form management and auto generate input form"
      :orientation="orientation || 'horizontal'"
      class="max-w-[1020px]"
      @on-back="onBack"
      @on-edit-enable="onEnableEditForm"
      @on-submit="onSubmit"
      @on-delete="onDelete"
    >
      <template #header-end>
        <URadioGroup
          v-model="orientation"
          :items="['horizontal', 'vertical']"
          orientation="horizontal"
        />
      </template>

      <!-- you can override prepend fields here -->
      <!-- <template #prepend-fields> </template> -->

      <!-- you can override form fields here auto generate slot by field-${z.object.id} -->
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

      <!-- you can override auto-fields here -->
      <!-- <template #auto-fields> </template> -->
    </BaseForm>
  </BaseDashboardPanel>
</template>
