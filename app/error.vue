<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

useSeoMeta({
  title: "Page not found",
  description: "We are sorry but this page could not be found.",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
});
const { t } = useLang();
</script>

<template>
  <UApp>
    <UError
      icon="lucide:git-merge-conflict"
      :error="{ ...error, message: t('error.error') }"
      :clear="{
        label: `${t('base.back')}${t('base.home')}`,
        color: 'neutral',
        size: 'xl',
        icon: 'i-lucide-arrow-left',
        class: 'rounded-full',
      }"
      :ui="{
        leading: 'bg-warning-50 dark:bg-warning-900 rounded-full p-2',
        leadingIcon: 'text-warning dark:text-warning-400',
        statusCode: 'text-warning dark:text-warning-400',
      }"
    >
      <!-- <template #leading>
        <img src="/logo/logo.png" alt="Logo" class="size-10" />
      </template> -->
    </UError>
  </UApp>
</template>
