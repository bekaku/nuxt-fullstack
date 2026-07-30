<script setup lang="ts">
const { progress = true } = defineProps<{
  progress?: boolean;
  placeholder?: string;
  icon?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: "outline" | "soft" | "subtle" | "ghost" | "none";
}>();
const show = ref(false);
const password = defineModel<string>({ default: "" });

const { t } = useLang();
function checkStrength(str: string) {
  const requirements = [
    { regex: /.{8,}/, text: t("error.atLeastCharacters", [8]) },
    { regex: /\d/, text: t("error.atLeastNumbers", [1]) },
    { regex: /[a-z]/, text: t("error.atLeastLowercase", [1]) },
    { regex: /[A-Z]/, text: t("error.atLeastNumbers", [1]) },
  ];

  return requirements.map((req) => ({
    met: req.regex.test(str),
    text: req.text,
  }));
}

const strength = computed(() => checkStrength(password.value));
const score = computed(() => strength.value.filter((req) => req.met).length);

const color = computed(() => {
  if (score.value === 0) return "neutral";
  if (score.value <= 1) return "error";
  if (score.value <= 2) return "warning";
  if (score.value === 3) return "warning";
  return "success";
});

const text = computed(() => {
  if (score.value === 0) return t("base.enterPassword");
  if (score.value <= 2) return t("base.waeakPassword");
  if (score.value === 3) return t("base.mediumPassword");
  return t("base.strongPassword");
});
</script>

<template>
  <div class="w-full space-y-2">
    <UInput
      v-model="password"
      :placeholder="placeholder"
      :icon="icon"
      :color="color"
      :type="show ? 'text' : 'password'"
      :aria-invalid="score < 4"
      :variant="variant"
      :size="size"
      aria-describedby="password-strength"
      :ui="{ trailing: 'pe-1' }"
      class="w-full"
    >
      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="show ? 'Hide password' : 'Show password'"
          :aria-pressed="show"
          aria-controls="password"
          @click="show = !show"
        />
      </template>
    </UInput>

    <template v-if="progress">
      <UProgress
        :color="color"
        :indicator="text"
        :model-value="score"
        :max="4"
        size="sm"
      />

      <p id="password-strength" class="text-sm font-medium">
        {{ text }}. {{ t("base.mustContain") }}:
      </p>

      <ul class="space-y-1" aria-label="Password requirements">
        <li
          v-for="(req, index) in strength"
          :key="index"
          class="flex items-center gap-0.5"
          :class="req.met ? 'text-success' : 'text-muted'"
        >
          <UIcon
            :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
            class="size-4 shrink-0"
          />

          <span class="text-xs font-light">
            {{ req.text }}
            <span class="sr-only">
              {{ req.met ? " - Requirement met" : " - Requirement not met" }}
            </span>
          </span>
        </li>
      </ul>
    </template>
  </div>
</template>
