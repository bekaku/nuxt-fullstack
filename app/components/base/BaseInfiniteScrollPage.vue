<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
  isFetching?: boolean;
  hasMore?: boolean;
  distance?: number;
  scrollClass?: string;
  }>(),
  {
    distance: 10, // distance in pixels from bottom to trigger the load
  },
);
const emit = defineEmits<{
  (e: "load-more"): void;
}>();
if (typeof window !== "undefined") {
  useInfiniteScroll(
    document,
    () => {
      if (!props.isFetching && props.hasMore) {
        emit("load-more");
      }
    },
    { distance: props.distance },
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
