<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
import type { GroupChat } from "~/types/models";

const route = useRoute();
const toast = useToast();
const { t } = useLang();
const { isDark, appLayout } = useTheme();
const { chatHistory, isInitial, initHistoryData } = useAppChat();

const open = ref(false);
const search = ref("");
const updating = ref(false);
const { getParam } = useBase();
const currentActiveId = computed<string | undefined>(() => getParam("id"));
const selectedTab = ref("ALL");
const tabsItems = [
  {
    label: t("chats.all"),
    value: "ALL",
  },
  {
    label: t("chats.groups"),
    value: "GROUP",
  },
  {
    label: t("chats.favorite"),
    value: "FAVORITE",
  },
];
const filterChats = computed<GroupChat[]>(() => {
  const list = chatHistory.value.filter((item) => {
    if (!search.value) {
      return [];
    }
    const searchText = search.value.toLowerCase();
    return (
      item.groupName &&
      item.groupName.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  if (selectedTab.value === "GROUP") {
    return list.filter((item) => item.chatType === "GROUP");
  } else if (selectedTab.value === "FAVORITE") {
    return list.filter((item) => item.pin);
  }

  return list;
});

const getDropdownItems = (item: any): DropdownMenuItem[][] => [
  [
    {
      label: t("chats.favorite"),
      icon: "lucide:star",
      onSelect() {
        console.log("press Star menu:", item);
        console.log("ID menu:", item.value);
        if (item.value) {
        }
      },
    },
  ],
  [
    {
      label: t("base.delete"),
      icon: "i-lucide-trash",
      color: "error",
      async onSelect() {
        console.log("press Delete :", item);
        if (item.value) {
        }
      },
    },
  ],
];
onMounted(() => {
  if (chatHistory.value.length === 0) {
    initHistoryData();
  }else{
    isInitial.value = true
  }

});
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="chat"
      v-model:open="open"
      collapsible
      resizable
      :min-size="20"
      :default-size="25"
      :max-size="40"
      :class="
        appLayout == 'boxed'
          ? 'border-r-0 py-4 dark:[--ui-bg-elevated:var(--ui-color-neutral-900)]'
          : 'bg-white dark:bg-neutral-900'
      "
      :ui="{ footer: 'lg:border-t lg:border-default' }"
      :menu="{ inset: true }"
    >
      <template #header="{ collapsed }">
        <div class="flex w-full justify-between">
          <UButton
            v-if="!collapsed"
            :avatar="{
              src: !isDark ? '/logo/logo-black.png' : '/logo/logo-white.png',
              alt: 'App',
            }"
            to="/"
            variant="ghost"
            :square="collapsed"
            class="data-[state=open]:bg-elevated cursor-pointer justify-start"
            :class="[!collapsed && 'py-2']"
            :ui="{
              leadingAvatar: [
                'rounded-none  bg-transparent',
                !collapsed ? 'size-10' : 'size-5',
              ],
            }"
          />
          <UDashboardSidebarCollapse icon="lucide:sidebar" />
        </div>
      </template>

      <template #default="{ collapsed }">
        <template v-if="!isInitial">
          <div class="flex flex-col gap-3">
            <USkeleton class="h-8 w-15" />
            <USkeleton class="h-8 w-[75%]" />
            <USkeleton v-for="index in 15" :key="index" class="h-8 w-full" />
          </div>
        </template>
        <template v-else>
          <template v-if="!collapsed">
            <div class="flex gap-2">
              <UInput
                v-model="search"
                icon="i-lucide-search"
                size="md"
                variant="soft"
                :placeholder="$t('base.search') + '...'"
                class="w-full"
              />
              <UTooltip :text="$t('chats.newChat')">
                <UButton
                  variant="ghost"
                  icon="lucide:circle-plus"
                  class="w-fit"
                />
              </UTooltip>
            </div>

            <UTabs
              v-model="selectedTab"
              :items="tabsItems"
              color="primary"
              variant="pill"
              size="sm"
              :content="false"
            />
          </template>

          <UScrollArea class="h-max flex-1">
            <template v-if="filterChats.length > 0">
              <div v-for="(item, index) in filterChats" :key="`all-${item.id}`">
                <ULink
                  :to="`/chats/g/${item.id}`"
                  class="w-full text-neutral-800 dark:text-neutral-50 text-left hover:no-underline hover:text-neutral-800 dark:hover:text-neutral-50"
                >
                  <ChatHistoryItem
                    :item="item"
                    :index="index"
                    :collapsed
                    :is-active="item.id == currentActiveId"
                  />
                </ULink>
              </div>
            </template>
            <template v-else>
              <UEmpty
                variant="naked"
                icon="lucide:message-circle-more"
                :description="$t('chats.chatHistoryEmpty')"
              />
            </template>
          </UScrollArea>
        </template>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>
    <div
      class="flex-1 flex min-w-0 bg-default/75"
      :class="
        appLayout == 'boxed'
          ? 'm-4 lg:ml-0 rounded-lg ring ring-default/45 shadow-xs overflow-hidden'
          : ''
      "
    >
      <slot />
    </div>
  </UDashboardGroup>
</template>
