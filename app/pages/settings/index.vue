<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ResponseEntity } from "~/types/common";
import type { AppUser, FileManager } from "~/types/models";

const { t } = useLang();
const api = useApi();
const { auth, loginedAvatar } = useAuth();
const { onUploadChunk } = useUpload();
const toast = useToast();
const loading = ref(false);
const avatarFiles = ref<FileManager[]>([]);
const profileSchema = z.object({
  name: z.string().min(2, t("error.atLeastCharacters", [2])),
  email: z
    .email(t("error.emailFormat"))
    .min(1, t("error.validateRequireField")),
  username: z
    .string()
    .min(4, { message: t("helper.username1") })
    .max(20, { message: t("helper.username1") })
    .regex(/^[a-zA-Z0-9]([._]?[a-zA-Z0-9]+)*$/, {
      message: `${t("helper.username2")}, ${t("helper.username3")}, ${t("helper.username4")}, ${t("helper.username5")}`,
    }),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileSchema = z.output<typeof profileSchema>;

const profile = reactive<Partial<ProfileSchema> & Record<string, any>>({
  name: "Benjamin Canac",
  email: auth.value?.email,
  username: auth.value?.username || "",
  avatarFileId: undefined,
  avatar: undefined,
  bio: undefined,
});

const getAvatar = computed(() => {
  if (avatarFiles.value && avatarFiles.value.length > 0) {
    return avatarFiles.value[0]?.filePath;
  }
  return loginedAvatar.value;
});


const uploadAvatar = async () => {
  if (!avatarFiles.value || avatarFiles.value.length === 0) {
    return;
  }

  const f = avatarFiles.value[0];
  if (!f || !f.file) {
    return;
  }

  loading.value = true;
  const response = await onUploadChunk(f.file, {
    setProgress: false,
  });
  avatarFiles.value = [];
  if (response && response.id) {
    profile.avatarFileId = response.id;
  }
};
async function onSubmit(event: FormSubmitEvent<ProfileSchema>) {
  await uploadAvatar();
  // console.log(event.data);
  try {
    const response = await api<ResponseEntity<AppUser>>(
      "/api/appUser/profile",
      {
        method: "POST",
        body: {
          name: profile.name,
          email: profile.email,
          username: profile.username,
          avatarFileId: profile.avatarFileId,
          bio: profile.bio,
        },
      },
    );

    if (response && response.status == 200 && response.data) {
      auth.value = {
        ...auth.value,
        email: response.data.email,
        username: response.data.username,
        avatar: response.data.avatar,
      };
      toast.add({
        description: t("success.updateSuccesfull"),
        icon: "i-lucide-check",
        color: "success",
      });
    }

    return response.data || null;
  } catch (error) {
    console.error("Failed to fetch profile", error);
    return null;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UForm
    id="settings"
    :schema="profileSchema"
    :state="profile"
    @submit="onSubmit"
  >
    <UPageCard
      :title="$t('base.profile')"
      :description="$t('base.settingProfileDescription')"
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        form="settings"
        :label="$t('base.save')"
        color="primary"
        type="submit"
        class="w-fit lg:ms-auto"
        :loading="loading"
      />
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField
        name="name"
        label="Name"
        description="Will appear on receipts, invoices, and other communication."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput :loading="loading" v-model="profile.name" autocomplete="off" />
      </UFormField>
      <USeparator />
      <UFormField
        name="email"
        :label="$t('model_user_email')"
        :description="$t('base.settingEmailDescription')"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          :loading="loading"
          v-model="profile.email"
          type="email"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="username"
        :label="$t('model_user_username')"
        :description="$t('base.settingUsernameDescription')"
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          :loading="loading"
          v-model="profile.username"
          type="username"
          autocomplete="off"
        />
      </UFormField>
      <USeparator />
      <UFormField
        name="avatar"
        :label="$t('base.changeAvatar')"
        description="JPG, GIF or PNG. 1MB Max."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar :src="getAvatar" :alt="profile.name" size="lg" />
          <BaseFileUpload
            :multiple="false"
            :max-files="1"
            v-model="avatarFiles"
          >
            <template #default="{ open, removeFile }">
              <UButton
                :label="$t('base.imgChoose')"
                color="neutral"
                :loading="loading"
                @click="
                  () => {
                    open();
                  }
                "
              />
            </template>
          </BaseFileUpload>
        </div>
      </UFormField>
      <USeparator />
      <UFormField
        name="bio"
        label="Bio"
        description="Brief description for your profile. URLs are hyperlinked."
        class="flex max-sm:flex-col justify-between items-start gap-4"
        :ui="{ container: 'w-full' }"
      >
        <UTextarea
          :loading="loading"
          v-model="profile.bio"
          :rows="5"
          autoresize
          class="w-full"
        />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
