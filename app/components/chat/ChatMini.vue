<script setup lang="ts">
import type { GroupChat } from "~/types/models";

const {
  chatHistory,
  miniChatGroupId,
  openMiniChatPage,
  miniChatMinimize,
  onCloseMiniChatPage,
} = useAppChat();

const groupId = ref<string>();
const groupItem = ref<GroupChat>();
const firstLoad = ref(false);
const loading = ref(true);

const onLoad = async () => {
  firstLoad.value = false;
  if (groupId.value) {
    await onLoadGroupData();
  }
  firstLoad.value = true;
};

const findOneChat = async (
  id: bigint | string,
): Promise<GroupChat | undefined> => {
  if (!miniChatGroupId.value) {
    return;
  }
  return chatHistory.value.find((item) => item.id === id);
};
const onLoadGroupData = async () => {
  loading.value = true;
  if (!groupId.value) {
    loading.value = false;
    return;
  }
  const res = await findOneChat(groupId.value);
  if (res) {
    groupItem.value = res;
  }
  loading.value = false;
};

const onGoToChatPage = () => {
  if (!groupItem.value) {
    return;
  }
  navigateTo(`/chats/g/${groupItem.value.id}`);
  onClose();
};
const onClearConversation = () => {
  groupItem.value = undefined;
  groupId.value = undefined;
};
const onClose = () => {
  onClearConversation();
  onCloseMiniChatPage();
};

onBeforeUnmount(() => {
  onClose();
});

watch(miniChatGroupId, (state) => {
  if (
    state &&
    openMiniChatPage.value &&
    groupId.value != miniChatGroupId.value
  ) {
    onClearConversation();
    groupId.value = miniChatGroupId.value;
    onLoad();
  }
});
</script>
<template>
  <div
    v-if="openMiniChatPage && groupId && miniChatGroupId"
    class="fixed bottom-0 right-16 w-80 sm:w-84 bg-white dark:bg-neutral-900 rounded-t-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col z-50 transition-all duration-300 ease-in-out font-sans"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer select-none rounded-t-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
    >
      <!-- User Info -->
      <div class="flex items-center gap-2">
        <div class="relative">
          <ChatAvatar
            v-if="groupItem"
            :item="groupItem"
            size="sm"
            :show-pin="false"
          />
        </div>
        <div class="flex items-center gap-1">
          <span
            v-if="groupItem"
            class="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[120px]"
          >
            {{
              `${groupItem.chatType == "GROUP" ? "(" + groupItem.totalMembers + ") " : ""}${
                groupItem.groupName ? groupItem.groupName : "Untitled Group"
              }`
            }}
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="w-3.5 h-3.5 text-neutral-500 transition-transform duration-200"
            :class="{ 'rotate-180': miniChatMinimize }"
          />
        </div>
      </div>

      <!-- Header Controls -->
      <div class="flex items-center gap-0.5" @click.stop>
        <UButton
          color="primary"
          variant="ghost"
          size="xs"
          class="rounded-full"
          icon="lucide:external-link"
          @click="onGoToChatPage"
        />
        <UButton
          color="primary"
          variant="ghost"
          size="xs"
          class="rounded-full"
          :icon="miniChatMinimize ? 'i-lucide-maximize-2' : 'i-lucide-minus'"
          @click="miniChatMinimize = !miniChatMinimize"
        />
        <UButton
          color="primary"
          variant="ghost"
          size="xs"
          icon="i-lucide-x"
          class="rounded-full"
          @click="onClose"
        />
      </div>
    </div>

    <!-- Collapsible Messages & Input -->
    <div
      class="grid transition-all duration-300 ease-in-out"
      :class="
        miniChatMinimize
          ? 'grid-rows-[0fr] opacity-0'
          : 'grid-rows-[1fr] opacity-100'
      "
    >
      <div class="overflow-hidden flex flex-col">
        <!-- Message Viewport -->
        <div
          class="h-125 p-3 overflow-y-auto flex flex-col gap-3 text-xs bg-white dark:bg-neutral-900"
        >
          <ChatContent
            v-if="groupId && groupItem && isNumericOnly(groupId)"
            :id="groupId"
            :bordered="false"
            miniChat
          />
        </div>
      </div>
      <div
        v-if="!miniChatMinimize"
        class="px-2 py-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1"
      >
        <div
          class="flex items-center gap-0.5 text-purple-600 dark:text-purple-400 shrink-0"
        >
          <UButton
            icon="lucide:plus"
            size="sm"
            variant="ghost"
            class="rounded-full"
          />
        </div>

        <div class="relative flex-1">
          <UTextarea
            variant="soft"
            :placeholder="$t('ai.promtLabel')"
            :maxrows="4"
            :rows="1"
            autoresize
            class="w-full rounded-4xl bg-neutral-100 dark:bg-neutral-700"
          />

          <UButton
            icon="lucide:face-slightly-smiling"
            size="sm"
            variant="ghost"
            class="rounded-full absolute right-2 top-1/2 -translate-y-1/2"
          />
        </div>

        <UButton
          icon="lucide:thumbs-up"
          size="sm"
          variant="ghost"
          color="primary"
          class="rounded-full shrink-0"
        />
      </div>
    </div>
  </div>
</template>
