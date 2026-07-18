<script setup lang="ts">
const {
  closeOnClick = false,
  anchor = "bottom left",
  self = "top start",
  width = "180px",
  toggle = true,
} = defineProps<{
  closeOnClick?: boolean;
  anchor?: any;
  self?: any;
  width?: string;
  toggle?: boolean;
}>();
const { colorMode, availableThemes, isDark } = useTheme();
const { t } = useLang();
</script>
<template>
  <ClientOnly v-if="!colorMode?.forced">
    <UButton
      :icon="!isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
      color="neutral"
      variant="ghost"
      :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
      class="rounded-full"
      @click="()=>{isDark = !isDark}"
    />

    <template #fallback>
      <div class="size-8" />
    </template>
  </ClientOnly>
</template>
