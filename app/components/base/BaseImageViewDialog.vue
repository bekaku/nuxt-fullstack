<script setup lang="ts">
import type { FileManager, ImageDto, UserProfile } from "~/types/models";
const {
  showDeleteImage = false,
  maximized = true,
  fetch = false,
  showArrow = true,
  files = [],
  images = [],
  selectedIndex = 0,
  height = "90vh",
  width = "100%",
} = defineProps<{
  showDeleteImage?: boolean;
  maximized?: boolean;
  fetch?: boolean;
  showArrow?: boolean;
  user?: UserProfile;
  files?: FileManager[];
  images?: ImageDto[];
  selectedIndex?: number;
  height?: string;
  width?: string;
}>();
const emit = defineEmits<{
  "on-close": [];
  "on-before-hide": [];
  "on-delete": [index: number];
}>();
const modelValue = defineModel<boolean>({ default: false });

const onClose = () => {
  modelValue.value = false;
  emit("on-close");
};
</script>
<template>
  <LazyUModal v-if="modelValue" v-model:open="modelValue" fullscreen class="bg-neutral-950">
    <template #content>
      <div :style="{ width: width, height: height }">
        <BaseImageView
        dark
          :files
          :selected-index
          :show-delete-image
          :show-arrow
          :fetch="fetch"
          :images="images"
          show-thumbnails
          @on-close="onClose"
        >
          <template #header-right-apppend>
            <UButton variant="ghost" icon="lucide:x" class="rounded-full text-white hover:bg-neutral-700" @click="onClose" />
          </template>
        </BaseImageView>
      </div>
    </template>
  </LazyUModal>
</template>
