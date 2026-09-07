<script setup lang="ts">
import { ChatMesageFocusableId } from "~/libs/constants";
import type { FileManager, GroupChatFile, GroupChatMsg } from "~/types/models";

const {
  showSendAvatar = false,
  item,
  index,
  miniChat = false,
} = defineProps<{
  item: GroupChatMsg;
  index: number;
  showSendAvatar?: boolean;
  miniChat?: boolean;
}>();
const emit = defineEmits<{
  "on-save-all": [files: GroupChatFile[]];
  "on-media-tap": [file: GroupChatFile, index: number];
  "on-focus-message-reply": [id: string];
}>();
const { t } = useLang();
const { formatDateTime } = useDateFns();
const { isDark } = useTheme();
const { chatAction, chatActionMessage, onClearMessageFocus } = useAppChat();
const isFocus = ref(false);
const messageFocusTimeout = ref<any>(null);
const isMine = computed(() => {
  if (!item) {
    return false;
  }
  return item.sent;
});

const isMutedMessage = computed(
  () =>
    item.unsend ||
    item.chatMessageType == "LEAVE" ||
    item.chatMessageType == "INVITE",
);

const isBgTransparent = computed(
  () =>
    getImageItems.value.length > 0 &&
    !item.chatMsg &&
    getFilesItems.value.length == 0,
);
const messageTextColor = computed(() => {
  if (isMutedMessage.value) {
    return isDark.value ? "text-neutral-400" : "text-neutral-400";
  }
  return item.sent
    ? "text-white" //text-neutral-950
    : isDark.value
      ? "text-white"
      : "text-neutral-950";
});
const messageBg = computed(() => {
  if (isMutedMessage.value) {
    return isDark.value ? "bg-neutral-600" : "bg-neutral-200";
  }
  if (isBgTransparent.value) {
    // return 'bg-transparent';
  }
  return item.sent
    ? "bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/20" //bg-primary-500
    : "bg-neutral-100 dark:bg-neutral-800";
  // return item.sent
  //   ? "bg-primary-500 dark:bg-primary-100" //bg-primary-500
  //   : "bg-neutral-100 dark:bg-neutral-800"
});
const senderName = computed(() => {
  return item.sendUser?.username || "Unknown User";
});
const avatarSrc = computed(() => {
  return item.sendUser?.avatar?.thumbnail || "https://i.pravatar.cc/150";
});
const formattedTime = computed(() => {
  if (!item.msgDateTime) {
    return "";
  }
  // Combine them into the exact requested format: "DD/MM/YYYY HH:mm"
  return formatDateTime({
    date: item.msgDateTime,
  });
});
const statusText = computed(() => {
  if (item.unsend) return t("chats.unsend");
  if (item.readCount > 0) return t("chats.readBy", [item.readCount]);
  if (item.sent) return t("chats.delivered");
  return "";
});
// --- Media Grid Logic ---
const getImageItems = computed(() => {
  if (!item?.files || item.files.length == 0) {
    return [];
  }
  const files = item.files.filter(
    (f) => f.fileManager && f.fileManager.fileMimeType == "IMAGE",
  );
  if (files.length > 0) {
    return files.map((f) => f.fileManager!);
  }
  return [];
});
const getFilesItems = computed<FileManager[]>(() => {
  if (!item?.files || item.files.length == 0) {
    return [];
  }
  const files = item.files.filter(
    (f) => f.fileManager && f.fileManager.fileMimeType != "IMAGE",
  );

  if (files.length > 0) {
    return files.map((f) => f.fileManager!);
  }
  return [];
});
const hasFiles = computed(() => {
  if (!item || !item.files || item.files.length == 0) {
    return false;
  }
  return getFilesItems.value.length > 0;
});

const hasFilesImage = computed(() => {
  if (!item || !item.files || item.files.length == 0) {
    return false;
  }
  return getImageItems.value.length > 0;
});
const displayFilesImage = computed(() => {
  if (!getImageItems.value) return [];
  // Take maximum of 4 files for the grid
  return getImageItems.value.slice(0, 4);
});
const extraFilesImageCount = computed(() => {
  if (!getImageItems.value) return 0;
  // If there are more than 4 files, calculate the remainder
  return Math.max(0, getImageItems.value.length - 4);
});
// Set a fixed width container for the grid to ensure perfect squares
// Adjust '240px' based on your layout constraints
const gridWidth = computed(() => {
  if (!getImageItems.value) return "auto";
  const count = getImageItems.value.length;
  return count >= 2 ? "240px" : "160px";
});
const gridCol = computed(() => {
  if (!getImageItems.value) return "auto";
  const count = getImageItems.value.length;
  return count >= 2
    ? "grid grid-cols-2 md:grid-cols-2 gap-0.5"
    : "grid grid-cols-1 md:grid-cols-1 gap-0";
});
const getGridItemStyle = (index: number) => {
  const count = displayFilesImage.value.length;

  // Single image: full width
  if (count === 1) {
    return { width: "100%", height: "160px" };
    // return { width: '160px', height: '160px' };
  }

  // 2 or more images: 2 columns
  return {
    width: "calc(50% - 2px)",
    height: "118px",
    // marginBottom: index < 2 ? '4px' : '0',
  };
  // return {
  //   width: '118px',
  //   height: '118px',
  //   marginBottom: index < 2 ? '4px' : '0',
  // };
};

// --- Event Handlers ---
const onSaveAll = () => {
  if (item.files) {
    console.log("onSaveAll");
    emit("on-save-all", item.files);
  }
};
const onMediaTap = (file: GroupChatFile, index: number) => {
  console.log("onMediaTap", file);
  emit("on-media-tap", file, index);
};
const onFileTap = (file: GroupChatFile, index: number) => {
  console.log("onFileTap", file);
};
const onUserTap = (e: any) => {
  console.log("onUserTap", e);
};
const onOptionsTap = (e: any) => {
  console.log("onOptionsTap", e);
};
const onEmojiTap = (e: any) => {
  console.log("onEmojiTap", e);
};
const handleLongpressText = (e: any) => {
  console.log("handleLongpressText", e);
};
const onReplyClick = (messageId: string) => {
  emit("on-focus-message-reply", messageId);
};
const setMessageFucusAsync = (active: boolean) => {
  return new Promise((resolve) => {
    messageFocusTimeout.value = setTimeout(() => {
      isFocus.value = active;
      resolve(true);
    }, 500);
  });
};
const onMessageFocus = async () => {
  isFocus.value = true;
  await setMessageFucusAsync(false);
  await setMessageFucusAsync(true);
  await setMessageFucusAsync(false);
  await setMessageFucusAsync(true);
  await setMessageFucusAsync(false);
  clearTimeout(messageFocusTimeout.value);
  messageFocusTimeout.value = null;
  onClearMessageFocus();
};
watch(
  () => chatAction.value,
  () => {
    if (item && chatAction.value && chatActionMessage.value) {
      if (item.id === chatActionMessage.value.id) {
        if (chatAction.value == "MESSAGE_FOCUS") {
          onMessageFocus();
        }
      }
    }
  },
);
</script>
<template>
  <div
    v-bind="$attrs"
    v-if="item && index != undefined"
    :id="`${ChatMesageFocusableId}-${item.id}`"
    class="w-full flex flex-col"
  >
    <!-- <ChatMessageReply
      v-if="item.dtoReplyTo && !item.unsend"
      :item="item.dtoReplyTo"
      :sent="item.sent"
      @on-click="onReplyClick"
    /> -->
    <div
      class="w-full flex flex-row mb-4 px-4"
      :class="isMine ? 'justify-end pr-8' : 'justify-start'"
    >
      <UAvatar
        v-if="!isMine"
        :src="avatarSrc"
        :fallback="item.id + ''"
        class="w-8 h-8 rounded-full mr-3 shrink-0"
        loading="lazy"
        @click="onUserTap"
      />
      <div
        v-if="isMine && !isMutedMessage"
        class="flex flex-row items-end gap-1 mr-1 self-end mb-6"
      >
        <UButton
          icon="lucide:heart"
          variant="ghost"
          size="sm"
          class="rounded-full"
          @click="onEmojiTap"
        />
        <UButton
          icon="lucide:more-vertical"
          variant="ghost"
          size="sm"
          class="rounded-full"
          @click="onOptionsTap"
        />
      </div>

      <div class="flex flex-col max-w-[75%]">
        <!-- <view
          class="flex flex-row items-center mb-1"
          :class="isMine ? 'justify-end' : 'justify-start'"
          :catchtap="onUserTap"
        >
          <text
            v-if="!isMine"
            class="text-sm font-semibold text-foreground mr-2"
          >
            {{ senderName }}
          </text>
        </view> -->
        <div
          class="p-3 flex flex-col"
          :class="[
            isMine ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm ',
            isFocus ? 'message-focus' : '',
            messageBg,
          ]"
        >
          <div
            class="flex flex-row items-center mb-2"
            :class="isMine ? 'justify-end' : 'justify-start'"
            :catchtap="onUserTap"
          >
            <div v-if="!isMine" class="text-sm font-bold app-text mr-2">
              {{ senderName }}
            </div>
          </div>

          <ChatMessageReply
            v-if="item.dtoReplyTo && !item.unsend"
            :item="item.dtoReplyTo"
            :sent="item.sent"
            :is-mine="isMine"
            @on-click="onReplyClick"
          />
          <BaseContentText
            class="mb-1"
            :text-class="messageTextColor"
            :content="item.chatMsg || ''"
            :show-more="false"
            :urlify="true"
          />

          <div
            v-if="hasFilesImage"
            :style="{ width: miniChat ? '100%' : gridWidth }"
          >
            <div class="flex w-full">
              <BaseFileItems
                :items="getImageItems"
                :format-size="false"
                :show-name="false"
                :show-size="false"
                :image-class="
                  !miniChat
                    ? 'w-full'
                    : getImageItems.length == 1
                      ? 'w-full'
                      : 'w-full h-20'
                "
                :grid-class="gridCol"
                :limit="4"
                show-view-dialog
              />
            </div>
          </div>

          <div
            v-if="hasFiles && getFilesItems.length > 0"
            class="flex flex-col gap-1"
            :style="{ width: 'auto' }"
          >
            <BaseFileItems
              :items="getFilesItems"
              :format-size="false"
              :bordered="false"
              :icon-class="!miniChat ? 'h-10 w-10' : 'h-10 w-10'"
              layout="list"
              show-view-dialog
            />
          </div>

          <div
            class="text-[11px]"
            :class="isMine ? 'text-primary-100' : 'text-muted'"
          >
            {{ formattedTime }}
          </div>
        </div>

        <div
          class="flex flex-row items-center mt-1"
          :class="isMine ? 'justify-end' : 'justify-between'"
        >
          <div class="text-xs text-muted">{{ statusText }}</div>

          <UButton
            v-if="!isMine && hasFilesImage"
            icon="lucide:download"
            variant="ghost"
            size="sm"
            class="rounded-full"
            @click="onSaveAll"
          >
            {{ $t("base.saveAll") }}
          </UButton>
        </div>
      </div>
      <div
        v-if="!isMine && !isMutedMessage"
        class="flex flex-row items-center gap-0 self-end mb-6"
      >
        <UButton
          icon="lucide:heart"
          variant="ghost"
          size="sm"
          class="rounded-full"
          @click="onEmojiTap"
        />
        <UButton
          icon="lucide:more-vertical"
          variant="ghost"
          size="sm"
          class="rounded-full"
          @click="onOptionsTap"
        />
      </div>

      <UAvatar
        v-if="showSendAvatar && isMine"
        :src="avatarSrc"
        :fallback="item.id + ''"
        class="w-8 h-8 rounded-full mr-3 shrink-0"
        loading="lazy"
        @click="onUserTap"
      />
    </div>
  </div>
</template>
<style scoped>
.message-focus {
  border: 2px solid #f59e0b;
}
</style>
