<script setup lang="ts">
import * as z from "zod";
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import type { ResponseEntity } from "~/types/common";

const { t } = useLang();
const { signoutProcess } = useAuth();
const api = useApi();
const toast = useToast();
const loading = ref(false);
const passwordSchema = z.object({
  password: z.string().min(8, t("error.requiredMinString", { count: 8 })),
  newPassword: z.string().min(8, t("error.requiredMinString", { count: 8 })),
  logoutAllDevices: z.boolean().optional(),
});

type PasswordSchema = z.output<typeof passwordSchema>;

const password = reactive<Partial<PasswordSchema>>({
  password: "",
  newPassword: "",
  logoutAllDevices: true,
});

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = [];
  if (
    state.password &&
    state.newPassword &&
    state.password === state.newPassword
  ) {
    errors.push({
      name: "newPassword",
      message: t("error.passwordMustDefferent"),
    });
  }
  return errors;
};
async function onSubmit(event: FormSubmitEvent<PasswordSchema>) {
  try {
    const response = await api<ResponseEntity<void>>("/api/appUser/password", {
      method: "POST",
      body: password,
    });

    if (response && response.status == 200) {
      toast.add({
        description: t("success.changePasswordOk"),
        icon: "i-lucide-check",
        color: "success",
      });
      setTimeout(async () => {
        await signoutProcess();
      }, 1000);
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
  <UPageCard
    :title="t('updatePassword')"
    :description="$t('base.updatePasswordSub')"
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
      @submit="onSubmit"
    >
      <UFormField name="password">
        <UInput
          v-model="password.password"
          type="password"
          :placeholder="$t('authen.currentPassword')"
          class="w-full"
          :loading="loading"
        />
      </UFormField>

      <UFormField name="newPassword">
        <BaseInputPassword
          v-model="password.newPassword"
          :placeholder="$t('authen.newPassword')"
          class="w-full"
        />
      </UFormField>

      <UButton :loading="loading" :label="$t('updatePassword')" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Account"
    description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-linear-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton label="Delete account" color="error" />
    </template>
  </UPageCard>
</template>
