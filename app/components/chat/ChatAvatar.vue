<script setup lang="ts">
import type { AvatarProps } from "@nuxt/ui";
import type { GroupChat } from "~/types/models";

const { size = "xl" , showPin=true, rounded=false} = defineProps<{
  item?: GroupChat;
  size?: AvatarProps["size"];
  showPin?: boolean;
  rounded?: boolean;
  ui?:AvatarProps['ui']
}>();
const emit = defineEmits<{
  "on-click": [e: any];
}>();
const onAvtarClick = (e: any) => {
  emit("on-click", e);
};
</script>
<template>
  <div v-if="item" class="relative flex">
    <UAvatar
      :src="item?.dtoAvatar?.thumbnail || getMockAvatarByIndex(item.id as any)"
      :size="size"
      class="shrink-0"
      :class="[!rounded?'rounded-full':'rounded-md']"
      loading="lazy"
      :chip="
        item.online
          ? {
              inset: true,
              color: 'success',
            }
          : undefined
      "
      :ui="ui"
      @click="onAvtarClick"
    />
    <UAvatar
      v-if="showPin && item.pin"
      icon="lucide:pin"
      class="absolute rotate-45"
      color="primary"
      :ui="{icon:'size-3.5'}"
      size="2xs"
      :style="{  right: '-10px', bottom: '-1px' }"
    />
    <!-- <Icon
      v-if="item.pin"
      class="absolute text-amber-500 p-2 rounded-full bg-primary"
      name="bi:pin-angle-fill"
      :style="{ height: '14px', width: '14px', right: '-2px', bottom: '-1px' }"
    /> -->
  </div>
</template>
