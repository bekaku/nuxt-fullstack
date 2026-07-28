<script setup lang="ts" generic="T">
import { UAvatar, UChip, UIcon, USeparator } from "#components";
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
  editMode = true,
  crudAction,
  zodSchema,
  orientation = "horizontal",
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
  editMode?: boolean;
  deleteButton?: boolean;
  copyButton?: boolean;
  canSubmit?: boolean;
  crudEntity?: T;
  zodSchema?: ZodType<any, any, any>;
  orientation?: "horizontal" | "vertical";
}>();
const emit = defineEmits<{
  "on-back": [];
  "on-submit": [];
  "on-delete": [];
  "on-edit-enable": [];
  "on-item-click": [type: ICrudAction];
}>();

const { t } = useLang();
const { hasPermission } = useRbac();

type Schema = z.output<typeof zodSchema>;
const state = defineModel<Partial<Schema>>();
const { isMobile } = useAppDevice();
const confirm = useConfirmDialog();
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

    const uiProps = uiConfig?.ui || {};
    const specifiedType = uiProps.type || uiConfig?.type;

    // 2. กำหนดค่าเริ่มต้น
    let componentType = "input";
    let inputType = "text";

    // 3. จัดการ Type ตามที่กำหนดมา (ถ้ามี)
    if (specifiedType) {
      if (
        ["text", "date", "password", "email", "number", "search"].includes(
          specifiedType,
        )
      ) {
        componentType = "input";
        inputType = specifiedType; // เอาค่า 'text' | 'date' | 'password' | 'email' | 'number' ไปใส่เลย
      } else if (specifiedType === "textarea") {
        componentType = "textarea";
      } else if (specifiedType === "select") {
        componentType = "select";
      } else if (specifiedType === "checkbox") {
        componentType = "checkbox";
      } else if (specifiedType === "switch") {
        componentType = "switch";
      } else if (specifiedType === "checkbox-group") {
        componentType = "checkbox-group";
      } else if (specifiedType === "radio-group") {
        componentType = "radio-group";
      } else if (specifiedType === "input-menu") {
        componentType = "input-menu";
      } else if (specifiedType === "number-step") {
        componentType = "number-step";
      } else if (specifiedType === "input-tags") {
        componentType = "input-tags";
      } else if (specifiedType === "input-pin") {
        componentType = "input-pin";
      } else if (specifiedType === "slider") {
        componentType = "slider";
      } else if (specifiedType === "file") {
        componentType = "file";
      }
    }
    // 4. ถ้าไม่มีการกำหนด ui.type มา ให้ใช้ความฉลาดของ Zod ในการเดา Type
    else {
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
    }

    // 4. จัดการ Options สำหรับ Select
    let options: any[] = [];
    if (
      componentType === "select" ||
      componentType === "checkbox-group" ||
      componentType === "radio-group" ||
      componentType === "input-menu"
    ) {
      if (uiConfig?.children && uiConfig.children.length > 0) {
        options = uiConfig.children; // ใช้ options ที่แนบมา
      } else {
        // ใช้ options จาก Zod ถ้าไม่ได้แนบมา
        const rawValues =
          baseFieldType?.options ||
          fieldDef?.values ||
          baseFieldType?.values ||
          [];
        options = rawValues;
        // options = rawValues.map((val: string) => ({
        //   label: val.charAt(0).toUpperCase() + val.slice(1).toLowerCase(),
        //   value: val,
        // }));
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
      avatar: uiConfig?.avatar,
      icon: uiConfig?.icon,
      trailingIcon: uiConfig?.trailingIcon,
      color: uiConfig?.color,
      ui: uiProps || {},
      onHandle: uiConfig?.onHandle,
    };
  });
});
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  console.log(event.data);
};

const onEditBtnClick = (type: ICrudAction) => {
  emit("on-item-click", type);
};
const onDelete = async (event: any) => {
  const conf = await confirm({
    title: t("base.deleteCountConfirm", { count: 1 }),
    description: t("base.deleteConfirmHelp"),
    confirmButton: {
      label: t("base.delete"),
      color: "error",
      icon: "lucide:trash",
    },
  });
  if (conf) {
    emit("on-delete");
  }
};
</script>
<template>
  <div :class="['w-full  mx-auto', $attrs.class]">
    <UCard :ui="{ header: 'p-2' }">
      <template #header>
        <slot name="header">
          <div class="flex flex-col">
            <BaseItem :separator="false">
              <template #start>
                <slot name="heder-start">
                  <!-- <UAvatar v-if="icon" :icon="icon" /> -->
                  <UButton
                    v-if="showBack && isHaveListPermission"
                    variant="ghost"
                    icon="lucide:arrow-left"
                    class="rounded-full"
                    @click="emit('on-back')"
                  />
                </slot>
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
              <template #end>
                <slot name="header-end" />
              </template>
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

        <slot name="auto-fields">
          <!-- Automatic field rendering loop -->
          <template v-for="field in autoFields" :key="field.name">
            <!-- Use Dynamic Slot to allow Parent Override fields that need customization -->

            <slot :name="`field-${field.name}`" :field="field">
              <UFormField
                v-if="state"
                :orientation="isMobile ? 'vertical' : orientation"
                :required="field?.ui?.required"
                :label="field.label"
                :name="field.name"
                :help="field.description"
                class="w-full"
                :ui="{
                  // บังคับให้ Label กว้างประมาณ 1 ใน 3 และ Input กินพื้นที่ที่เหลือทั้งหมด
                  labelWrapper:
                    orientation === 'horizontal' ? 'w-48 shrink-0' : '',
                  container:
                    orientation === 'horizontal' ? 'flex-1 w-full' : '',
                }"
              >
                <!-- Component: Input (Text, Number) -->
                <template v-if="field.componentType === 'input'">
                  <UInput
                    v-if="editMode"
                    v-model="state[field.name]"
                    :loading="loading"
                    :type="field.inputType"
                    :placeholder="field.ui?.placeholder"
                    :color="field.color"
                    :variant="field.ui?.variant"
                    :maxlength="field.ui?.maxlength"
                    :readonly="field.ui?.readonly"
                    :disabled="field.disable"
                    :icon="field.icon || undefined"
                    :trailing-icon="field.trailingIcon || undefined"
                    :avatar="field.avatar ? { ...field.avatar } : undefined"
                    :size="field.ui?.size"
                    :class="['w-full', field.ui?.class || '']"
                  >
                    <template #trailing>
                      <div
                        v-if="field.ui?.maxlength && field.ui?.maxlength > 0"
                        id="character-count"
                        class="text-xs text-muted tabular-nums"
                        aria-live="polite"
                        role="status"
                      >
                        {{ state[field.name]?.length }}/{{
                          field.ui?.maxlength
                        }}
                      </div>
                      <UButton
                        v-if="
                          field.ui?.clearable === true &&
                          state[field.name]?.length
                        "
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-lucide-circle-x"
                        aria-label="Clear input"
                        @click="state[field.name] = ''"
                      />
                    </template>
                  </UInput>
                  <BaseItem v-else :separator="false">
                    <template v-if="field.icon || field.avatar" #start>
                      <UAvatar v-if="field.avatar" v-bind="field.avatar" />
                      <UIcon v-else-if="field.icon" :name="field.icon" />
                    </template>
                    <div class="flex flex-col">
                      <div v-if="state[field.name]">
                        {{ state[field.name] }}
                      </div>
                    </div>

                    <template v-if="field.trailingIcon" #end>
                      <UIcon :name="field.trailingIcon" />
                    </template>
                  </BaseItem>
                </template>
                <template v-if="field.componentType === 'number-step'">
                  <UInputNumber
                    v-if="editMode"
                    v-model="state[field.name]"
                    :loading="loading"
                    :placeholder="field.ui?.placeholder"
                    :color="field.color"
                    :variant="field.ui?.variant"
                    :maxlength="field.ui?.maxlength"
                    :readonly="field.ui?.readonly"
                    :disabled="field.disable"
                    :size="field.ui?.size"
                    :min="field.ui?.min"
                    :max="field.ui?.max"
                    :step="field.ui?.step || 1"
                    :orientation="field.ui?.orientation || 'horizontal'"
                    :class="[field.ui?.class || '']"
                  >
                  </UInputNumber>
                  <BaseItem v-else :separator="false">
                    <template v-if="field.icon || field.avatar" #start>
                      <UAvatar v-if="field.avatar" v-bind="field.avatar" />
                      <UIcon v-else-if="field.icon" :name="field.icon" />
                    </template>
                    <div class="flex flex-col">
                      <div v-if="state[field.name]">
                        {{ state[field.name] }}
                      </div>
                    </div>

                    <template v-if="field.trailingIcon" #end>
                      <UIcon :name="field.trailingIcon" />
                    </template>
                  </BaseItem>
                </template>
                <template v-if="field.componentType === 'slider'">
                  <USlider
                    v-model="state[field.name]"
                    :loading="loading"
                    :color="field.color"
                    :disabled="field.ui?.disable || !editMode"
                    :size="field.ui?.size"
                    :min="field.ui?.min"
                    :max="field.ui?.max"
                    :step="field.ui?.step || 1"
                    :orientation="field.ui?.orientation || 'horizontal'"
                    :tooltip="field.ui?.tooltip"
                    :class="[field.ui?.class || '']"
                  >
                  </USlider>
                </template>
                <template v-if="field.componentType === 'input-tags'">
                  <UInputTags
                    v-if="editMode"
                    v-model="state[field.name]"
                    :loading="loading"
                    :placeholder="field.ui?.placeholder"
                    :color="field.color"
                    :variant="field.ui?.variant"
                    :readonly="field.ui?.readonly"
                    :disabled="field.disable"
                    :size="field.ui?.size"
                    :icon="field.icon || undefined"
                    :trailing-icon="field.trailingIcon || undefined"
                    :avatar="field.avatar ? { ...field.avatar } : undefined"
                    :max-length="field.ui?.maxlength"
                    :max="field.ui?.max"
                    :class="[field.ui?.class || '']"
                  />
                  <BaseItem v-else :separator="false">
                    <template v-if="field.icon || field.avatar" #start>
                      <UAvatar v-if="field.avatar" v-bind="field.avatar" />
                      <UIcon v-else-if="field.icon" :name="field.icon" />
                    </template>
                    <div class="flex flex-col">
                      <div v-if="state[field.name]" class="flex gap-2">
                        <UBadge v-for="item in state[field.name]" :key="item">
                          {{ item }}
                        </UBadge>
                      </div>
                    </div>

                    <template v-if="field.trailingIcon" #end>
                      <UIcon :name="field.trailingIcon" />
                    </template>
                  </BaseItem>
                </template>
                <template v-if="field.componentType === 'input-pin'">
                  <UPinInput
                    v-model="state[field.name]"
                    :loading="loading"
                    :placeholder="field.ui?.placeholder"
                    :color="field.color"
                    :variant="field.ui?.variant"
                    :disabled="field.disable || !editMode"
                    :size="field.ui?.size"
                    :length="field.ui?.max"
                    :separator="field.ui?.separatorLength"
                    :class="[field.ui?.class || '']"
                  >
                  </UPinInput>
                </template>

                <template v-else-if="field.componentType === 'textarea'">
                  <UTextarea
                    v-if="editMode"
                    v-model="state[field.name]"
                    :loading="loading"
                    :rows="field.ui?.rows || 4"
                    :icon="field.icon || undefined"
                    :trailing-icon="field.trailingIcon || undefined"
                    autoresize
                    :readonly="field.ui?.readonly"
                    :disabled="field.disable"
                    :maxlength="field.ui?.maxlength"
                    :placeholder="field.ui?.placeholder"
                    :variant="field.ui?.variant"
                    :size="field.ui?.size"
                    :avatar="field.avatar ? { ...field.avatar } : undefined"
                    :class="['w-full', field.ui?.class || '']"
                  >
                    <template #trailing>
                      <div
                        v-if="field.ui?.maxlength && field.ui?.maxlength > 0"
                        id="character-count"
                        class="text-xs text-muted tabular-nums"
                        aria-live="polite"
                        role="status"
                      >
                        {{ state[field.name]?.length }}/{{
                          field.ui?.maxlength
                        }}
                      </div>
                      <UButton
                        v-if="
                          field.ui?.clearable === true &&
                          state[field.name]?.length
                        "
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-lucide-circle-x"
                        aria-label="Clear input"
                        @click="state[field.name] = ''"
                      />
                    </template>
                  </UTextarea>
                  <BaseItem v-else :separator="false">
                    <template v-if="field.icon || field.avatar" #start>
                      <UAvatar v-if="field.avatar" v-bind="field.avatar" />
                      <UIcon v-else-if="field.icon" :name="field.icon" />
                    </template>
                    <div class="flex flex-col">
                      <div v-if="state[field.name]">
                        {{ state[field.name] }}
                      </div>
                    </div>

                    <template v-if="field.trailingIcon" #end>
                      <UIcon :name="field.trailingIcon" />
                    </template>
                  </BaseItem>
                </template>

                <!-- Component: Checkbox / Toggle (Boolean) -->
                <template v-else-if="field.componentType === 'checkbox'">
                  <UCheckbox
                    v-model="state[field.name]"
                    :label="`${$t('base.enable')} (${field.label})`"
                    :size="field.ui?.size"
                    :disabled="field.disable || !editMode"
                    :color="field.color"
                    :variant="field.ui?.variant"
                    :loading="loading"
                    :class="[field.ui?.class || '']"
                  />
                </template>
                <template v-else-if="field.componentType === 'checkbox-group'">
                  <UCheckboxGroup
                    v-model="state[field.name]"
                    :label="`${$t('base.enable')} (${field.label})`"
                    :size="field.ui?.size"
                    :disabled="field.disable || !editMode"
                    :color="field.color"
                    :items="field.options"
                    :variant="field.ui?.variant"
                    :loading="loading"
                    :orientation="field.ui?.orientation"
                    :class="[field.ui?.class || '']"
                  />
                </template>
                <template v-else-if="field.componentType === 'radio-group'">
                  <URadioGroup
                    v-model="state[field.name]"
                    :label="field.label"
                    :size="field.ui?.size"
                    :disabled="field.disable || !editMode"
                    :color="field.color"
                    :items="field.options"
                    :variant="field.ui?.variant"
                    :loading="loading"
                    :orientation="field.ui?.orientation"
                    :class="[field.ui?.class || '']"
                  />
                </template>
                <template v-else-if="field.componentType === 'switch'">
                  <USwitch
                    v-model="state[field.name]"
                    unchecked-icon="i-lucide-x"
                    checked-icon="i-lucide-check"
                    :legend="$t('base.enable')"
                    :size="field.ui?.size"
                    :disabled="field.disable || !editMode"
                    :color="field.color"
                    :variant="field.ui?.variant"
                    :loading="loading"
                    :class="[field.ui?.class || '']"
                  />
                </template>
                <!-- Component: Select (Enum) -->
                <template v-else-if="field.componentType === 'input-menu'">
                  <UInputMenu
                    v-model="state[field.name]"
                    :label="`${$t('base.enable')} (${field.label})`"
                    :size="field.ui?.size"
                    :disabled="field.disable || !editMode"
                    :color="field.color"
                    :items="field.options"
                    value-key="value"
                    :variant="field.ui?.variant"
                    :icon="field.icon || undefined"
                    :trailing-icon="field.trailingIcon || undefined"
                    :multiple="field.ui?.multiple"
                    :avatar="field.avatar ? { ...field.avatar } : undefined"
                    :loading="loading"
                    :placeholder="field.ui?.placeholder"
                    mode="combobox"
                    :content="{ hideWhenEmpty: true }"
                    :class="[field.ui?.class || '']"
                  />
                </template>

                <template v-else-if="field.componentType === 'select'">
                  <USelect
                    v-model="state[field.name]"
                    :loading="loading"
                    :items="field.options"
                    :icon="field.icon || undefined"
                    :trailing-icon="field.trailingIcon || undefined"
                    :disabled="field.disable || !editMode"
                    :avatar="field.avatar ? { ...field.avatar } : undefined"
                    :variant="field.ui?.variant"
                    :multiple="field.ui?.multiple"
                    :size="field.ui?.size"
                    :color="field.color"
                    :placeholder="field.ui?.placeholder"
                    :class="['min-w-[25%]', field.ui?.class || '']"
                  />
                </template>
                <template v-else-if="field.componentType === 'file'">
                  <LazyBaseFileUpload
                    v-if="editMode"
                    :description="field?.description"
                    :multiple="field.ui?.multiple"
                    :max-files="field.ui?.max"
                    :disabled="field.disable || !editMode"
                    :icon="field.icon || 'lucide:paperclip'"
                    v-model="state[field.name]"
                    :show-progress="false"
                    :priview-layout="field.ui?.layout || 'list'"
                    :class="[field.ui?.class || '']"
                  />
                  <div v-else>File Items Preview here</div>
                </template>
              </UFormField>
            </slot>

            <USeparator v-if="field.ui?.separator === true" />
          </template>
        </slot>
        <slot />

        <div class="flex flex-col gap-4 mt-4">
          <slot name="crud-action">
            <USeparator class="mt-4" type="dashed" />
            <div class="flex justify-center gap-4">
              <template v-if="isHaveAddPermission || isHaveEditPermission">
                <UButton
                  v-if="crudAction === 'view'"
                  icon="lucide:pencil"
                  :label="$t('base.edit')"
                  @click.prevent="$emit('on-edit-enable')"
                >
                </UButton>
                <UButton
                  v-else
                  icon="lucide:save"
                  :label="
                    crudAction == 'edit' ||
                    crudAction == 'new' ||
                    crudAction == 'copy'
                      ? $t('base.save')
                      : $t('base.okay')
                  "
                  color="primary"
                  type="submit"
                >
                </UButton>
              </template>
              <UButton
                v-if="
                  deleteButton && crudAction == 'edit' && isHaveDeletePermission
                "
                icon="lucide:trash"
                :label="$t('base.delete')"
                color="error"
                @click.prevent="onDelete"
              >
              </UButton>
            </div>
          </slot>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
