<script setup lang="ts">
import type { LabelValue } from "~/types/common";
definePageMeta({
  layout: "feed",
});
useSeoMeta({
  title: "Infinite Scroll page",
});

const infiniteRef = useTemplateRef<any>("infiniteRef");
const items = ref<LabelValue<any>[]>([]);
const page = ref(1);
const limit = 40;
const hasMore = ref(true);
const isFetching = ref(false);

const fetchMoreData = async () => {
  console.log("Fetching more data...");
  if (isFetching.value || !hasMore.value) return;

  isFetching.value = true;
  await new Promise((resolve) => setTimeout(resolve, 2000));

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

  if (items.value.length >= 200) {
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
  <div class="w-full max-w-[540px] mx-auto p-5">
    <BaseInfiniteScrollPage
      ref="infiniteRef"
      :is-fetching="isFetching"
      :has-more="hasMore"
      @load-more="fetchMoreData"
    >
      <UCard title="Usage">
        <template #description>
          <div class="flex gap-2 p-2">
            <UButton variant="subtle" color="neutral" to="/" icon="lucide:arrow-left">Back</UButton>
            <UButton variant="subtle" color="neutral" @click="reload"
              >Reload</UButton
            >
          </div>
        </template>
        <div class="flex flex-col gap-3">
          <UUser
            v-for="(item, index) in items"
            :key="index"
            :name="item.label"
            :avatar="item.avatar"
            size="xl"
          />
        </div>
      </UCard>
    </BaseInfiniteScrollPage>
  </div>
</template>
