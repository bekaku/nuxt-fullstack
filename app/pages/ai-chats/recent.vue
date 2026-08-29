<script setup lang="ts">
import type { AiChat } from "~/types/models";

definePageMeta({
  layout: "ai",
  pageName: "ai.chatHistory",
});
const { formatDistanceFromNow } = useDateFns();
const {
  firstLoaded,
  dataList,
  loadData,
  onReload,
  onNextPage,
  isInfiniteDisabled,
  loading,
  keywordSearchText,
} = usePagefecth<AiChat>({
  apiEndpoint: "/api/aiChat",
  defaultSorts: [
    { column: "updatedDate", mode: "desc" },
  ],
  concatList: true,
  itemsPerPage: 15,
});
const searchText = ref();
loadData();

const onSearch = async () => {
  if (!searchText.value || searchText.value.trim().length == 0) {
    return;
  }
  keywordSearchText.value = searchText.value.trim();
  await onReload();
};
</script>

<template>
  <BaseDashboardPanel
    id="ai-chats-recent"
    :title="$t('ai.chatHistory')"
    :collapseable="false"
  >
    <template v-if="!firstLoaded">
      <USkeleton v-for="(item, index) in 5" :key="index" class="h-4 w-full" />
    </template>
    <template v-else-if="dataList.length > 0">
      <div class="flex flex-col mx-auto max-w-[65%]">
        <UForm class="w-full space-y-4" @submit="onSearch">
          <UInput
            v-model="searchText"
            icon="i-lucide-search"
            size="xl"
            variant="outline"
            :placeholder="$t('base.search') + '...'"
            class="mb-10 w-full"
          />
        </UForm>

        <ULink
          v-for="(item, index) in dataList"
          :key="item.id + ''"
          :to="`/ai-chats/c/${item.id}`"
          class="hover:no-underline text-neutral-900 dark:text-neutral-50"
        >
          <BaseItem :title="item.title" button class="rounded-md">
            <template v-if="item.pin" #start>
              <Icon name="lucide:star" class="text-amber-500" />
            </template>
            <template #end>
              <span class="text-sm text-muted">
                {{
                  formatDistanceFromNow({
                    date: item.updatedDate,
                    suffix: false,
                    iso: true,
                  })
                }}
              </span>
            </template>
          </BaseItem>
        </ULink>

        <BaseLoadmore
          :disabled="isInfiniteDisabled"
          :loading="loading"
          @on-next="onNextPage"
        />
      </div>
    </template>
    <UEmpty
      v-else
      variant="naked"
      icon="lucide:message-circle"
      :title="$t('ai.chatHistoryNotfound')"
    />
  </BaseDashboardPanel>
</template>
