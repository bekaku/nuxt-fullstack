<script setup lang="ts">
import type { ButtonProps, IconProps } from "@nuxt/ui";
import type { DownloadConfig } from "~/types/common";

const { options } = defineProps<{
  filename?: string | null;
  options: DownloadConfig;
  label?: string;
  button?: ButtonProps;
}>();
const {
  isDownloading,
  downloadProgress,
  downloadHistory,
  error,
  downloadFile,
  cancleDownload,
} = useDownload();
const showDialog = ref(false);
const onClick = async (event: any) => {
  if (!options || (!options.url && !options.fileId)) {
    return;
  }
  showDialog.value = true;
  onDownload();
};
const onDownload = async () => {
  if (!options || (!options.url && !options.fileId)) {
    return;
  }
  await downloadFile(options);
};
const onclose = () => {
  if (isDownloading.value) {
    cancleDownload();
  }
  showDialog.value = false;
};
</script>
<template>
  <div v-bind="$attrs" class="flex w-fit" @click="onClick">
    <slot>
      <UButton
        v-bind="{
          label: $t('base.download'),
          icon: 'lucide:download',
          ...button,
        }"
        :loading="isDownloading"
      />
    </slot>
  </div>
  <LazyUModal
    v-if="showDialog && options"
    v-model:open="showDialog"
    :dismissible="false"
  >
    <template #content>
      <div class="flex flex-col justify-center gap-4 p-4">
        <BaseDownloadProgress
          :error="error"
          :is-downloading="isDownloading"
          :progress="downloadProgress"
        />
        <USeparator />
        <div class="flex w-full justify-center gap-4">
          <UButton
            :label="$t('drive.download')"
            :loading="isDownloading"
            icon="lucide:cloud-download"
            color="primary"
            @click="onDownload"
          />
          <UButton
            :disabled="!isDownloading"
            :label="$t('drive.cancelDownload')"
            @click="cancleDownload"
          />
          <UButton
            :label="$t('base.close')"
            icon="lucide:x"
            variant="ghost"
            @click="onclose"
          />
        </div>
      </div>
    </template>
  </LazyUModal>
</template>
