<script setup lang="ts">
import type {
  AreaChartProps
} from "~/types/chart";

defineProps<AreaChartProps>();
</script>
<template>
  <USkeleton v-bind="$attrs" class="h-10 w-full" />
</template>
