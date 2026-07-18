<script setup lang="ts">
import type {
  PieCharProps
} from "~/types/chart";

defineProps<PieCharProps>();
</script>
<template>
  <USkeleton v-bind="$attrs" class="h-10 w-full" />
</template>
