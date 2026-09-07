<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { GroupChat } from "~/types/models";

definePageMeta({
  layout: "chat",
});
useSeoMeta({
  title: "Chat page",
});

const { t } = useLang();
const { isTablet, isDesktop } = useAppDevice();
const { getParam } = useBase();
const { chatHistory } = useAppChat();
const chatId = computed<string | undefined>(() => getParam("id"));
// const groupItem = ref<GroupChat>();
const groupItem = computed(() => {
  return chatHistory.value.find((item) => item.id === chatId.value);
});
const getDropdownItems = (): DropdownMenuItem[][] => {
  const items: DropdownMenuItem[][] = [
    [
      {
        label: groupItem.value?.muteNotify
          ? t("chats.unmuteNotify")
          : t("chats.muteNotify"),
        color: "neutral",
        onSelect() {},
      },
      {
        label: groupItem.value?.pin ? t("chats.unpin") : t("chats.pin"),
        onSelect() {},
      },
      {
        label: groupItem.value?.favorite
          ? t("chats.unfavorite")
          : t("chats.favorite"),
        onSelect() {},
      },
    ],
  ];

  if (groupItem.value?.chatType == "GROUP") {
    items.push([
      {
        label: t("chats.invite"),
        onSelect() {},
      },
      {
        label: t("chats.leaveGroup"),
        icon: "lucide:square-arrow-right-exit",
        color: "error",
        async onSelect() {},
      },
    ]);
  }

  items.push([
    {
      label: t("base.delete"),
      icon: "i-lucide-trash",
      color: "error",
      async onSelect() {},
    },
  ]);

  return items;
};

// onMounted(() => {
//   if (chatHistory.value) {
//     groupItem.value = chatHistory.value.find(
//       (item) => item.id === chatId.value,
//     );
//   }
// });
</script>

<template>
  <BaseDashboardPanel
    id="example-blank"
    title="Blank page"
    class="overflow-hidden"
    :ui="{ body: 'p-4 overflow-hidden' }"
    body-class="pt-0"
  >
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <ChatHistoryItem
            v-if="groupItem"
            :item="groupItem"
            :index="0"
            :is-history-item="false"
          />
        </template>

        <template #right>
          <div class="flex gap-2">
            <UDropdownMenu
              :items="getDropdownItems()"
              :content="{ align: 'start' }"
              :modal="false"
            >
              <UButton variant="ghost" icon="lucide:more-vertical" />
            </UDropdownMenu>
          </div>
        </template>
      </UDashboardNavbar>
    </template>
    <div
      class="w-full h-[calc(100dvh-5rem)] grid grid-cols-1 md:grid-cols-12 gap-4"
    >
      <div class="md:col-span-8 h-[calc(100dvh-5rem)]">
        <ChatContent
          v-if="chatId && groupItem && isNumericOnly(chatId)"
          :id="chatId"
        />
        <template v-else>
          <div class="h-full lg:flex flex-1 items-center justify-center">
            <UEmpty
              variant="naked"
              icon="lucide:message-circle-more"
              :description="$t('chats.chatContentEmpty')"
            />
          </div>
        </template>
      </div>
      <!-- v-if="isDesktop || isTablet" -->
      <div class="hidden md:block md:col-span-4 h-full overflow-y-auto">
        <ChatRight v-if="groupItem" v-model="groupItem" />
      </div>
    </div>
  </BaseDashboardPanel>
</template>
