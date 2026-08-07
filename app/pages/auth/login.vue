<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

definePageMeta({
  layout: false,
});
useSeoMeta({
  title: "Login",
});
const { t } = useLang();
const { isDark } = useTheme();
const { getPageQuery } = useBase();
const { signin, loading } = useAuth();
const redirectTimeout = ref<any>(null);
const redirectTo = ref<string | undefined>(getPageQuery("continue"));
const { sendBroradcastChanelReload } = useAppBroadcastChannels();
const schema = z.object({
  email: z.email(t("error.emailFormat")),
  password: z
    .string(t("error.passwordRequired"))
    .min(8, t("error.requiredAmountCharacters", [8])),
});
type Schema = z.output<typeof schema>;
const remember = ref(false);
const state = reactive<Partial<Schema>>({
  email: "admin@example.com",
  password: "Admin@12345",
});

const showPassword = ref(false);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  console.log("onSubmit", event);
  loading.value = true;
  const response = await signin({
    emailOrUsername: state.email,
    password: state.password,
  });
  if (response) {
    await sendBroradcastChanelReload();
    redirectTimeout.value = setTimeout(() => {
      window.location.replace(
        redirectTo.value !== undefined ? redirectTo.value : "/",
      );
    }, 350);
  }
};
const togleShowPassword = () => {
  showPassword.value = !showPassword.value;
};
const loginWithGoogle = () => {
  // TODO: implement Google OAuth
};

const forgotPassword = () => {
  navigateTo("/forgot-password");
};

onBeforeUnmount(() => {
  if (redirectTimeout.value) {
    clearTimeout(redirectTimeout.value);
  }
});
</script>
<template>
  <div class="flex flex-col md:flex-row min-h-dvh">
    <!-- Left: Hero Image Panel -->
    <div class="relative flex-none h-65 mx-3 mt-3 md:m-4 md:h-auto md:basis-1/2 overflow-hidden rounded-3xl">
      <img
        src="https://images.pexels.com/photos/34804011/pexels-photo-34804011.jpeg"
        alt="hero image"
        class="w-full h-full object-cover block"
      />

      <!-- Review Card Overlay -->
      <div class="absolute bottom-6 left-6 right-6 bg-[#1e1e1e]/85 backdrop-blur-md rounded-2xl p-5 text-white">
        <div class="flex items-center gap-3 mb-2">
          <UAvatar text="CR" size="md" class="bg-amber-500! font-bold shrink-0" />
          <div>
            <p class="font-semibold text-[15px] leading-tight">Claudia Ramirez</p>
            <div class="flex items-center gap-1.5 text-xs text-gray-300 mt-0.5">
              <Icon name="flat-color-icons:google" class="mr-1 w-4 h-4" />
              <span>Google Reviews</span>
            </div>
          </div>
        </div>
        <div class="flex gap-0.5 mb-2.5">
          <Icon
            v-for="i in 5"
            :key="i"
            name="ic:sharp-star"
            class="text-amber-500 w-4 h-4"
          />
        </div>
        <p class="text-[13px] text-gray-200 leading-[1.55]">
          "Absolutely love the interface! It's incredibly intuitive and the
          attention to detail is just stunning. 5 stars!"
        </p>
      </div>
    </div>

    <!-- Right: Login Form -->
    <div class="flex-1 flex items-center justify-center py-8 px-5 md:py-12 md:px-8">
      <div class="w-full max-w-100">
        <div class="mb-7">
          <div class="w-full flex justify-center py-4">
            <div>
              <NuxtImg
                :src="!isDark ? '/logo/logo-black.png' : '/logo/logo-white.png'"
                width="85"
              />
            </div>
          </div>

          <div class="text-3xl font-bold text-black dark:text-white">
            {{ $t("base.welcomeText") }}
          </div>
          <p class="text-muted text-sm">{{ $t("base.enterDetails") }}</p>
        </div>

        <!-- Google Login -->
        <UButton
          color="neutral"
          variant="outline"
          size="xl"
          block
          :disabled="loading"
          class="justify-center font-medium border-gray-200! dark:border-gray-700!"
          @click="loginWithGoogle"
        >
          <template #leading>
            <Icon name="flat-color-icons:google" class="mr-2 h-6 w-6" />
          </template>
          {{ $t("authen.googleLogin") }}
        </UButton>

        <!-- Divider -->
        <USeparator :label="$t('base.or')" class="py-4" />

        <!-- Email & Password Form -->
        <UForm
          :schema="schema"
          :state="state"
          class="flex flex-col gap-3.5"
          @submit="onSubmit"
        >
          <UFormField name="email">
            <UInput
              v-model="state.email"
              type="email"
              :placeholder="$t('base.email')"
              size="xl"
              block
              :disabled="loading"
              class="w-full"
              :trailing-icon="'lucide:mail'"
            />
          </UFormField>

          <UFormField name="password">
            <UInput
              v-model="state.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('authen.password')"
              size="xl"
              block
              class="w-full"
              :disabled="loading"
              :trailing-icon="
                !showPassword ? 'lucide:eye-closed' : 'lucide:eye'
              "
              @click-trailing="showPassword = !showPassword"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  :icon="!showPassword ? 'lucide:eye-closed' : 'lucide:eye'"
                  aria-label="Clear input"
                  @click="togleShowPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between">
            <UCheckbox v-model="remember" label="Remember for 30 days" />
            <UButton
              variant="link"
              color="neutral"
              size="sm"
              :disabled="loading"
              class="text-sm! p-0!"
              @click="forgotPassword"
            >
              {{ $t("authen.forgetPassword") }}?
            </UButton>
          </div>

          <!-- Submit -->
          <UButton
            type="submit"
            size="xl"
            block
            :loading="loading"
            color="neutral"
            variant="solid"
            class="bg-gray-900! text-white! font-semibold rounded-full! mt-1 dark:bg-white! dark:text-gray-900!"
          >
            {{ $t("authen.login") }}
          </UButton>
        </UForm>

        <!-- Sign Up -->
        <p class="text-center mt-5 text-sm text-muted">
          Don't have an account?
          <NuxtLink v-if="!loading" class="font-bold no-underline text-black dark:text-white hover:underline cursor-pointer">Sign Up</NuxtLink>
        </p>
        <div class="flex gap-2 justify-center py-4">
          <BaseLangugeSwitcher />
          <BaseThemeSwitcher />
        </div>
      </div>
    </div>
  </div>
</template>
