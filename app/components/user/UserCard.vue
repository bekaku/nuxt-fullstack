<script setup lang="ts">
import type { AvatarProps } from "@nuxt/ui";

const {
  height = "250px",
  avatarTop = "75px",
  avatarSize = "3xl",
  avatarFlat = false,
  flat = false,
} = defineProps<{
  avatar?: AvatarProps;
  avartarClass?: string;
  coverImage?: string | undefined;
  height?: string;
  avatarTop?: string;
  avatarFlat?: boolean;
  avatarSize?: AvatarProps["size"];
  descriptionStyle?: {
    [key: string]: string | number;
  };
  name?: string | undefined;
  description?: string | undefined;
  flat?: boolean;
}>();
</script>
<template>
  <div
    class="w-full overflow-hidden flex flex-col gap-2 border border-default rounded-lg"
  >
    <div
      class="w-full relative rounded-tl-lg rounded-tr-lg"
      :style="`height: ${height};
            background: url(${
              coverImage ? coverImage : '/images/cover.jpg'
            }), linear-gradient(to right, #000, #000);
            background-position: center;
            -webkit-background-size: cover;
            -moz-background-size: cover;
            -o-background-size: cover;
            background-size: cover;`"
    >
      <slot name="avatar">
        <UAvatar
          v-if="avatar != undefined"
          class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          :class="cssMerge(!avatarFlat ? 'shadow-sm' : '', avartarClass)"
          v-bind="{ ...avatar, size: avatar.size || avatarSize }"
          loading="lazy"
        />
      </slot>
    </div>
    <slot name="extra" />

    <div class="p-4" :style="descriptionStyle">
      <slot name="description">
        <div class="flex flex-col gap-2 text-center">
          <div class="w-full flex flex-col items-center justify-center">
            <div v-if="name" class="flex items-center gap-2">
              <h3 class="font-bold">
                {{ name }}
              </h3>
              <UIcon name="lucide:badge-check" class="text-primary" />
            </div>

            <p class="text-xs text-gray-500" v-if="description">
              {{ description }}
            </p>
          </div>

          <div class="flex justify-around">
            <div class="w-full flex flex-col items-center">
              <div class="font-bold">78</div>
              <div class="text-xs text-muted flex items-center gap-1">
                <UIcon name="lucide:gift" /> Gifts
              </div>
            </div>

            <div class="w-full flex flex-col items-center">
              <div class="font-bold">1.2k</div>
              <div class="text-xs text-muted flex items-center gap-1">
                <UIcon name="lucide:pencil" /> Posts
              </div>
            </div>

            <div class="w-full flex flex-col items-center">
              <div class="font-bold">7.5k</div>
              <div class="text-xs text-muted flex items-center gap-1">
                <UIcon name="lucide:message-square-more" /> Comments
              </div>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>
