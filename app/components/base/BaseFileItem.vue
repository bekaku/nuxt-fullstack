<script setup lang="ts">
import type { FileManager } from "~/types/models";

const {
  showDelete = false,
  formatSize = true,
  showSize = true,
  showName = true,
  useThumbnail = false,
  iconClass = "w-12 h-12",
  linesName = 1,
  item,
  rounded = true,
  playIcon = true,
  softDelete = false,
  layout = "list",
  clickable = true,
  bordered = true,
  index
} = defineProps<{
  item: FileManager;
  index: number;
  showDelete?: boolean;
  formatSize?: boolean;
  fetch?: boolean;
  useThumbnail?: boolean;
  showSize?: boolean;
  showName?: boolean;
  imageClass?: string;
  imageHeight?: string;
  iconClass?: string;
  playIconClass?: string;
  textColor?: string;
  showTooltip?: boolean;
  linesName?: number;
  rounded?: boolean;
  playIcon?: boolean;
  showVideoDetail?: boolean;
  softDelete?: boolean;
  clickable?: boolean;
  bordered?: boolean;
  itemClass?: string;
  layout?: "list" | "grid";
  hoverEffect?: boolean;
}>();

const emit = defineEmits<{
  "on-remove": [index: number];
  "on-click": [event: MouseEvent, index: number];
  "on-soft-delete": [index: number];
}>();

const isMedia = computed(() => item.fileMimeType === "IMAGE" || item.fileMimeType === "VIDEO");

const getImagePath = computed(() => {
  if (item.fileMimeType === "IMAGE") {
    return useThumbnail && item.fileThumbnailPath ? item.fileThumbnailPath : item.filePath;
  }
  if (item.fileMimeType === "VIDEO") {
    return item.fileThumbnailPath || "";
  }
  return "";
});

const canShowDelete = computed(() => {
  return showDelete && (!item.uploadProgress || item.uploadProgress.status !== "UPLOADING");
});

const hasGridOverlay = computed(() => {
  return showSize || showName || (softDelete && item.deleteFlag) || !!item.uploadProgress;
});

const onClick = (event: MouseEvent) => {
  if (clickable) emit("on-click", event, index);
};
</script>

<template>
  <!-- ================= LIST LAYOUT ================= -->
  <div
    v-if="layout === 'list'"
    class="w-full rounded-md"
    :class="[bordered && 'mb-2 border border-default']"
  >
    <BaseItem
      dense
      :separator="false"
      :button="clickable"
      :class="[itemClass]"
      top
      @click.stop="onClick($event)"
    >
      <template #start>
        <slot name="start">
          <BaseImage
            v-if="isMedia && getImagePath"
            :src="getImagePath"
            :alt="item.uniqueId || String(item.id)"
            :class="cssMerge('w-12 h-12', imageClass, rounded && 'rounded-md')"
            :hover-effect="hoverEffect"
            fit="cover"
          >
            <!-- Video Indicators -->
            <template v-if="item.fileMimeType === 'VIDEO'">
              <div v-if="playIcon" class="p-2 text-white pointer-events-none">
                <Icon name="lucide:circle-play" :class="cssMerge('size-6', playIconClass)" />
              </div>
              <div
                v-if="item.duration"
                class="absolute bottom-0 inset-x-0 h-1/2 bg-linear-to-t from-black/80 to-transparent pointer-events-none"
              >
                <span class="absolute bottom-1 right-2 text-xs font-mono text-white px-1.5 py-0.5 rounded bg-black/40">
                  {{ formatDurationHMS(item.duration) }}
                </span>
              </div>
            </template>

            <!-- Upload Status Overlay -->
            <template v-if="item.uploadProgress">
              <div class="absolute inset-0 bg-black/40" />
              <div class="relative z-10 flex flex-col items-center justify-center">
                <BaseSpinner v-if="item.uploadProgress.status === 'UPLOADING'" show />
                <Icon v-else-if="item.uploadProgress.status === 'COMPLETED'" name="lucide:circle-check" class="text-white" />
                <Icon v-else-if="item.uploadProgress.status === 'FAILED'" name="lucide:cloud-alert" class="text-error" />
              </div>
            </template>
          </BaseImage>

          <Icon
            v-else
            :name="getFileTypeIconFromFileManager(item)"
            :class="['size-8', iconClass]"
          />
        </slot>
      </template>

      <!-- Details Content -->
      <div class="w-full flex flex-col">
        <slot>
          <slot name="fileName">
            <BaseContentText
              v-if="showName"
              class="w-full"
              text-class="text-sm"
              :rows="linesName"
              :content="item.fileName"
            />
          </slot>
          <slot name="fileSize">
            <p v-if="showSize && item.fileSize" class="text-xs text-muted">
              {{ formatSize ? formatBytes(item.fileSize) : item.fileSize }}
            </p>
          </slot>
          <p v-if="softDelete && item.deleteFlag" class="text-xs text-error">
            {{ $t("deletedFlag") }}
          </p>

          <!-- Upload Progress -->
          <div v-if="item.uploadProgress" class="text-xs">
            <span v-if="item.uploadProgress.status === 'UPLOADING'" class="text-muted">
              {{ `${$t("drive.uploading")} ${Math.round(item.uploadProgress.progress * 100)}%` }}
            </span>
            <span v-else-if="item.uploadProgress.status === 'FAILED'" class="text-error">
              {{ $t("drive.uploadFail") }}
            </span>
            <span v-else-if="item.uploadProgress.status === 'COMPLETED'" class="text-success">
              {{ $t("drive.uploadComplete") }}
            </span>
          </div>
        </slot>
      </div>

      <!-- Action End Slot -->
      <template #end>
        <slot name="end">
          <template v-if="canShowDelete">
            <UTooltip v-if="!softDelete" :text="$t('base.delete')">
              <UButton
                icon="lucide:x"
                color="error"
                variant="ghost"
                size="sm"
                class="rounded-full"
                @click.stop="emit('on-remove', index)"
              />
            </UTooltip>
            <UTooltip v-else :text="!item.deleteFlag ? $t('base.delete') : $t('base.restore')">
              <UButton
                :icon="!item.deleteFlag ? 'lucide:x' : 'lucide:undo'"
                color="error"
                variant="ghost"
                size="sm"
                class="rounded-full"
                @click.stop="emit('on-soft-delete', index)"
              />
            </UTooltip>
          </template>
        </slot>
      </template>
    </BaseItem>
  </div>

  <!-- ================= GRID LAYOUT ================= -->
  <div
    v-else-if="layout === 'grid'"
    class="relative w-full"
    :class="cssMerge(clickable && 'cursor-pointer', itemClass)"
    @click.stop="onClick($event)"
  >
    <!-- Media Type (Image/Video) -->
    <BaseImage
      v-if="isMedia && getImagePath"
      :src="getImagePath"
      :alt="item.uniqueId || String(item.id)"
      :class="cssMerge('w-full h-[125px]', imageClass, rounded && 'rounded-md')"
      :hover-effect="hoverEffect"
      fit="cover"
    >
      <slot>
        <!-- Action Delete/Undo Button -->
        <template v-if="canShowDelete">
          <UTooltip :text="!softDelete || !item.deleteFlag ? $t('base.delete') : $t('base.restore')">
            <UButton
              class="absolute top-2 right-2 bg-black/80 text-white rounded-full p-1 hover:bg-black transition-colors z-20 cursor-pointer"
              @click.stop="!softDelete ? emit('on-remove', index) : emit('on-soft-delete', index)"
            >
              <Icon :name="softDelete && item.deleteFlag ? 'lucide:undo' : 'lucide:x'" class="size-4" />
            </UButton>
          </UTooltip>
        </template>

        <!-- Video Play Icon & Sub-indicator -->
        <template v-if="item.fileMimeType === 'VIDEO'">
          <div v-if="playIcon" class="p-2 text-white pointer-events-none">
            <Icon name="lucide:play" :class="cssMerge('size-8', playIconClass)" />
          </div>
          <div
            v-if="!showSize && !showName && item.duration"
            class="absolute bottom-0 inset-x-0 h-1/2 bg-linear-to-t from-black/40 to-transparent pointer-events-none"
          >
            <span class="absolute bottom-3 right-3 text-xs font-mono text-white px-1.5 py-0.5 rounded bg-black/40">
              {{ formatDurationHMS(item.duration) }}
            </span>
          </div>
        </template>

        <!-- Grid Info Overlay -->
        <div
          v-if="hasGridOverlay"
          class="absolute bottom-0 inset-x-0 max-h-[50%] min-h-10 bg-black/60 backdrop-blur-xs flex flex-col justify-center px-3 z-10"
        >
          <p v-if="showName" class="text-white text-xs sm:text-sm font-medium truncate">
            {{ item.fileName || "untitled" }}
          </p>
          <p v-if="showSize && item.fileSize" class="text-gray-300 text-[10px] sm:text-xs truncate">
            {{ formatSize ? formatBytes(item.fileSize) : item.fileSize }}
          </p>
          <p v-if="item.fileMimeType === 'VIDEO' && item.duration" class="text-gray-300 text-[10px] sm:text-xs truncate">
            {{ formatDurationHMS(item.duration) }}
          </p>
          <p v-if="softDelete && item.deleteFlag" class="text-[9px] sm:text-xs text-error truncate">
            {{ $t("deletedFlag") }}
          </p>

          <!-- Upload Progress Status -->
          <template v-if="item.uploadProgress">
            <p v-if="item.uploadProgress.status === 'UPLOADING'" class="text-[9px] sm:text-xs text-primary truncate">
              {{ `${$t("drive.uploading")} ${Math.round(item.uploadProgress.progress * 100)}%` }}
            </p>
            <p v-else-if="item.uploadProgress.status === 'FAILED'" class="text-[9px] sm:text-xs text-error truncate">
              {{ $t("drive.uploadFail") }}
            </p>
            <p v-else-if="item.uploadProgress.status === 'COMPLETED'" class="text-[9px] sm:text-xs text-success truncate">
              {{ $t("drive.uploadComplete") }}
            </p>
          </template>
        </div>
      </slot>
      <slot name="image-inner" />
    </BaseImage>

    <!-- Document / Fallback File Type -->
    <div
      v-else
      :class="
        cssMerge(
          'w-full h-[125px] relative overflow-hidden flex flex-col items-center justify-center border border-default rounded-md bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors',
          imageClass
        )
      "
    >
      <Icon :name="getFileTypeIconFromFileManager(item)" :class="cssMerge('size-12', iconClass)" />

      <slot>
        <!-- Action Delete/Undo Button -->
        <template v-if="canShowDelete">
          <UTooltip :text="!softDelete || !item.deleteFlag ? $t('base.delete') : $t('base.restore')">
            <UButton
              class="absolute top-2 right-2 bg-black/80 text-white rounded-full p-1 hover:bg-black transition-colors z-20 cursor-pointer"
              @click.stop="!softDelete ? emit('on-remove', index) : emit('on-soft-delete', index)"
            >
              <Icon :name="softDelete && item.deleteFlag ? 'lucide:undo' : 'lucide:x'" class="size-4" />
            </UButton>
          </UTooltip>
        </template>

        <!-- Grid Info Overlay -->
        <div
          v-if="hasGridOverlay"
          class="absolute bottom-0 inset-x-0 max-h-[50%] min-h-10 bg-black/60 backdrop-blur-xs flex flex-col justify-center px-3 z-10"
        >
          <p v-if="showName" class="text-white text-xs sm:text-sm font-medium truncate">
            {{ item.fileName || "untitled" }}
          </p>
          <p v-if="showSize && item.fileSize" class="text-gray-300 text-[10px] sm:text-xs truncate">
            {{ formatSize ? formatBytes(item.fileSize) : item.fileSize }}
          </p>
          <p v-if="softDelete && item.deleteFlag" class="text-[9px] sm:text-xs text-error truncate">
            {{ $t("deletedFlag") }}
          </p>

          <template v-if="item.uploadProgress">
            <p v-if="item.uploadProgress.status === 'UPLOADING'" class="text-[9px] sm:text-xs text-primary truncate">
              {{ `${$t("drive.uploading")} ${Math.round(item.uploadProgress.progress * 100)}%` }}
            </p>
            <p v-else-if="item.uploadProgress.status === 'FAILED'" class="text-[9px] sm:text-xs text-error truncate">
              {{ $t("drive.uploadFail") }}
            </p>
            <p v-else-if="item.uploadProgress.status === 'COMPLETED'" class="text-[9px] sm:text-xs text-success truncate">
              {{ $t("drive.uploadComplete") }}
            </p>
          </template>
        </div>
      </slot>
      <slot name="image-inner" />
    </div>
  </div>
</template>
