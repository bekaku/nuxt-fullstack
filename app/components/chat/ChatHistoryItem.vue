<script setup lang="ts">
import type { GroupChat } from "~/types/models";

const { item, isHistoryItem=true } = defineProps<{
  item: GroupChat;
  index: number;
  collapsed?: boolean;
  isActive?: boolean;
  isHistoryItem?: boolean;
}>();
const { getDateAutoFormatBy } = useDateFns();
const emit = defineEmits<{
  "on-click": [e: GroupChat];
}>();
const onClick = (e: any) => {
  emit("on-click", item);
};
</script>
<template>
  <BaseItem
    dense
    top
    button
    class="rounded-md"
    :class="{ 'bg-neutral-100 dark:bg-neutral-800': isActive }"
    @click="onClick"
  >
    <template #start>
      <ChatAvatar :item="item" :size="!collapsed ? 'xl' : '2xs'" />
    </template>

    <div v-if="!collapsed" class="flex flex-col items-start gap-0">
      <div class="flex flex-row gap-1 items-center">
        <Icon
          v-if="item?.favorite"
          name="bi:star-fill"
          class="text-amber-500 size-3"
        />
        <BaseContentText
          :rows="1"
          :content="`${item.chatType == 'GROUP' ? '(' + item.totalMembers + ') ' : ''}${
            item.groupName ? item.groupName : 'Untitled Group'
          }`"
          :text-class="!isHistoryItem ? 'font-medium':''"
          :show-more="false"
          :urlify="false"
        />
         <Icon
          v-if="!isHistoryItem && item?.muteNotify"
          name="lucide:volume-x"
          class="text-muted"
        />
      </div>
      <div
        v-if="isHistoryItem &&item.latestMessageType != 'LOCATION' && item.latestMessage"
        class="flex flex-row gap-1 w-full items-center"
      >
        <Icon
          v-if="item?.muteNotify"
          name="lucide:volume-x"
          class="text-muted"
        />
        <BaseContentText
          text-class="text-sm text-muted"
          :rows="1"
          :content="item.latestMessage"
          :show-more="false"
          :urlify="false"
        />
      </div>
    </div>

    <template v-if="!collapsed && isHistoryItem" #end>
      <div class="flex flex-col gap-2 items-end">
        <div v-if="item.latestUpdate" class="text-xs text-muted">
          {{
            getDateAutoFormatBy({
              date: item.latestUpdate,
              iso: false,
            })
          }}
        </div>
        <div>
          <UBadge
            v-if="item.totalNewMessage > 0"
            size="sm"
            variant="solid"
            color="error"
          >
            {{ item.totalNewMessage }}
          </UBadge>
        </div>
      </div>
    </template>
  </BaseItem>
</template>
