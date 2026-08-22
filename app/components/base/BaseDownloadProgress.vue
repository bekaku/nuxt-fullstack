<script setup lang="ts">
import type { DownloadProgress } from "~/types/common";

defineProps<{
  progress: DownloadProgress;
  error?: string | null;
  isDownloading?: boolean;
}>();
</script>
<template>
  <div v-bind="$attrs" class="w-full flex gap-4">
    <BaseItem class="w-full">
      <template #start>
        <Icon name="lucide:download" class="size-8" />
      </template>

      <div class="flex flex-col gap-2">
        <div class="text-md font-bold">
          {{ $t("drive.donwloadingTitle", [progress.filename]) }}
        </div>
        <p class="text-muted text-sm">
          {{ $t("drive.donwloadingTitle2") }}
        </p>
        <div>
          <UProgress
            :model-value="progress.percentage"
            :color="error ? 'error' : 'primary'"
          />
        </div>
        <div class="text-sm text-muted">
          {{
            $t("drive.donwloadingTitle3", {
              speed: progress.speed,
              loaded: formatBytes(progress.loaded),
              total: formatBytes(progress.total),
              percent: progress.percentage.toFixed(1),
            })
          }}
        </div>
        <div v-if="error" class="text-error text-sm">
          {{ error }}
        </div>
      </div>
    </BaseItem>
  </div>
</template>
