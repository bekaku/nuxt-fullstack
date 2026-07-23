<script setup lang="ts">
import type { FileManager } from "~/types/models";

const {
  showDelete = false,
  formatSize = true,
  fetch = false,
  showSize = true,
  showName = true,
  useThumbnail = false,
  showTooltip = false,
  imageClass = "w-12 h-12",
  linesName = 1,
  item,
  rounded = true,
  playIcon = true,
  showVideoDetail = false,
  softDelete = false,
  layout = "list",
  clickable = true,
} = defineProps<{
  showDelete?: boolean;
  item: FileManager;
  index: number;
  formatSize?: boolean;
  fetch?: boolean;
  useThumbnail?: boolean;
  showSize?: boolean;
  showName?: boolean;
  imageClass?: string;
  imageHeight?: string;
  iconClass?: string;
  textColor?: string;
  showTooltip?: boolean;
  linesName?: number;
  rounded?: boolean | undefined;
  playIcon?: boolean | undefined;
  showVideoDetail?: boolean | undefined;
  softDelete?: boolean | undefined;
  clickable?: boolean | undefined;
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
  if (clickable) {
    emit("on-click", event, index);
  }

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
  <div
    v-if="layout == 'list'"
    class="w-full border border-default mb-2 rounded-md"
  >
    <BaseItem
      dense
      :separator="false"
      :button="clickable"
      @click="onClick($event, index)"
    >
      <template #start>
        <slot name="start">
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
            <template v-if="playIcon && item?.fileMimeType == 'VIDEO'">
              <div class="p-2 text-white pointer-events-none">
                <UIcon name="lucide:circle-play" class="size-6" />
              </div>

              <div
                class="absolute bottom-0 inset-x-0 h-1/2 bg-linear-to-t from-black/80 to-transparent pointer-events-none"
              >
                <span
                  class="absolute bottom-1 right-2 text-xs font-mono text-white px-1.5 py-0.5 rounded bg-black/40"
                >
                  {{ formatDurationHMS(item?.duration || 0) }}
                </span>
              </div>
            </template>
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
                  name="lucide:circle-check"
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
          <template v-else>
            <UIcon
              :name="getFileTypeIconFromFileManager(item)"
              :class="['size-8', iconClass]"
            />
          </template>
        </slot>
      </template>
      <div class="w-full flex flex-col">
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
        <template v-if="item.uploadProgress">
          <div class="text-xs">
            <template v-if="item.uploadProgress.status == 'UPLOADING'">
              <span class="text-muted">
                {{
                  `${$t("drive.uploading")} ${Math.round(item.uploadProgress.progress * 100)}%`
                }}
              </span>
            </template>
            <template v-else-if="item.uploadProgress.status == 'FAILED'">
              <span class="text-error">
                {{ $t("drive.uploadFail") }}
              </span>
            </template>
            <template v-else-if="item.uploadProgress.status == 'COMPLETED'">
              <span class="text-success">
                {{ $t("drive.uploadComplete") }}
              </span>
            </template>
          </div>
        </template>
      </div>
      <template #end>
        <slot name="end">
          <template
            v-if="
              showDelete &&
              (!item.uploadProgress ||
                item.uploadProgress.status != 'UPLOADING')
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
        </slot>
      </template>
    </BaseItem>
  </div>
  <div
    v-if="layout == 'grid'"
    class="relative aspect-square w-full"
    :class="[clickable && 'cursor-pointer']"
    @click="onClick($event, index)"
  >
    <BaseImage
      v-if="item.fileMimeType == 'IMAGE' || item.fileMimeType == 'VIDEO'"
      :src="getImagePath || ''"
      :alt="item.uniqueId || item.id + ''"
      :class="[imageClass, 'w-full h-full', rounded && 'rounded-md']"
      fit="cover"
    >
      <template
        v-if="
          showDelete &&
          (!item.uploadProgress || item.uploadProgress.status != 'UPLOADING')
        "
      >
        <UTooltip v-if="!softDelete" :text="$t('base.delete')">
          <UButton
            @click.stop="onRemove($event, index)"
            class="absolute top-2 right-2 bg-black/80 text-white rounded-full p-1 hover:bg-black transition-colors z-20 cursor-pointer"
          >
            <UIcon name="lucide:x" class="w-4 h-4" />
          </UButton>
        </UTooltip>
        <UTooltip
          v-else
          :text="!item.deleteFlag ? $t('base.delete') : $t('base.restore')"
        >
          <UButton
            @click.stop="onSoftDelete($event, index)"
            class="absolute top-2 right-2 bg-black/80 text-white rounded-full p-1 hover:bg-black transition-colors z-20 cursor-pointer"
          >
            <UIcon
              :name="!item.deleteFlag ? 'lucide:x' : 'lucide:undo'"
              class="w-4 h-4"
            />
          </UButton>
        </UTooltip>
      </template>

      <template v-if="playIcon && item?.fileMimeType == 'VIDEO'">
        <div class="p-2 text-white pointer-events-none">
          <UIcon name="lucide:circle-play" class="size-8" />
        </div>
        <div
          class="absolute bottom-0 inset-x-0 h-1/2 bg-linear-to-t from-black/80 to-transparent pointer-events-none"
        >
          <span
            class="absolute bottom-1 right-2 text-xs font-mono text-white px-1.5 py-0.5 rounded bg-black/40"
          >
            {{ formatDurationHMS(item?.duration || 0) }}
          </span>
        </div>
      </template>

      <div
        v-if="showSize || showName || (softDelete && item.deleteFlag)"
        class="absolute bottom-0 inset-x-0 max-h-[50%] min-h-10 bg-black/60 backdrop-blur-sm flex flex-col justify-center px-3 z-10"
      >
        <p
          v-if="showSize"
          class="text-white text-xs sm:text-sm font-medium truncate"
        >
          {{ item.fileName || "untitled" }}
        </p>
        <p
          v-if="showSize && item.fileSize"
          class="text-gray-300 text-[10px] sm:text-xs truncate"
        >
          {{ formatSize ? formatBytes(item.fileSize) : item.fileSize }}
        </p>
        <p
          v-if="item?.fileMimeType == 'VIDEO'"
          class="text-gray-300 text-[10px] sm:text-xs truncate"
        >
          {{ formatDurationHMS(item?.duration || 0) }}
        </p>
        <p
          v-if="softDelete && item.deleteFlag"
          class="text-[9px] sm:text-xs text-error truncate"
        >
          {{ $t("deletedFlag") }}
        </p>
        <template v-if="item.uploadProgress">
          <p
            v-if="item.uploadProgress.status == 'UPLOADING'"
            class="text-[9px] sm:text-xs text-primary truncate"
          >
            {{
              `${$t("drive.uploading")} ${Math.round(item.uploadProgress.progress * 100)}%`
            }}
          </p>
          <p
            v-else-if="item.uploadProgress.status == 'FAILED'"
            class="text-[9px] sm:text-xs text-error truncate"
          >
            {{ $t("drive.uploadFail") }}
          </p>
          <p
            v-else-if="item.uploadProgress.status == 'COMPLETED'"
            class="text-[9px] sm:text-xs text-success truncate"
          >
            {{ $t("drive.uploadComplete") }}
          </p>
        </template>
      </div>
    </BaseImage>
    <template v-else>
      <div
        class="w-full min-h-[125px] relative overflow-hidden flex flex-col items-center justify-center border border-default rounded-md bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
        :class="[clickable && 'cursor-pointer']"
      >
        <UIcon
          :name="getFileTypeIconFromFileManager(item)"
          :class="['size-12', iconClass]"
        />
        <template
          v-if="
            showDelete &&
            (!item.uploadProgress || item.uploadProgress.status != 'UPLOADING')
          "
        >
          <UTooltip v-if="!softDelete" :text="$t('base.delete')">
            <UButton
              @click.stop="onRemove($event, index)"
              class="absolute top-2 right-2 bg-black/80 text-white rounded-full p-1 hover:bg-black transition-colors z-20 cursor-pointer"
            >
              <UIcon name="lucide:x" class="w-4 h-4" />
            </UButton>
          </UTooltip>
          <UTooltip
            v-else
            :text="!item.deleteFlag ? $t('base.delete') : $t('base.restore')"
          >
            <UButton
              @click.stop="onSoftDelete($event, index)"
              class="absolute top-2 right-2 bg-black/80 text-white rounded-full p-1 hover:bg-black transition-colors z-20 cursor-pointer"
            >
              <UIcon
                :name="!item.deleteFlag ? 'lucide:x' : 'lucide:undo'"
                class="w-4 h-4"
              />
            </UButton>
          </UTooltip>
        </template>

        <div
          class="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-auto"
        >
          <div
            v-if="showSize || showName || (softDelete && item.deleteFlag)"
            class="absolute bottom-0 inset-x-0 max-h-[50%] min-h-10 bg-black/60 backdrop-blur-sm flex flex-col justify-center px-3 z-10"
          >
            <p
              v-if="showSize"
              class="text-white text-xs sm:text-sm font-medium truncate"
            >
              {{ item.fileName || "untitled" }}
            </p>
            <p
              v-if="showSize && item.fileSize"
              class="text-gray-300 text-[10px] sm:text-xs truncate"
            >
              {{ formatSize ? formatBytes(item.fileSize) : item.fileSize }}
            </p>
            <p
              v-if="softDelete && item.deleteFlag"
              class="text-[9px] sm:text-xs text-error truncate"
            >
              {{ $t("deletedFlag") }}
            </p>
            <template v-if="item.uploadProgress">
              <p
                v-if="item.uploadProgress.status == 'UPLOADING'"
                class="text-[9px] sm:text-xs text-primary truncate"
              >
                {{
                  `${$t("drive.uploading")} ${Math.round(item.uploadProgress.progress * 100)}%`
                }}
              </p>
              <p
                v-else-if="item.uploadProgress.status == 'FAILED'"
                class="text-[9px] sm:text-xs text-error truncate"
              >
                {{ $t("drive.uploadFail") }}
              </p>
              <p
                v-else-if="item.uploadProgress.status == 'COMPLETED'"
                class="text-[9px] sm:text-xs text-success truncate"
              >
                {{ $t("drive.uploadComplete") }}
              </p>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
