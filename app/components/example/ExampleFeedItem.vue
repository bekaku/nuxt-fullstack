<script setup lang="ts">
import type { SelectItem } from "@nuxt/ui";
import type { FeedItem } from "~/types";

const props = defineProps<{
  item: FeedItem;
  index?: number;
}>();
const { appNavigateTo } = useBase();
const { t } = useLang();
const sortItems = ref<SelectItem[]>([
  {
    label: t("sort.comment.NEW_COMMENT"),
    id: "NEW_COMMENT",
    icon: "lucide:clock",
    description: t("sort.post.NEW_POST_DESC"),
  },
  {
    label: t("sort.comment.TOP_COMMENT"),
    id: "TOP_COMMENT",
    icon: "lucide:rocket",
    description: t("sort.comment.NEW_COMMENT_DESC"),
  },
  {
    label: t("sort.comment.ALL_COMMENT"),
    id: "ALL_COMMENT",
    icon: "lucide:hourglass",
    description: t("sort.comment.ALL_COMMENT_DESC"),
  },
]);
const sortModel = ref("NEW_COMMENT");

const onMenuTap = (e: any) => {
  console.log("onMenuTap", e);
};
const onItemClick = (e: any) => {
  appNavigateTo(`/example/feed/${props.item.id}`);
};
</script>
<template>
  <UCard class="mb-8" :ui="{ body: 'p-0! sm:p-0!' }">
    <BaseItem dense top :separator="false" class="pt-4">
      <template #start>
        <UAvatar
          :src="getMockAvatarByIndex(index)"
          loading="lazy"
          size="2xl"
          class="shadow-sm"
        />
      </template>
      <div class="flex flex-col">
        <h4 class="font-bold">
          {{ item.user || "Anonymous" }}
          <span class="text-xs text-muted ml-2 font-medium">{{
            item.time_ago
          }}</span>
        </h4>
        <p class="text-sm text-muted">{{ item.domain || "" }}</p>
      </div>
      <template #end>
        <UDropdownMenu
          arrow
          :items="[
            {
              label: 'Save this post',
              icon: 'lucide:bookmark',
            },
            {
              label: 'Copy link this post',
              icon: 'lucide:link',
            },
            {
              label: 'Report this post',
              icon: 'lucide:flag',
            },
          ]"
        >
          <UButton
            variant="ghost"
            color="neutral"
            icon="lucide:ellipsis-vertical"
            class="rounded-full"
          />
        </UDropdownMenu>
      </template>
    </BaseItem>
    <div class="flex flex-col self-start w-full px-4 py-2">
      <BaseContentText
        :rows="10"
        :content="item.title"
        show-more
        :urlify="true"
      />
    </div>
    <div class="flex flex-col self-start w-full">
      <div
        class="flex flex-row w-full overflow-hidden rounded-bl-lg rounded-br-lg"
      >
        <UButton variant="ghost" class="rounded-none py-3">
          <UIcon name="lucide:heart" class="text-muted" />
          <span class="text-muted">{{ item.points || 0 }}</span>
        </UButton>
        <UButton variant="ghost" class="rounded-none">
          <UIcon name="lucide:message-circle-more" class="text-muted" />
          <span class="text-muted">{{ item.comments_count || 0 }}</span>
        </UButton>

        <div class="flex flex-row flex-1 justify-end w-full">
          <UButton variant="ghost" class="rounded-none">
            <div class="flex gap-1">
              <UIcon name="lucide:thumbs-up" class="text-primary" />
              <UIcon name="lucide:heart" class="text-rose-500" />
              <UIcon name="lucide:laugh" class="text-amber-500" />
              <UIcon name="lucide:angry" class="text-amber-500" />
            </div>
          </UButton>
        </div>
      </div>
    </div>
    <div class="px-4 pb-4 pt-1">
      <ExampleCommentForm />

      <div class="flex gap-2 items-center p-2">
        <span class="text-muted text-sm">{{ t("sort.sort") }}</span>
        <USelect
          v-model="sortModel"
          variant="ghost"
          value-key="id"
          :items="sortItems"
          class="w-48"
        />
      </div>
    </div>
  </UCard>
</template>
