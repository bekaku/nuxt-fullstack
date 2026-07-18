<script setup lang="ts" generic="T">
import { useInfiniteScroll } from "@vueuse/core";

const {
  distance = 10, // distance in pixels from bottom to trigger the load
  scrollClass = "h-80",
  isFetching,
  hasMore,
  scrollRef = null,
  direction,
} = defineProps<{
  isFetching?: boolean;
  hasMore?: boolean;
  distance?: number;
  scrollClass?: string;
  scrollRef?: HTMLElement | null;
  direction?: "top" | "bottom" | "left" | "right" | undefined;
  items?: T[];
}>();

const emit = defineEmits<{
  "load-more": [];
  "scrolling-top": [payload: boolean];
}>();

const scrollContainerRef = useTemplateRef<any>("scrollContainerRef");

useInfiniteScroll(
  scrollRef || scrollContainerRef,
  () => {
    if (!isFetching && hasMore) {
      emit("load-more");
    }
  },
  { distance: distance, direction: direction },
);

const scrollToTop = () => {
  const el = scrollContainerRef.value;
  if (el) {
    el.scrollTo({ top: 0, behavior: "smooth" });
  }
};
const scrollToBottom = () => {
  const el = scrollContainerRef.value;
  if (el) {
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }
};
const handleScroll = (event: any) => {
  const el = scrollContainerRef.value;
  if (!el) {
    return;
  }
  const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
  if (!isAtBottom) {
    emit("scrolling-top", true);
  } else {
    emit("scrolling-top", false);
  }
};
defineExpose({
  scrollToTop,
  scrollToBottom,
});
</script>

<template>
  <div
    ref="scrollContainerRef"
    :class="[scrollClass, 'w-full flex flex-col overflow-y-auto']"
    @scroll="handleScroll"
  >
    <div v-if="direction == 'top'" class="py-4 text-center text-sm text-muted">
      <slot name="loading" v-if="isFetching">
        <UProgress animation="swing" size="xs" />
      </slot>

      <slot name="end" v-else-if="!hasMore">
        <p>{{ $t("helper.nomoreData") }}</p>
      </slot>
    </div>
    <slot />
    <div
      v-if="!direction || direction == 'bottom'"
      class="py-4 text-center text-sm text-muted"
    >
      <slot name="loading" v-if="isFetching">
        <UProgress animation="swing" size="xs" />
      </slot>

      <slot name="end" v-else-if="!hasMore">
        <p>{{ $t("helper.nomoreData") }}</p>
      </slot>
    </div>
  </div>
</template>
