<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";

const {
  distance = 10, // distance in pixels from bottom to trigger the load
  isFetching,
  hasMore,
} = defineProps<{
  isFetching?: boolean;
  hasMore?: boolean;
  distance?: number;
  scrollClass?: string;
}>();

const emit = defineEmits<{
  (e: "load-more"): void;
}>();
if (typeof window !== "undefined") {
  useInfiniteScroll(
    document,
    () => {
      if (!isFetching && hasMore) {
        emit("load-more");
      }
    },
    { distance: distance },
  );
}
</script>

<template>
  <div v-bind="$attrs" class="w-full pb-10">
    <slot />

    <div class="py-4 text-center text-sm text-muted">
      <slot name="loading" v-if="isFetching">
        <UProgress animation="swing" size="xs" />
      </slot>

      <slot name="end" v-else-if="!hasMore">
        <p>{{ $t("helper.nomoreData") }}</p>
      </slot>
    </div>
  </div>
</template>
