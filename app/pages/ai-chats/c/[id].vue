<script setup lang="ts">
import { ref } from "vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import type { AiChat, ChatSourceReference } from "~/types/models";
import type { DropdownMenuItem } from "@nuxt/ui";
import { isReasoningUIPart, isTextUIPart } from "ai";
definePageMeta({
  layout: "ai",
});

const { writeToClipboard } = useBase();
const { t } = useLang();
const { isDark } = useTheme();
const inputMessage = ref("");
const selectedFilters = ref([]);
const route = useRoute();
const chatId = computed(() => route.params.id as string);

const chatContainerRef = useTemplateRef("chatContainerRef");
const bottomAnchor = useTemplateRef("bottomAnchor");
const {
  conversationId,
  currentChat,
  messages,
  status,
  error,
  chatAction,
  chatActionItem,
  loadingMore,
  isLastPage,
  getItemById,
  sendMessage,
  stop,
  initialMessage,
  scrollToBottom,
  onRenameChat,
  onPin,
  onUnPin,
  onDeleteChat,
  loadMoreMessages,
} = useAiChat({
  bottomAnchor,
  chatContainerRef,
});
useSeoMeta({
  title: () => currentChat.value?.title || "New Chat",
});

const changeNameModal = ref(false);
const renameChat = ref<AiChat>();
const updating = ref(false);
const loadChatMessages = async () => {
  const id = chatId.value;
  if (id && id !== "new" && isNumericOnly(id)) {
    conversationId.value = id;
    await initialMessage();
    scrollToBottom();
  }
};

watch(
  chatId,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await loadChatMessages();
    }
  },
  { immediate: true },
);
const openThinking = ref<Record<string, boolean>>({});
const onSubmit = async () => {
  if (
    !inputMessage.value.trim() ||
    status.value === "submitted" ||
    status.value === "streaming"
  ) {
    return;
  }

  const msg = inputMessage.value;
  inputMessage.value = "";
  sendMessage(msg, selectedFilters.value);
};

const onReload = () => {};

const getSourceIcon = (source: ChatSourceReference) => {
  switch (source.type) {
    case "DATABASE_TABLE":
      return "i-lucide-database";
    case "DATABASE_QUERY":
      return "i-lucide-terminal";
    case "DOCUMENT":
    default:
      return "i-lucide-file-text";
  }
};
const getSourceLabel = (source: ChatSourceReference, index: number) => {
  switch (source.type) {
    case "DATABASE_TABLE":
      return source.schema
        ? `${source.schema}.${source.tableName}`
        : (source.tableName ?? "Table");
    case "DATABASE_QUERY":
      if (!source.query) return "SQL Query";
      return source.query.length > 25
        ? `${source.query.slice(0, 25)}...`
        : source.query;
    case "DOCUMENT":
    default:
      return (
        source.fileName ?? source.title ?? `${t("ai.source")} ${index + 1}`
      );
  }
};
const getSourceTooltip = (source: ChatSourceReference) => {
  if (source.type === "DATABASE_QUERY") return source.query;
  if (source.type === "DATABASE_TABLE")
    return `${source.schema}.${source.tableName}`;
  return source.fileName;
};

const onCopyMessage = (event: any, item: any) => {
  console.log("onCopyMessage", item);
  if (item?.parts?.length > 0) {
    const part = item?.parts[0];
    if (part?.text) {
      writeToClipboard(part.text);
    }
  }
};

const onOpenChangeNameDiaolog = () => {
  if (!currentChat.value) {
    return;
  }
  changeNameModal.value = true;
  renameChat.value = { ...currentChat.value };
};
const renameChatSubmit = async () => {
  if (!renameChat.value) {
    return;
  }
  updating.value = true;
  await onRenameChat(renameChat.value);
  changeNameModal.value = false;
  updating.value = false;
  renameChat.value = undefined;
};
watch(
  () => chatAction.value,
  () => {
    console.log(
      "watch chatAction.value",
      chatAction.value,
      chatActionItem.value,
    );
    if (currentChat.value && chatAction.value && chatActionItem.value) {
      if (conversationId.value === chatActionItem.value.id) {
        if (chatAction.value == "delete") {
          chatAction.value = undefined;
          chatActionItem.value = undefined;
          navigateTo("/ai-chats/c/new");
        } else if (chatAction.value == "rename") {
          currentChat.value.title = chatActionItem.value.title;
          setTimeout(() => {
            chatAction.value = undefined;
            chatActionItem.value = undefined;
          }, 100);
        }
      }
    }
  },
);

const getDropdownItems = (): DropdownMenuItem[][] => [
  [
    {
      label: currentChat.value?.pin
        ? t("chats.unfavorite")
        : t("chats.favorite"),
      icon: currentChat.value?.pin ? "lucide:star-minus" : "lucide:star",
      color: currentChat.value?.pin ? "warning" : "neutral",
      onSelect() {
        console.log("press Star menu:", currentChat.value);
        console.log("ID menu:", currentChat.value?.id);
        if (currentChat.value?.id) {
          if (!currentChat.value.pin) {
            onPin(currentChat.value.id as string);
          } else {
            onUnPin(currentChat.value.id as string);
          }
        }
      },
    },
    {
      label: t("drive.changName"),
      icon: "lucide:pencil",
      onSelect() {
        onOpenChangeNameDiaolog();
      },
    },
  ],
  [
    {
      label: t("base.delete"),
      icon: "i-lucide-trash",
      color: "error",
      async onSelect() {
        console.log("press Delete :", currentChat.value);
        if (currentChat.value?.id) {
          await onDeleteChat(currentChat.value.id as string);
        }
      },
    },
  ],
];
</script>

<template>
  <BaseDashboardPanel
    id="ai-chats"
    :title="currentChat?.title || 'New chat'"
    class="relative min-h-0"
    :ui="{ body: 'p-0 sm:p-0 overscroll-none' }"
    body-class="w-full max-w-[1440px] mx-auto  flex flex-col flex-1 min-h-0"
    navbar-transparent
  >
    <template #navbarRight>
      <UDropdownMenu
        v-if="currentChat"
        :items="getDropdownItems()"
        :content="{ align: 'start' }"
        :modal="false"
        size="xs"
      >
        <UButton variant="ghost" icon="lucide:more-vertical" />
      </UDropdownMenu>
    </template>
    <div class="flex flex-1 justify-center min-h-0">
      <div
        ref="chatContainerRef"
        class="w-full min-w-0 max-w-3xl flex flex-col gap-4 sm:gap-6 px-4"
      >
        <BaseLoadmore
          v-if="currentChat && currentChat.id"
          :disabled="isLastPage || loadingMore"
          :loading="loadingMore"
          icon="lucide:chevron-up"
          @on-next="loadMoreMessages"
        />
        <UChatMessages
          ref="chatRef"
           :ui="{
            autoScroll: 'mb-15',
          }"
          :assistant="{
            variant: 'naked',
            actions: [
              {
                label: $t('base.copyToClipboard'),
                icon: 'i-lucide-copy',
                onClick: onCopyMessage,
              },
            ],
          }"
          :user="{
            variant: 'subtle',
            actions: [
              {
                label: $t('base.copyToClipboard'),
                icon: 'i-lucide-copy',
                onClick: onCopyMessage,
              },
            ],
          }"
          should-auto-scroll
          should-scroll-to-bottom
          :messages="messages as any[]"
          :status="status"
        >
          <template #indicator>
            <div class="flex items-center gap-1.5">
              <ChatIndicator />
              <UChatShimmer :text="`${$t('ai.thinking')}...`" class="text-sm" />
            </div>
          </template>

          <template #content="{ message }">
            <!-- หุ้มด้วย div flex-col เพื่อให้เรียงจากบนลงล่าง -->
            <div class="flex flex-col">
              <!-- 1. ดึงเฉพาะส่วน Reasoning มาแสดงก่อน (บังคับอยู่บนสุด) -->
              <template
                v-for="(part, i) in message.parts"
                :key="`think-${message.id}-${i}`"
              >
                <UCollapsible
                  v-if="isReasoningUIPart(part)"
                  :open="openThinking[message.id] ?? part.state !== 'done'"
                  @update:open="(val) => (openThinking[message.id] = val)"
                  class="mb-2"
                >
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-chevron-down"
                    :ui="{
                      trailingIcon:
                        'group-data-[state=open]:rotate-180 transition-transform',
                    }"
                  >
                    <UChatShimmer
                      v-if="part.state !== 'done'"
                      :text="`${$t('ai.thinking')}...`"
                    />
                    <span v-else>{{ $t("ai.thinkingShow") }}</span>
                  </UButton>
                  <template #content>
                    <div
                      class="text-sm text-muted/60 border-l-2 border-default pl-3 py-1 my-2 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0 [&_strong]:font-medium"
                    >
                      <MdPreview
                        :modelValue="part.text"
                        :theme="isDark ? 'dark' : 'light'"
                        language="en-US"
                        preview-theme="github"
                        code-theme="github"
                        :show-code-row-number="true"
                        class="think-mode-preview bg-transparent!"
                      />
                    </div>
                  </template>
                </UCollapsible>
              </template>

              <!-- 2. ดึงเฉพาะส่วน Text มาแสดง (บังคับอยู่ตรงกลาง) -->
              <template
                v-for="(part, i) in message.parts"
                :key="`text-${message.id}-${i}`"
              >
                <div
                  v-if="isTextUIPart(part)"
                  class="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-p:first:mt-0 prose-p:last:mb-0 prose-pre:my-2 prose-ul:my-1.5 prose-ol:my-1.5"
                >
                  <MdPreview
                    :modelValue="part.text"
                    :theme="isDark ? 'dark' : 'light'"
                    language="en-US"
                    preview-theme="github"
                    code-theme="github"
                    :show-code-row-number="true"
                    class="bg-transparent!"
                    :code-foldable="false"
                  />
                </div>
              </template>

              <!-- 3. ดึงเฉพาะส่วน Sources มาแสดง (บังคับอยู่ล่างสุด) -->
              <template
                v-for="(part, i) in message.parts"
                :key="`sources-${message.id}-${i}`"
              >
                <div
                  v-if="part.type === 'data-sources'"
                  class="mt-3 flex flex-wrap gap-1.5"
                >
                  <UBadge
                    v-for="(source, si) in part.data"
                    :key="si"
                    :icon="getSourceIcon(source)"
                  >
                    {{ getSourceLabel(source, si) }}
                  </UBadge>
                </div>
              </template>
            </div>
          </template>
        </UChatMessages>
        <div
          ref="bottomAnchor"
          class="h-px w-full opacity-0 shrink-0 "
        ></div>
        <div class="sticky bottom-0 z-10 pb-4 sm:pb-6">
          <UChatPrompt
            v-model="inputMessage"
            :placeholder="$t('ai.promtLabel')"
            :error="error"
            color="primary"
            variant="subtle"
            class="[view-transition-name:chat-prompt]"
            :ui="{ base: 'px-1.5' }"
            @submit="onSubmit"
          >
            <template #footer>
              <div class="flex items-center gap-1">
                <UButton size="sm" icon="lucide:search" />
              </div>

              <UChatPromptSubmit
                :status="status"
                size="sm"
                color="primary"
                variant="solid"
                @stop="stop()"
                @reload="onReload()"
              />
            </template>
          </UChatPrompt>

          <p class="text-center text-xs text-muted mt-2">
            {{ $t("ai.aiMistakeable") }}
          </p>
        </div>
      </div>
    </div>
  </BaseDashboardPanel>

  <LazyChatRenameForm
    v-if="changeNameModal"
    v-model="renameChat"
    v-model:open="changeNameModal"
    :loading="updating"
    @on-submit="renameChatSubmit"
  />
</template>
<style>
.md-editor,
.md-editor-preview,
.md-editor-preview p,
.md-editor-preview span,
.md-editor-preview li,
.md-editor-preview h1,
.md-editor-preview h2,
.md-editor-preview h3,
.md-editor-preview h4,
.md-editor-preview h5,
.md-editor-preview h6 {
  font-family: inherit !important;
}
.md-editor-code-head {
  z-index: 1 !important;
}
.md-editor-preview pre,
.md-editor-preview code {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace !important;
}
.md-editor-preview-wrapper {
  padding: 0 !important;
}
.md-editor {
  background-color: transparent !important;
}
.md-editor-dark {
  --md-bk-color: transparent !important;
}

.think-mode-preview .md-editor-preview {
  font-size: 0.85rem !important;
  color: #9ca3af !important;
  line-height: 1.6 !important;
}

.think-mode-preview .md-editor-preview pre {
  opacity: 0.8 !important;
}

.dark .think-mode-preview .md-editor-preview {
  color: #6b7280 !important;
}
</style>
