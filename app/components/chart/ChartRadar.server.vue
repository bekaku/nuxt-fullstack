<script setup lang="ts">
import type {
  RadarChartProps
} from "~/types/chart";

defineProps<RadarChartProps>();
</script>
<template>
  <USkeleton v-bind="$attrs" class="h-10 w-full" />
</template>
