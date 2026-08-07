<script setup lang="ts">
import type { PdfWatermarkOptions } from "~/types/common";

const {
  src,
  title,
  showDownload = true,
  fetchToServer = false,
  isBlob = false,
  scrollHeight = "85vh",
  minHeight = "500px",
  minWidth = "100%",
  closeable = true,
  maximized = false,
} = defineProps<{
  title?: string;
  src: string;
  fetchToServer?: boolean;
  showDownload?: boolean;
  isBlob?: boolean;
  scrollHeight?: string;
  minHeight?: string;
  minWidth?: string;
  closeable?: boolean;
  maximized?: boolean;
  watermarkOptions?: PdfWatermarkOptions | undefined;
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
  <LazyUModal
    v-if="modelValue"
    v-model:open="modelValue"
    fullscreen
  >
    <template #content>
      <BasePdfView
        :src
        :closeable
        :title
        :fetch-to-server
        :show-download
        :is-blob
        :scroll-height
        :min-height
        :min-width
        :watermark-options="watermarkOptions"
        @on-close="onClose"
      >
        <template #header-right-apppend>
          <UButton
            variant="ghost"
            icon="lucide:x"
            class="rounded-full"
            @click="onClose"
          />
        </template>
      </BasePdfView>
    </template>
  </LazyUModal>
</template>
