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
const { getQuery } = useBase();
const { signin, loading } = useAuth();
const redirectTimeout = ref<any>(null);
const redirectTo = ref<string | undefined>(getQuery("continue"));
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
  email: "admin@mydomain.com",
  password: "P@ssw0rd",
});

const showPassword = ref(false);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  console.log("onSubmit", event);
  loading.value = true;
  const response = await signin({
    emailOrUsername: state.email,
    password: state.password,
  });
  if (response && response.authenticationToken) {
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
  <div class="login-layout">
    <!-- Left: Hero Image Panel -->
    <div class="hero-panel">
      <img
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"
        alt="Mountain landscape at sunset"
        class="hero-image"
      />
      <!-- Review Card Overlay -->
      <div class="review-card">
        <div class="reviewer-info">
          <UAvatar text="CR" size="md" class="reviewer-avatar" />
          <div>
            <p class="reviewer-name">Claudia Ramirez</p>
            <div class="reviewer-source">
              <UIcon name="flat-color-icons:google" class="mr-1 w-4 h-4" />
              <span>Google Reviews</span>
            </div>
          </div>
        </div>
        <div class="star-rating">
          <UIcon
            v-for="i in 5"
            :key="i"
            name="ic:sharp-star"
            class="star-icon"
          />
        </div>
        <p class="review-text">
          "Absolutely love the interface! It's incredibly intuitive and the
          attention to detail is just stunning. 5 stars!"
        </p>
      </div>
    </div>

    <!-- Right: Login Form -->
    <div class="form-panel">
      <div class="form-container">
        <div class="form-header">
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
          <p class="text-muted">{{ $t("base.enterDetails") }}</p>
        </div>

        <!-- Google Login -->
        <UButton
          color="neutral"
          variant="outline"
          size="xl"
          block
          :disabled="loading"
          class="google-btn"
          @click="loginWithGoogle"
        >
          <template #leading>
            <UIcon name="flat-color-icons:google" class="mr-2 h-6 w-6" />
          </template>
          {{ $t("authen.googleLogin") }}
        </UButton>

        <!-- Divider -->
        <USeparator :label="$t('base.or')" class="py-4" />

        <!-- Email & Password Form -->
        <UForm
          :schema="schema"
          :state="state"
          class="login-form"
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
          <div class="remember-row">
            <UCheckbox v-model="remember" label="Remember for 30 days" />
            <UButton
              variant="link"
              color="neutral"
              size="sm"
              :disabled="loading"
              class="forgot-btn"
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
           color="neutral" variant="solid"
          >
            {{ $t("authen.login") }}
          </UButton>
        </UForm>

        <!-- Sign Up -->
        <p class="signup-text text-muted">
          Don't have an account?
          <NuxtLink v-if="!loading" class="signup-link">Sign Up</NuxtLink>
        </p>
        <div class="flex gap-2 justify-center py-4">
          <BaseLangugeSwitcher />
          <BaseThemeSwitcher />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.login-layout {
  display: flex;
  min-height: 100dvh;
  /* background: #fff; */
}

/* ── Left Panel ── */
.hero-panel {
  position: relative;
  flex: 0 0 50%;
  overflow: hidden;
  border-radius: 24px;
  margin: 16px;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.review-card {
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.reviewer-avatar {
  background: #f59e0b !important;
  font-weight: 700;
  flex-shrink: 0;
}

.reviewer-name {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.2;
}

.reviewer-source {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #d1d5db;
  margin-top: 2px;
}

.star-rating {
  display: flex;
  gap: 2px;
  margin-bottom: 10px;
}

.star-icon {
  color: #f59e0b;
  width: 16px;
  height: 16px;
}

.review-text {
  font-size: 13px;
  color: #e5e7eb;
  line-height: 1.55;
}

/* ── Right Panel ── */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 28px;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  /* color: #111827; */
  line-height: 1.2;
  margin-bottom: 6px;
}

.form-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.google-btn {
  justify-content: center;
  font-weight: 500;
  border-color: #e5e7eb !important;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.remember-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot-btn {
  font-size: 14px !important;
  /* color: #374151 !important; */
  padding: 0 !important;
}

.login-submit-btn {
  background: #111827 !important;
  color: #fff !important;
  font-weight: 600;
  border-radius: 9999px !important;
  margin-top: 4px;
}

.signup-text {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}
.signup-link {
  font-weight: 700;
  text-decoration: none;
  color: #000;
}
.dark .signup-link {
  color: #fff;
}
.signup-link:hover {
  text-decoration: underline;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .login-layout {
    flex-direction: column;
  }

  .hero-panel {
    flex: 0 0 260px;
    margin: 12px 12px 0;
  }

  .form-panel {
    padding: 32px 20px;
  }
}
</style>
