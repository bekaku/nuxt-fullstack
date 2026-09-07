<script setup lang="ts">
import type { ChatMessageType } from "~/types/common";
import type { AppUser, GroupChat } from "~/types/models";

const { showClose = false, chatWith } = defineProps<{
  showClose?: boolean;
  chatWith?: AppUser;
}>();
const emit = defineEmits<{
  "toggle-mute": [chatId: string | bigint];
  "toggle-pin": [chatId: string | bigint];
  "toggle-fav": [chatId: string | bigint];
  "on-close": [];
}>();
const { t } = useLang();
const activeTab = ref("MEDIA");
const tabsItems = [
  {
    label: t("chats.media"),
    value: "MEDIA",
  },
  {
    label: t("chats.files"),
    value: "FILE",
  },
];
const modelValue = defineModel<GroupChat>();
const showMember = ref(false);
const showFileDialog = ref(false);
const showFileDialogType = ref<ChatMessageType>("IMAGE");

const getProfileViewLink = computed(() => {
  if (!chatWith) {
    return "#";
  }
  return `/user/${chatWith.id}`;
});
const toggleMute = () => {
  if (!modelValue.value || !modelValue.value.id) {
    return;
  }
  emit("toggle-mute", modelValue.value.id);
};
const togglePin = () => {
  if (!modelValue.value || !modelValue.value.id) {
    return;
  }
  emit("toggle-pin", modelValue.value.id);
};
const toggleFav = () => {
  if (!modelValue.value || !modelValue.value.id) {
    return;
  }
  emit("toggle-fav", modelValue.value.id);
};
const onOpenFileDialog = (fileType: ChatMessageType) => {
  showFileDialogType.value = fileType;
  showFileDialog.value = true;
};

const mediaList = ref([
  "https://picsum.photos/300/300?random=1",
  "https://picsum.photos/300/300?random=2",
  "https://picsum.photos/300/300?random=3",
  "https://picsum.photos/300/300?random=4",
  "https://picsum.photos/300/300?random=5",
  "https://picsum.photos/300/300?random=6",
  "https://picsum.photos/300/300?random=7",
  "https://picsum.photos/300/300?random=8",
  "https://picsum.photos/300/300?random=9",
  "https://picsum.photos/300/300?random=10",
  "https://picsum.photos/300/300?random=11",
  "https://picsum.photos/300/300?random=12",
]);
</script>
<template>
  <div
    v-if="modelValue"
    class="w-full max-w-sm mx-auto flex flex-col items-center p-4 bg-white dark:bg-neutral-900 rounded-2xl"
  >
    <!-- User Avatar & Status -->
    <div class="relative mb-3">
      <!-- <UAvatar
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        alt="Esther Howard"
        size="3xl"
        class="rounded-md"
      /> -->
      <ChatAvatar
        :item="modelValue"
        size="3xl"
        rounded
        :show-pin="false"
        :ui="{ root: 'h-26 w-26' }"
      />
    </div>

    <!-- User Info -->
    <h3 class="text-base font-bold text-neutral-900 dark:text-white">
      Esther Howard
    </h3>
    <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
      Software engineer
    </p>

    <!-- Action Icons -->
    <div class="flex items-center text-neutral-500 dark:text-neutral-400 mb-4">
      <UTooltip :text="modelValue.pin ? t('chats.unpin') : t('chats.pin')">
        <UButton variant="ghost" class="rounded-full" size="sm">
          <UIcon :name="modelValue.pin ? 'lucide:pin' : 'lucide:pin-off'" class="text-primary" />
        </UButton>
      </UTooltip>
      <UTooltip :text="modelValue.favorite ? t('chats.unfavorite') : t('chats.favorite')">
        <UButton variant="ghost" class="rounded-full" size="sm">
           <UIcon :name="modelValue.favorite ? 'lucide:star' : 'lucide:star-off'" class="text-amber-500" />
        </UButton>
      </UTooltip>
      <UTooltip :text="modelValue.muteNotify ? t('chats.unmuteNotify') : t('chats.muteNotify')">
        <UButton variant="ghost" class="rounded-full" size="sm">
           <UIcon :name="modelValue.favorite ? 'lucide:volume-2' : 'lucide:volume-off'" />
        </UButton>
      </UTooltip>
    </div>

    <!-- Segmented Control / Tabs -->
    <div class="w-full p1 mb-4">
      <UTabs
        v-model="activeTab"
        :items="tabsItems"
        color="primary"
        variant="pill"
        size="sm"
        :content="false"
      />
    </div>

    <!-- 4x3 Media Grid -->
    <div
      v-if="activeTab === 'MEDIA'"
      class="w-full grid grid-cols-4 gap-2 mb-4"
    >
      <div
        v-for="(img, idx) in mediaList"
        :key="idx"
        class="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800"
      >
        <img
          :src="img"
          alt="Media item"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
          loading="lazy"
        />
      </div>
    </div>

    <div v-else class="w-full py-12 text-center text-sm text-neutral-400">
      No files found
    </div>

    <!-- See More Action Button -->
    <UButton variant="outline" color="neutral" block size="lg">
      <div class="w-full flex gap-2 justify-center">
        {{ `${$t("base.seeMore")} (+${readableNumber(1999)})` }}
        <Icon name="lucide:arrow-right" />
      </div>
    </UButton>
  </div>
</template>
