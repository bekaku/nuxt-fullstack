<script setup lang="ts">
import { avatar } from "#build/ui";
import type { LabelValue } from "~/types/common";

definePageMeta({
  layout: false,
});
useSeoMeta({
  title: "Test page",
});
const scrollContainer = ref<HTMLElement | null>(null);
const items = ref<LabelValue<any>[]>([]);
const page = ref(1);
const limit = 25;
const hasMore = ref(true);
const isFetching = ref(false);

const fetchMoreData = async () => {
  console.log("Fetching more data...");
  if (isFetching.value || !hasMore.value) return;

  isFetching.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newItems = Array.from({ length: limit }, (_, i) => {
    return {
      label: `Item ${items.value.length + i + 1}`,
      avatar: {
        src: getMockAvatarByIndex(i),
      },
    };
  });

  items.value.push(...newItems);
  page.value++;

  if (items.value.length >= 100) {
    hasMore.value = false;
  }

  isFetching.value = false;
};

fetchMoreData();
</script>
<template>
  <div class="flex flex-col gap-4 p-4">
    <UButton
      label="Home"
      icon="lucide:arrow-left"
      to="/"
      class="w-fit"
      variant="ghost"
    />

    <div class="flex gap-4">
      <UButton label="error" color="error" />
      <UButton label="warning" color="warning" />
      <UButton label="success" color="success" />
      <UButton label="primary" color="primary" />
    </div>

    <!-- Nuxt UI Card wrapping the scroll container
        height-class="max-h-[calc(100vh-150px)]"
    -->
    <BaseInfiniteScroll
      :is-fetching="isFetching"
      :has-more="hasMore"
      height-class="h-80"
      @load-more="fetchMoreData"
    >
      <div class="flex flex-col gap-2">
        <!-- <div
          v-for="item in items"
          :key="item"
          class="p-8 bg-gray-100 dark:bg-gray-800 rounded text-sm"
        >
          {{ item }}
        </div> -->
        <UUser
          v-for="(item, index) in items"
          :key="index"
          :name="item.label"
          :avatar="item.avatar"
          size="xl"
        />
      </div>
    </BaseInfiniteScroll>

    <!-- <BaseInfiniteScroll
      v-if="scrollContainer"
      :is-fetching="isFetching"
      :has-more="hasMore"
      :scroll-ref="scrollContainer"
      @load-more="fetchMoreData"
    />

    <div ref="scrollContainer" class="h-80 w-full p-4 border overflow-y-auto">
      <div class="flex flex-col gap-2">
        <div
          v-for="item in items"
          :key="item"
          class="p-8 bg-gray-100 dark:bg-gray-800 rounded text-sm"
        >
          {{ item }}
        </div>
      </div>
    </div> -->
  </div>
</template>
