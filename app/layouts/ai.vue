<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";
import type { AppNavigationMenuItem } from "~/types/common";
import type { AiChat } from "~/types/models";

const route = useRoute();
const toast = useToast();
const { t } = useLang();
const { isDark, appLayout } = useTheme();
const open = ref(false);

const changeNameModal = ref(false);
const renameChat = ref<AiChat>();
const updating = ref(false);
const { firstLoaded, dataList, loadData } = usePagefecth<AiChat>({
  apiEndpoint: "/api/aiChat",
  defaultSorts: [
    { column: "pin", mode: "desc" },
    { column: "updatedDate", mode: "desc" },
  ],
  itemsPerPage: 10,
});
const { recentChats, onPin, onUnPin, onDeleteChat, getItemById, onRenameChat } =
  useAiChat();
onMounted(async () => {
  await loadData();
  if (dataList.value.length > 0) {
    recentChats.value = dataList.value;
  }
});

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: t("chats.newChat"),
      icon: "lucide:circle-plus",
      to: "/ai-chats/c/new",
      external: true,
    },
    {
      label: t("chats.searchChat"),
      icon: "lucide:search",
      to: "/ai-chats/recent",
    },
  ],
]);

const pinItems = computed<NavigationMenuItem[][]>(() => {
  const items: NavigationMenuItem[] = [
    {
      label: t("chats.favorite"),
      type: "label",
    },
  ];
  const recents: any = recentChats.value
    .filter((item) => item.pin)
    .map((item) => {
      return {
        label: item.title,
        to: `/ai-chats/c/${item.id}`,
        value: item.id,
      };
    });

  items.push(...recents);

  return [items];
});
const recentItems = computed<NavigationMenuItem[][]>(() => {
  const items: NavigationMenuItem[] = [
    {
      label: t("chats.recent"),
      type: "label",
    },
  ];
  const recents: any = recentChats.value
    .filter((item) => !item.pin)
    .map((item) => {
      return {
        label: item.title,
        to: `/ai-chats/c/${item.id}`,
        value: item.id,
      };
    });

  items.push(...recents);

  return [items];
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
          onPin(item.value);
        }
      },
    },
    {
      label: t("drive.changName"),
      icon: "lucide:pencil",
      onSelect() {
        console.log("press Rename:", item);
        if (item.value) {
          onOpenChangeNameDiaolog(item.value);
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
          await onDeleteChat(item.value);
        }
      },
    },
  ],
];
const getPinDropdownItems = (item: any): DropdownMenuItem[][] => [
  [
    {
      label: t("chats.unfavorite"),
      icon: "lucide:star-minus",
      color: "warning",
      onSelect() {
        console.log("press UnStar menu:", item);
        console.log("ID menu:", item.value);
        if (item.value) {
          onUnPin(item.value);
        }
      },
    },
    {
      label: t("drive.changName"),
      icon: "lucide:pencil",
      onSelect() {
        console.log("press Rename:", item);
        if (item.value) {
          onOpenChangeNameDiaolog(item.value);
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
          await onDeleteChat(item.value);
        }
      },
    },
  ],
];

const onOpenChangeNameDiaolog = (chatId: string) => {
  const item = getItemById(chatId);
  if (item) {
    changeNameModal.value = true;
    renameChat.value = { ...item };
    console.log("onOpenChangeNameDiaolog", item);
  }
};

const renameChatSubmit = async () => {
  if (renameChat.value && renameChat.value.id) {
    console.log("renameChat", renameChat.value);
    updating.value = true;
    await onRenameChat(renameChat.value);
    changeNameModal.value = false;
    updating.value = false;
    renameChat.value = undefined;
  }
};
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="ai"
      v-model:open="open"
      collapsible
      resizable
      :class="
        appLayout == 'boxed'
          ? 'border-r-0 py-4 dark:[--ui-bg-elevated:var(--ui-color-neutral-900)]'
          : ''
      "
      :ui="{ footer: 'lg:border-t lg:border-default' }"
      :menu="{ inset: true }"
    >
      <template #header="{ collapsed }">
        <!-- <TeamsMenu :collapsed="collapsed" /> -->
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
        <UNavigationMenu
          :collapsed="collapsed"
          :items="items"
          orientation="vertical"
          highlight
          tooltip
          popover
          class="overflow-x-hidden"
        >
        </UNavigationMenu>

        <template v-if="!firstLoaded">
          <USkeleton
            v-for="(item, index) in 5"
            :key="index"
            class="h-4 w-full"
          />
        </template>
        <template v-else>
          <UNavigationMenu
            v-if="pinItems.length > 0"
            :collapsed="collapsed"
            :items="pinItems"
            orientation="vertical"
            highlight
            tooltip
            popover
            class="overflow-x-hidden"
          >
            <template #item-trailing="{ item }">
              <div
                class="flex -mr-1.5 -my-0.5 translate-x-full group-hover:translate-x-0 has-data-[state=open]:translate-x-0 transition-transform"
              >
                <UDropdownMenu
                  :items="getPinDropdownItems(item)"
                  :content="{ align: 'start' }"
                  :modal="false"
                  size="xs"
                >
                  <UButton
                    as="div"
                    icon="lucide:more-vertical"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    class="text-muted hover:text-highlighted hover:bg-accented/50 data-[state=open]:bg-accented/50 mr-1.5 rounded-full"
                  />
                </UDropdownMenu>
              </div>
            </template>
          </UNavigationMenu>
          <UNavigationMenu
            v-if="recentItems.length > 0"
            :collapsed="collapsed"
            :items="recentItems"
            orientation="vertical"
            highlight
            tooltip
            popover
            class="overflow-x-hidden"
          >
            <template #item-trailing="{ item }">
              <div
                class="flex -mr-1.5 -my-0.5 translate-x-full group-hover:translate-x-0 has-data-[state=open]:translate-x-0 transition-transform"
              >
                <UDropdownMenu
                  :items="getDropdownItems(item)"
                  :content="{ align: 'start' }"
                  :modal="false"
                  size="xs"
                >
                  <UButton
                    as="div"
                    icon="lucide:more-vertical"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    class="text-muted hover:text-highlighted hover:bg-accented/50 data-[state=open]:bg-accented/50 mr-1.5 rounded-full"
                  />
                </UDropdownMenu>
              </div>
            </template>
          </UNavigationMenu>
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
  <LazyChatRenameForm v-if="changeNameModal" v-model="renameChat" v-model:open="changeNameModal" :loading="updating" @on-submit="renameChatSubmit" />
</template>
