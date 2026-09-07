<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { ChatMesageFocusableId } from "~/libs/constants";
import type { ApiResponse, LabelValue } from "~/types/common";
import type { GroupChatMsg, IdType } from "~/types/models";

const {
  showHeader = true,
  square = false,
  inputAvata = true,
  scrollAreaHeight = "65vh",
  miniChat = false,
  miniminze = false,
  id,
  bordered = true,
} = defineProps<{
  id: string;
  showHeader?: boolean;
  square?: boolean;
  inputDense?: boolean;
  inputAvata?: boolean;
  scrollAreaHeight?: string;
  miniChat?: boolean;
  miniminze?: boolean;
  bordered?: boolean;
}>();
const emit = defineEmits<{
  "toggle-mute": [chatId: number];
  "toggle-pin": [chatId: number];
  "toggle-fav": [chatId: number];
  "toggle-chat": [chatId: number];
  "delete-chat": [chatId: number];
  "leave-group": [chatId: number];
  "on-close": [chatId: number];
}>();

const dataList = ref<GroupChatMsg[]>([]);
const { t } = useLang();
const { onSetMessageFocus } = useAppChat();
const infiniteRef = useTemplateRef<any>("infiniteRef");
const totalItems = 100;
const items = ref<LabelValue<any>[]>([]);
const page = ref(1);
const limit = 20;
const hasMore = ref(true);
const isFetching = ref(false);

const isScrollingoToTop = ref(false);
const fetchMoreData = async () => {
  console.log("fetchMoreData > Fetching older messages...");
  if (isFetching.value || !hasMore.value) return;
  const scrollEl = infiniteRef.value?.$el; // อ้างอิงถึงกล่อง Scroll
  const previousScrollHeight = scrollEl ? scrollEl.scrollHeight : 0;
  const previousScrollTop = scrollEl ? scrollEl.scrollTop : 0;

  isFetching.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const startId = totalItems - page.value * limit + 1;

  const newItems = Array.from({ length: limit }, (_, i) => {
    return {
      label: `Item ${startId + i}`,
      avatar: {
        src: getMockAvatarByIndex(i),
      },
    };
  });

  items.value.unshift(...newItems);

  hasMore.value = false;
  // if (startId <= 1) {
  //   hasMore.value = false;
  // } else {
  //   page.value++;
  // }

  await nextTick();

  if (scrollEl) {
    const heightDifference = scrollEl.scrollHeight - previousScrollHeight;

    scrollEl.scrollTo({
      top: previousScrollTop + heightDifference,
      behavior: "auto",
    });
  }
  setTimeout(() => {
    isFetching.value = false;
  }, 100);
};
const initData = async () => {
  isFetching.value = true;
  try {
    const messages = await $fetch<ApiResponse<GroupChatMsg>>(
      "/api/mock/chat/chatMessageListApi",
      { method: "GET" },
    );
    dataList.value = messages.dataList;

    await nextTick();

    // ดึง container element จาก infiniteRef (หรือ ref ของกล่องแชต)
    const container = infiniteRef.value?.$el || infiniteRef.value;
    if (!container) return;

    // สั่ง scroll ทันที 1 รอบ
    infiniteRef.value?.scrollToBottom();

    // ดักจับการเปลี่ยนแปลงขนาด (เช่น รูปโหลดเสร็จ, ฟอนต์มา)
    const observer = new ResizeObserver(() => {
      infiniteRef.value?.scrollToBottom();
    });

    observer.observe(container);

    // ปิด observer เมื่อผ่านช่วง initial render ไปสักครู่สั้นๆ
    setTimeout(() => observer.disconnect(), 300);
  } finally {
    isFetching.value = false;
  }
};
initData();

const reload = () => {
  items.value = [];
  page.value = 1;
  hasMore.value = true;
  initData();
};
const scrollingTop = (state: boolean) => {
  isScrollingoToTop.value = state;
};

const findMessageByID = (
  messageId: string,
): Promise<GroupChatMsg | undefined> => {
  return new Promise((resolve) => {
    const i = dataList.value.find((t) => t.id == messageId);
    resolve(i);
  });
};
const onReplyClick = async (messageId: string) => {
  if (!messageId || import.meta.server) {
    return;
  }
  const item = await findMessageByID(messageId);
  if (item != undefined) {
    const divId = `${ChatMesageFocusableId}-${messageId}`;
    const element = document.getElementById(divId);
    if (element) {
      element.scrollIntoView();
    }
    onSetMessageFocus("MESSAGE_FOCUS", item);
    // onScrollToItem(itemIndex, false);
  } else {
    console.log("Show Message Dialog" + ": " + messageId);
    // messageSelectdId.value = messageId;
    // showMessageDialog.value = true;
  }
};
</script>
<template>
  <div
    class="h-full flex flex-col min-h-0 rounded-t-lg gap-3"
    :class="[bordered && 'border border-default']"
  >
    <BaseInfiniteScroll
      ref="infiniteRef"
      :is-fetching="isFetching"
      :has-more="hasMore"
      scroll-class="flex-1 min-h-0 overflow-y-auto"
      direction="top"
      @load-more="fetchMoreData"
      @scrolling-top="scrollingTop"
    >
      <div class="relative flex flex-col gap-3 py-2">
        <!-- <UUser
          v-for="(item, index) in items"
          :key="index"
          :name="item.label"
          :avatar="item.avatar"
          size="xl"
        /> -->
        <ChatItem
          v-for="(item, index) in dataList"
          :key="index"
          :item="item"
          :index="index"
          :miniChat="miniChat"
          @on-focus-message-reply="onReplyClick"
        />

        <div v-if="isScrollingoToTop" class="sticky bottom-4 self-center z-10">
          <UButton
            icon="lucide:arrow-down"
            class="rounded-full shadow-md"
            @click="infiniteRef?.scrollToBottom()"
          />
        </div>
      </div>
    </BaseInfiniteScroll>
    <div v-if="!miniChat" class="shrink-0 mb-4 px-4">
      <UChatPrompt
        :placeholder="$t('ai.promtLabel')"
        color="primary"
        variant="subtle"
        class="[view-transition-name:chat-prompt]"
        :ui="{ base: 'px-1.5' }"
      >
        <template #footer>
          <div class="flex items-center gap-1">
            <UButton size="sm" icon="lucide:plus" />
          </div>

          <UChatPromptSubmit size="sm" color="primary" variant="solid" />
        </template>
      </UChatPrompt>
    </div>
  </div>
</template>
