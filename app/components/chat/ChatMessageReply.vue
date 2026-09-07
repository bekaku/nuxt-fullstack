<!-- ChatMessageReply.vue -->
<script setup lang="ts">
import type { GroupChatMsg } from '~/types/models';

const { item, isMine = false } = defineProps<{
  item: GroupChatMsg;
  isMine?: boolean;
}>();

const emit = defineEmits<{
  "on-click": [value: string];
}>();

const ontap = () => {
  if (item?.id) {
    emit("on-click", String(item.id));
  }
};
</script>

<template>
  <div
    class="w-full flex items-stretch gap-2 px-2.5 py-1.5 mb-2 rounded-md cursor-pointer select-none transition-opacity hover:opacity-90 active:scale-[0.99] text-left border-l-[3px]"
    :class="[
      isMine
        ? 'bg-black/15 text-white border-l-white/80'
        : 'bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-100 border-l-primary'
    ]"
    @click="ontap"
  >
    <!-- Avatar / Icon เล็ก -->
    <div class="flex items-center shrink-0">
      <UAvatar
        v-if="item.sendUser?.avatar?.thumbnail"
        :src="item.sendUser?.avatar?.thumbnail"
        size="xs"
      />
      <Icon
        v-else
        name="lucide:reply"
        class="w-3.5 h-3.5 opacity-70"
      />
    </div>

    <!-- Content Preview -->
    <div class="min-w-0 flex-1 flex flex-col justify-center">
      <span
        class="text-[11px] font-semibold truncate leading-tight"
        :class="isMine ? 'text-white' : 'text-primary dark:text-primary-400'"
      >
       <Icon
          name="lucide:reply"
          class="w-3 h-3 shrink-0"
          :class="[!isMine ? 'text-primary' : 'text-white']"
        />
        {{ item.sendUser?.email }}
      </span>

        <BaseContentText
         :class="['text-xs leading-normal truncate opacity-85', ]"
          :text-class="isMine ? 'text-white/90' : 'text-neutral-600 dark:text-neutral-300'"
          :rows="1"
          :content="item.chatMsg || item.chatMessageType"
          :show-more="false"
          :urlify="false"
        />

    </div>
  </div>
</template>
