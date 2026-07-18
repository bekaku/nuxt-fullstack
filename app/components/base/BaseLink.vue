<script setup lang="ts">
import type { LinkProps } from "@nuxt/ui";
type BaseLink = LinkProps & {
  class?: string;
};
const props = defineProps<BaseLink>();
</script>
<template>
  <ULink
    class="text-primary hover:underline hover:text-primary"
    v-bind="{ ...props }"
  >
    <slot />
  </ULink>
</template>
