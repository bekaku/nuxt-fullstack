<script setup lang="ts">
import type { FileManager } from "~/types/models";

const {
  showDelete = true,
  formatSize = true,
  fetch = false,
  showSize = true,
  useThumbnail = false,
  showTooltip = false,
  dense = true,
  imageClass = "w-12 h-12",
  iconSize = "4em",
  linesName = 1,
  item,
  rounded = true,
  playIcon = true,
  showVideoDetail = false,
  softDelete = false,
  layout = "list",
} = defineProps<{
  showDelete?: boolean;
  item: FileManager;
  index: number;
  formatSize?: boolean;
  fetch?: boolean;
  useThumbnail?: boolean;
  showSize?: boolean;
  imageClass?: string;
  imageHeight?: string;
  iconSize?: string;
  textColor?: string;
  dense?: boolean;
  showTooltip?: boolean;
  linesName?: number;
  rounded?: boolean | undefined;
  playIcon?: boolean | undefined;
  showVideoDetail?: boolean | undefined;
  softDelete?: boolean | undefined;
  layout?: "list" | "grid";
}>();
const emit = defineEmits<{
  "on-remove": [index: number];
  "on-click": [event: any, index: number];
  "on-soft-delete": [index: number];
}>();
const getImagePath = computed(() => {
  if (item.fileMimeType == "IMAGE") {
    return useThumbnail && item.fileThumbnailPath
      ? item.fileThumbnailPath
      : item.filePath;
  } else if (item.fileMimeType == "VIDEO") {
    return item.fileThumbnailPath;
  }
});
const onRemove = (event: any, index: number) => {
  emit("on-remove", index);
  if (event) {
    appPreventDefult(event);
  }
};
const onClick = (event: any, index: number) => {
  emit("on-click", event, index);
  if (event) {
    appPreventDefult(event);
  }
};
const onSoftDelete = (event: any, index: number) => {
  emit("on-soft-delete", index);

  if (event) {
    appPreventDefult(event);
  }
};
</script>
<template>
  <div class="w-full border border-default mb-2 rounded-md">
    <BaseItem :separator="false">
      <template #start>
        <BaseImage
          v-if="
            item.fileMimeType == 'IMAGE' ||
            (item.fileMimeType == 'VIDEO' && getImagePath)
          "
          :src="getImagePath || ''"
          :alt="item.uniqueId || item.id + ''"
          :class="[imageClass, rounded && 'rounded-md']"
          fit="cover"
        >
          <template v-if="item.uploadProgress">
            <div class="absolute inset-0 bg-black/40"></div>

            <div
              class="relative z-10 flex flex-col items-center justify-center"
            >
              <BaseSpinner
                show
                v-if="item.uploadProgress.status == 'UPLOADING'"
              />
              <UIcon
                v-else-if="item.uploadProgress.status == 'COMPLETED'"
                name="lucide:file-up"
                class="text-white"
              />
              <UIcon
                v-else-if="item.uploadProgress.status == 'FAILED'"
                name="lucide:cloud-alert"
                class="text-error"
              />
            </div>
          </template>
        </BaseImage>
      </template>
      <div class="w-full flex flex-col">
        <slot name="fileName">
          <BaseContentText
            class="w-full"
            :rows="linesName"
            :content="item.fileName"
          />
        </slot>
        <slot name="fileSize">
          <p v-if="item.fileSize" class="text-sm text-muted">
            {{ formatSize ? formatBytes(item.fileSize) : item.fileSize }}
          </p>
        </slot>
        <p v-if="softDelete && item.deleteFlag" class="text-xs text-error">
          {{ $t("deletedFlag") }}
        </p>
        <template v-if="item.uploadProgress">
          <p
            v-if="item.uploadProgress.status == 'UPLOADING'"
            class="text-xs text-muted"
          >
            {{  `${$t('drive.uploading')} · ${Math.round(item.uploadProgress.progress * 100)}%`}}
          </p>
        </template>
      </div>
      <template #end>
        <template
          v-if="
            showDelete &&
            (!item.uploadProgress || item.uploadProgress.status != 'UPLOADING')
          "
        >
          <UTooltip v-if="!softDelete" :text="$t('base.delete')">
            <UButton
              icon="lucide:x"
              color="error"
              variant="ghost"
              size="sm"
              class="rounded-full"
              @click="onRemove($event, index)"
            />
          </UTooltip>
          <UTooltip
            v-else
            :text="!item.deleteFlag ? $t('base.delete') : $t('base.restore')"
          >
            <UButton
              :icon="!item.deleteFlag ? 'lucide:x' : 'lucide:undo'"
              color="error"
              variant="ghost"
              size="sm"
              class="rounded-full"
              @click="onSoftDelete($event, index)"
            />
          </UTooltip>
        </template>
      </template>
    </BaseItem>
  </div>
</template>
