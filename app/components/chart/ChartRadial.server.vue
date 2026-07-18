<script setup lang="ts">
import type {
  RadialChartProps
} from "~/types/chart";

defineProps<RadialChartProps>();
</script>
<template>
  <USkeleton v-bind="$attrs" class="h-10 w-full" />
</template>
