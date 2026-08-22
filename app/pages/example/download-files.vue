<script setup lang="ts">
import type { DownloadConfig } from "~/types/common";

useSeoMeta({
  title: "Download page",
});

const {
  isDownloading,
  downloadProgress,
  downloadHistory,
  error,
  downloadFile,
  cancleDownload,
} = useDownload();

const options: DownloadConfig = {
  // url: 'http://127.0.0.1:8080/api/fileManager/files/stream?path=files/2022_1204_140014.MP4',
  fileId: "345414746993856512",
  filename: "sample.mp4",
  historyable: false,
};
const onDownload = async () => {
  await downloadFile(options);
};
</script>

<template>
  <BaseDashboardPanel id="example-blank" title="Download page">
    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <UCard title="Streaming download large files">
        <BaseDownloadProgress
          :error="error"
          :is-downloading="isDownloading"
          :progress="downloadProgress"
          class="mb-8"
        />
        <div class="w-full justify-center flex gap-4">
          <UButton
            :label="$t('drive.download')"
            :loading="isDownloading"
            @click="onDownload"
          />
          <UButton
            :label="$t('drive.cancelDownload')"
            color="error"
            :disabled="!isDownloading"
            @click="cancleDownload"
          />
        </div>
      </UCard>

      <UCard title="Example 2">
        <div class="flex gap-4">
          <BaseDownload :options="options" label="Click to download" />

          <BaseDownload :options="options" class="cursor-pointer">
            <Icon name="lucide:bird" />
            <span>You can click here to download</span>
          </BaseDownload>
        </div>
      </UCard>
    </div>
  </BaseDashboardPanel>
</template>
