<script setup lang="ts">
import type { GroupChat } from "~/types/models";

const { isChatNotificationsSlideoverOpen, onOpenMiniChat } = useAppChat();
const { chatHistory, isInitial, initHistoryData } = useAppChat();

const onClick = (item: GroupChat) => {
  console.log("onClick", item);
  isChatNotificationsSlideoverOpen.value = false;
  if (item && item.id) {
    onOpenMiniChat(item.id as string);
  }
};
onMounted(() => {
  if (chatHistory.value.length === 0) {
    initHistoryData();
  } else {
    isInitial.value = true;
  }
});
</script>
<template>
  <USlideover
    v-model:open="isChatNotificationsSlideoverOpen"
    :title="$t('chats.chats')"
  >
    <template #body>
      <template v-if="!isInitial">
        <div class="flex flex-col gap-3">
          <USkeleton class="h-8 w-15" />
          <USkeleton class="h-8 w-[75%]" />
          <USkeleton v-for="index in 15" :key="index" class="h-8 w-full" />
        </div>
      </template>
      <template v-else-if="chatHistory.length > 0">
        <div v-for="(item, index) in chatHistory" :key="`all-${item.id}`">
          <ChatHistoryItem :item="item" :index="index" @on-click="onClick" />
        </div>
      </template>
      <template v-else>
        <UEmpty
          variant="naked"
          icon="lucide:message-circle-more"
          :description="$t('chats.chatHistoryEmpty')"
        />
      </template>
    </template>
  </USlideover>
</template>
