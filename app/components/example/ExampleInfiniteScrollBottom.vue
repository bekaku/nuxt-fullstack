<script setup lang="ts">
import type { LabelValue } from "~/types/common";

const infiniteRef = useTemplateRef<any>("infiniteRef");
const items = ref<LabelValue<any>[]>([]);
const page = ref(1);
const limit = 20;
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
const reload = () => {
  items.value = [];
  page.value = 1;
  hasMore.value = true;
  fetchMoreData();
};
</script>
<template>
  <UCard title="Usage scroll bottom">
    <template #description>
      <div class="flex gap-2 p-2">
        <UButton>
          Default Btn
        </UButton>
        <UButton  @click="reload">
          Reload
        </UButton>
        <UButton
          @click="infiniteRef?.scrollToTop()"
          >Scroll to top</UButton
        >
        <UButton
          @click="infiniteRef?.scrollToBottom()"
          >Scroll to bottom</UButton
        >
      </div>
    </template>
    <BaseInfiniteScroll
      ref="infiniteRef"
      :is-fetching="isFetching"
      :has-more="hasMore"
      height-class="h-80"
      @load-more="fetchMoreData"
    >
      <div class="flex flex-col gap-3">
        <UUser
          v-for="(item, index) in items"
          :key="index"
          :name="item.label"
          :avatar="item.avatar"
          size="xl"
        />
      </div>
    </BaseInfiniteScroll>
  </UCard>
</template>
