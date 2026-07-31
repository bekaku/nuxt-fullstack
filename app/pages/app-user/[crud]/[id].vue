<script setup lang="ts">
import z from "zod";
import type { LabelValue, ResponseEntity } from "~/types/common";
import type { AppRole, AppUser } from "~/types/models";

definePageMeta({
  pageName: "model_user",
  requiresPermission: ["app_user_view", "app_user_add", "app_user_edit"],
});

const { t } = useLang();
const { isMobile } = useAppDevice();
const { onUploadChunk } = useUpload();
const route = useRoute();
const isEditMode = route.params.crud === "edit";
const schemaBase = z.object({
  avatarFile: z
    .array(z.any())
    .describe(
      uiConfig({
        label: t("base.changeAvatar"),
        ui: {
          type: "file",
          layout: "list",
          multiple: false,
          max: 1,
          class: "w-110",
        },
      }),
    )
    .optional(),
  email: z
    .email(t("error.emailFormat"))
    .min(1, t("error.validateRequireField"))
    .describe(
      uiConfig({
        label: t("model_user_email"),
        icon: "lucide:mail",
        ui: {
          type: "text",
          required: true,
          clearable: true,
          maxlength: 100,
        },
      }),
    ),
  username: z
    .string()
    .min(4, { message: t("helper.username1") })
    .max(20, { message: t("helper.username1") })
    .regex(/^[a-zA-Z0-9]([._]?[a-zA-Z0-9]+)*$/, {
      message: `${t("helper.username2")}, ${t("helper.username3")}, ${t("helper.username4")}, ${t("helper.username5")}`,
    })
    .or(z.literal(""))
    .describe(
      uiConfig({
        label: t("model_user_username"),
        description: `${t("helper.username1")}, ${t("helper.username2")}, ${t("helper.username3")}, ${t("helper.username4")}, ${t("helper.username5")}`,
        icon: "lucide:user-pen",
        ui: {
          type: "text",
          clearable: true,
          maxlength: 20,
        },
      }),
    )
    .optional(),
  password: z
    .string()
    .min(8, t("error.requiredMinString", { count: 8 }))
    .describe(
      uiConfig({
        label: t("model_user_login_password"),
        icon: "lucide:user-round-key",
        ui: {
          type: "password",
          required: true,
          progress: false,
          separator: true,
        },
      }),
    ),
  active: z
    .boolean()
    .describe(
      uiConfig({
        label: t("base.status"),
        ui: {
          type: "checkbox",
        },
      }),
    )
    .optional(),
  selectedRoles: z
    .array(z.string())
    .describe(
      uiConfig({
        label: t("model_role"),
        ui: {
          type: "text",
        },
      }),
    )
    .optional(),
});

const schema = computed(() => {
  if (!isEditMode) {
    return schemaBase;
  }

  return schemaBase.extend({
    password: z
      .string()
      .min(8, t("error.requiredMinString", { count: 8 }))
      .or(z.literal(""))
      .optional()
      .describe(
        uiConfig({
          label: t("model_user_login_password"),
          icon: "lucide:user-round-key",
          ui: {
            type: "password",
            progress: false,
          },
        }),
      ),
  });
});

type Schema = z.output<typeof schema.value>;
const state = ref<Partial<Schema> & Record<string, any>>({
  avatarFile: [],
  email: "",
  password: "",
  active: true,
  selectedRoles: [],
  avatarFileId: undefined,
  coverFileId: undefined,
  avatar: undefined,
});

const {
  crudAction,
  loading,
  crudName,
  onDelete,
  onBack,
  onEnableEditForm,
  onSubmit: onSubmitBase,
} = useCrudForm<AppUser>(
  {
    crudName: "AppUser",
    methodPutIncludeId: false,
    methodPut: "POST",
  },
  state,
);
const api = useApi();
const { data: roles, pending } = await useAsyncData<AppRole[]>(
  "app-role-all",
  async () => {
    const response = await api<ResponseEntity<AppRole[]>>(
      "/api/appRole/findAll",
    );
    return response.data || [];
  },
);

const getRoles = computed(() => {
  if (!roles.value) {
    return [];
  }
  return roles.value.map((role) => ({
    label: role.name,
    icon: "lucide:users",
    value: role.id,
  }));
});

const uploadAvatar = async () => {
  if (
    !state.value ||
    !state.value.avatarFile ||
    state.value.avatarFile.length === 0
  ) {
    return;
  }

  const f = state.value.avatarFile[0];
  if (!f || !f.file) {
    return;
  }
  loading.value = true;
  const response = await onUploadChunk(f.file, {
    setProgress: false,
  });
  delete state.value.avatarFile;
  if (response && response.id) {
    state.value.avatarFileId = response.id;
  }
};
const onSubmit = async () => {
  console.log("onSubmit", state.value);
  await uploadAvatar();
  onSubmitBase();
};
</script>
<template>
  <BaseDashboardPanel id="app-user-crud-index" :title="$t('model_user')">
    <BaseForm
      :zod-schema="schema"
      v-model="state"
      :edit-mode="isEditMode"
      :crud-action="crudAction"
      :loading="loading"
      :crud-name="crudName"
      icon="lucide:user"
      :title="$t('model_user')"
      orientation="horizontal"
      class="max-w-[1020px]"
      @on-back="onBack"
      @on-edit-enable="onEnableEditForm"
      @on-submit="onSubmit"
      @on-delete="onDelete"
    >
      <template v-if="state?.avatar?.image" #prepend-fields>
        <div class="flex w-full justify-center pb-4">
          <UAvatar
            :alt="state.email"
            :src="state?.avatar?.image"
            class="w-36 h-36 rounded-md shadow-md"
            loading="lazy"
          />
        </div>
      </template>

      <template #field-selectedRoles>
        <div class="flex flex-col w-full gap-2">
          <UFormField
            v-if="state"
            :orientation="isMobile ? 'vertical' : 'horizontal'"
            :label="t('model_role')"
            name="selectedRoles"
            class="w-full"
            :ui="{
              labelWrapper: 'w-48 shrink-0',
              container: 'flex-1 w-full',
            }"
          >
            <UListbox
              :loading="pending"
              :items="getRoles"
              multiple
              class="w-56 max-w-full"
              value-key="value"
              v-model="state.selectedRoles"
            />
          </UFormField>
        </div>
      </template>
    </BaseForm>
  </BaseDashboardPanel>
</template>
