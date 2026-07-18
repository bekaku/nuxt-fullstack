<script setup lang="ts">
const { width = "28px", show = false } = defineProps<{
  show: boolean;
  width?: string;
}>();
</script>

<template>
 <div
  v-if="show"
  :style="{
    width: width,
    height: width,
  }"
  class="rounded-[14px] border-[3px] border-zinc-300 border-t-(--color-primary) dark:border-zinc-500 dark:border-t-white animate-spin"
/>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
