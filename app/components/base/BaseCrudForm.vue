<script setup lang="ts" generic="T">
import type { FormSubmitEvent } from "@nuxt/ui";
import z, { ZodType } from "zod";
import type { ICrudAction } from "~/types/common";
import type { RBACProps } from "~/types/props";

const {
  crudName,
  editPermission,
  addPermission,
  deletePermission,
  byPassPermission = false,
  listPermission,
  loading = false,
  showBack = true,
  showActionText = true,
  editButton = true,
  deleteButton = true,
  canSubmit = true,
  copyButton = false,
  crudAction,
  zodSchema,
} = defineProps<{
  crudName?: string;
  listPermission?: RBACProps;
  addPermission?: RBACProps;
  editPermission?: RBACProps;
  deletePermission?: RBACProps;
  byPassPermission?: boolean;
  title?: string;
  description?: string;
  icon?: string;
  loading?: boolean;
  showBack?: boolean;
  showDelete?: boolean;
  showEdit?: boolean;
  crudAction?: ICrudAction;
  showActionText?: boolean;
  editButton?: boolean;
  deleteButton?: boolean;
  copyButton?: boolean;
  canSubmit?: boolean;
  crudEntity?: T;
  zodSchema?: ZodType<any, any, any>;
}>();
const emit = defineEmits<{
  "on-back": [];
  "on-submit": [];
  "on-delete": [];
  "on-edit-enable": [];
}>();

const { t } = useLang();
const { hasPermission } = useRbac();

type Schema = z.output<typeof zodSchema>;
const state = defineModel<Partial<Schema>>();

const isHaveListPermission = computed(() => {
  if (byPassPermission) {
    return true;
  }
  return listPermission &&
    listPermission?.permissions &&
    listPermission?.permissions.length > 0
    ? hasPermission(listPermission)
    : crudName
      ? hasPermission({ permissions: [`${pascalToSnake(crudName)}_list`] })
      : true;
});
const isHaveEditPermission = computed(() => {
  if (byPassPermission) {
    return true;
  }
  return editPermission &&
    editPermission?.permissions &&
    editPermission?.permissions.length > 0
    ? hasPermission(editPermission)
    : crudName
      ? hasPermission({ permissions: [`${pascalToSnake(crudName)}_edit`] })
      : true;
});
const isHaveAddPermission = computed(() => {
  if (byPassPermission) {
    return true;
  }
  return addPermission &&
    addPermission?.permissions &&
    addPermission?.permissions.length > 0
    ? hasPermission(addPermission)
    : crudName
      ? hasPermission({ permissions: [`${pascalToSnake(crudName)}_add`] })
      : true;
});
const isHaveDeletePermission = computed(() => {
  if (byPassPermission) {
    return true;
  }
  return deletePermission &&
    deletePermission?.permissions &&
    deletePermission?.permissions.length > 0
    ? hasPermission(deletePermission)
    : crudName
      ? hasPermission({ permissions: [`${pascalToSnake(crudName)}_delete`] })
      : true;
});

const getBaseZodType = (zodType: any): any => {
  let current = zodType;

  // รองรับทั้ง _def (Zod มาตรฐาน) และ def (จากภาพใน Console)
  while (current && (current._def || current.def)) {
    const def = current._def || current.def;
    const typeName = def.typeName || current.type;

    if (
      typeName === "ZodOptional" ||
      typeName === "optional" ||
      typeName === "ZodNullable" ||
      typeName === "nullable"
    ) {
      current = current.unwrap ? current.unwrap() : current;
    } else if (typeName === "ZodDefault" || typeName === "default") {
      current = current.removeDefault ? current.removeDefault() : current;
    } else if (typeName === "ZodEffects" || typeName === "effects") {
      current = def.schema || current.innerType?.() || current;
    } else if (typeName === "ZodPipeline" || typeName === "pipeline") {
      current = def.in || current;
    } else {
      break;
    }
  }
  return current;
};
const autoFields = computed(() => {
  if (!zodSchema) return [];

  const baseSchema = getBaseZodType(zodSchema);
  const def = baseSchema?._def || baseSchema?.def;

  // เช็คจาก type: 'object' (อิงจากภาพ console) หรือ typeName: 'ZodObject'
  const isObject =
    baseSchema?.type === "object" || def?.typeName === "ZodObject";

  if (!isObject) {
    console.warn(
      "BaseCrudForm: zodSchema is not an object after unwrapping",
      baseSchema,
    );
    return [];
  }

  // ดึง shape ออกมา (อิงจากภาพ: baseSchema.def.shape)
  const shape = baseSchema.shape || def?.shape;

  if (!shape) return [];

  return Object.keys(shape).map((key) => {
    const rawType = shape[key];
    const rawDef = rawType?._def || rawType?.def;
    const baseFieldType = getBaseZodType(rawType);
    const fieldDef = baseFieldType?._def || baseFieldType?.def;
    const typeName = fieldDef?.typeName || baseFieldType?.type;

    // 1. ดึง description ออกมาจาก Zod
    const fieldDescription =
      rawDef?.description ||
      rawType?.description ||
      fieldDef?.description ||
      baseFieldType?.description;

    // 2. แปลง String กลับเป็น LabelValue Object
    let uiConfig: Record<string, any> = {};
    if (fieldDescription) {
      try {
        uiConfig = JSON.parse(fieldDescription);
      } catch (e) {
        // Fallback: ถ้าเผลอใส่ .describe("textarea") มาตรงๆ ก็ยังรองรับอยู่
        uiConfig = {
          type: fieldDescription === "textarea" ? "textarea" : "input",
          description: fieldDescription,
        };
      }
    }

    // 3. ใช้ Type จาก LabelValue ก่อน ถ้าไม่มีค่อยคำนวณจาก Zod
    let componentType = uiConfig?.type || "input";
    let inputType = "text";

    if (!uiConfig?.type) {
      if (typeName === "ZodNumber" || typeName === "number") {
        inputType = "number";
      } else if (typeName === "ZodBoolean" || typeName === "boolean") {
        componentType = "checkbox";
      } else if (
        typeName === "ZodEnum" ||
        typeName === "enum" ||
        typeName === "ZodNativeEnum" ||
        typeName === "nativeEnum"
      ) {
        componentType = "select";
      }
    } else {
      if (["password", "email", "number", "text"].includes(uiConfig.type)) {
        componentType = "input";
        inputType = uiConfig.type;
      }
    }

    // 4. จัดการ Options สำหรับ Select
    let options: any[] = [];
    if (componentType === "select") {
      if (uiConfig?.children && uiConfig.children.length > 0) {
        options = uiConfig.children; // ใช้ options ที่แนบมา
      } else {
        // ใช้ options จาก Zod ถ้าไม่ได้แนบมา
        const rawValues =
          baseFieldType?.options ||
          fieldDef?.values ||
          baseFieldType?.values ||
          [];
        options = rawValues.map((val: string) => ({
          label: val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
          value: val,
        }));
      }
    }

    // 5. จัดการ Label
    const defaultLabel = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    const label = uiConfig?.label || defaultLabel;

    return {
      name: key,
      label: label,
      componentType,
      inputType,
      options,

      // ดึงค่าอื่นๆ จาก LabelValue ออกมาให้หมดเพื่อส่งไป Template
      disable: uiConfig?.disable || false,
      required: uiConfig?.required || false,
      translateLabel: uiConfig?.translateLabel || false,
      description: uiConfig?.description,
      icon: uiConfig?.icon,
      color: uiConfig?.color,
      additionalValue: uiConfig?.additionalValue || {},
      onHandle: uiConfig?.onHandle,
    };
  });
});
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  console.log(event.data);
};

const onDelete = (event: any) => {
  emit("on-delete");
};
</script>
<template>
  <div :class="['w-full  mx-auto', $attrs.class]">
    <UCard :ui="{ header: 'p-2' }">
      <template #header>
        <slot name="header">
          <div class="flex flex-col">
            <BaseItem :separator="false">
              <template v-if="icon" #start>
                <!-- <UAvatar :icon="icon" /> -->
                <UButton
                  v-if="showBack && isHaveListPermission"
                  variant="ghost"
                  icon="lucide:arrow-left"
                  class="rounded-full"
                  @click="emit('on-back')"
                />
              </template>
              <div class="flex gap-2">
                <div v-if="title" class="text-xl font-bold">
                  {{ title }}
                  <template v-if="crudAction && showActionText">
                    {{
                      crudAction === "new"
                        ? t("base.addNew")
                        : crudAction === "copy"
                          ? t("base.copy")
                          : crudAction === "edit"
                            ? t("base.edit")
                            : ""
                    }}
                  </template>
                </div>
              </div>
              <div v-if="description" class="text-sm text-muted">
                {{ description }}
              </div>
            </BaseItem>
          </div>
        </slot>
      </template>
      <UForm
        :schema="zodSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <slot name="prepend-fields" />

        <!-- ลูป Render ฟิลด์อัตโนมัติ -->
        <template v-for="field in autoFields" :key="field.name">
          <!-- ใช้ Dynamic Slot เปิดโอกาสให้ Parent Override ฟิลด์ที่ต้องการ Custom ได้ -->

          {{ field }}
          <slot :name="`field-${field.name}`" :field="field">
            <UFormField
              v-if="state"
              orientation="vertical"
              :required="field.required"
              :label="field.label"
              :name="field.name"
              :help="field.description"
              class="w-full"
            >
              <!-- Component: Input (Text, Number) -->
              <UInput
                v-if="field.componentType === 'input'"
                v-model="state[field.name]"
                :type="field.inputType"
                :placeholder="field.additionalValue?.placeholder"
                :color="field.color"
                :variant="field.additionalValue?.variant"
                :icon="field.icon ? field.icon.name : undefined"
                class="w-full"
              />

              <UTextarea
                v-else-if="field.componentType === 'textarea'"
                v-model="state[field.name]"
                :rows="4"
                autoresize
                 :placeholder="field.additionalValue?.placeholder"
                  :variant="field.additionalValue?.variant"
                class="w-full"
              />

              <!-- Component: Checkbox / Toggle (Boolean) -->
              <UCheckbox
                v-else-if="field.componentType === 'checkbox'"
                v-model="state[field.name]"
                :label="`Enable ${field.label}`"
              />

              <!-- Component: Select (Enum) -->
              <USelect
                v-else-if="field.componentType === 'select'"
                v-model="state[field.name]"
                :items="field.options"
                 :variant="field.additionalValue?.variant"
                class="min-w-[25%]"
              />
            </UFormField>
          </slot>
        </template>
        <slot />

        <div class="flex justify-center gap-2">
          <slot name="crud-action">
            <UButton
              v-if="isHaveAddPermission || isHaveEditPermission"
              icon="lucide:save"
              :label="
                crudAction == 'edit' ||
                crudAction == 'new' ||
                crudAction == 'copy'
                  ? $t('base.save')
                  : undefined
              "
              color="primary"
              type="submit"
            >
            </UButton>
            <UButton
              v-if="crudAction == 'edit' && isHaveDeletePermission"
              icon="lucide:trash"
              :label="$t('base.delete')"
              color="error"
              @@click.prevent="onDelete"
            >
            </UButton>
          </slot>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
