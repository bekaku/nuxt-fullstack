<script setup lang="ts">
import type { FileManager } from "~/types/models";

const {
  layout = "grid",
  showViewDialog,
  items,
  clickable = true,
  bordered = true,
  showName = true,
  showSize = true,
} = defineProps<{
  layout?: "list" | "grid";
  items: FileManager[];
  softDelete?: boolean;
  showDelete?: boolean;
  containerClass?: string;
  itemClass?: string;
  gridClass?: string;
  showProgress?: boolean;
  showViewDialog?: boolean;
  formatSize?: boolean;
  clickable?: boolean;
  bordered?: boolean;
  imageClass?: string;
  showName?: boolean;
  showSize?: boolean;
  progress?:number
}>();
const emit = defineEmits<{
  "on-remove": [index: number];
  "on-click": [index: number];
  "on-soft-delete": [index: number];
}>();

const fileForView = ref<FileManager>();
const showFileView = ref(false);
const fileImageItemsForView = ref<FileManager[]>([]);
const fileImageSelectIndex = ref<number>(0);
const onClick = async (event: any, index: number) => {
  console.log("onClick", { index, event, showViewDialog });
  if (!showViewDialog) {
    return;
  }
  showFileView.value = false;
  fileImageSelectIndex.value = 0;
  fileImageItemsForView.value.length = 0;

  const file = items[index];
  if (file) {
    if (file.fileMimeType == "IMAGE") {
      await setImagesFileView(file);
    }
    fileForView.value = file;
    showFileView.value = true;
  }
};
const onRemove = (index: number) => {
  emit("on-remove", index);
};
const onSoftDelete = (index: number) => {
  emit("on-soft-delete", index);
};

const getImageItems = computed(() => {
  if (items && items.length > 0) {
    return items.filter((f) => f.fileMimeType == "IMAGE");
  }
  return [];
});
const setImagesFileView = (file: FileManager) => {
  return new Promise((resolve) => {
    const index = getImageItems.value.findIndex((t) => t.id == file.id);
    if (index >= 0) {
      const list = getImageItems.value;
      // for (const f of list) {
      //   fileImageItemsForView.value.push(f)
      // }
      fileImageItemsForView.value.push(...list);
      fileImageSelectIndex.value = index;
    }
    resolve(true);
  });
};
</script>
<template>
  <div
    v-if="items.length > 0"
    class="w-full sm:min-w-100 flex flex-col overflow-hidden mt-4 text-left"
  >
    <div v-if="layout == 'list'" :class="['w-full', containerClass]">
      <BaseFileItem
        v-for="(item, index) in items"
        :key="item.uniqueId || item.id + ''"
        :index="index"
        :item="item"
        :clickable="clickable"
        :soft-delete="softDelete"
        :show-delete="showDelete"
        :item-class="itemClass"
        :format-size="formatSize"
        :bordered="bordered"
        :image-class="imageClass"
        :show-name="showName"
        :show-size="showSize"
        @on-click="onClick"
        @on-remove="onRemove"
        @on-soft-delete="onSoftDelete"
      >
      </BaseFileItem>
    </div>
    <div v-else :class="['w-full', containerClass]">
      <div
        :class="cssMerge('grid grid-cols-2 md:grid-cols-4 gap-4', gridClass)"
      >
        <div
          v-for="(item, index) in items"
          :key="item.uniqueId || item.id + ''"
          class="relative w-full"
        >
          <BaseFileItem
            :index="index"
            :item="item"
            :item-class="itemClass"
            :clickable="clickable"
            layout="grid"
            :soft-delete="softDelete"
            :show-delete="showDelete"
            :format-size="formatSize"
            :image-class="imageClass"
            :show-name="showName"
            :show-size="showSize"
            @on-click="onClick"
            @on-remove="onRemove"
            @on-soft-delete="onSoftDelete"
          >
          </BaseFileItem>
        </div>
      </div>
    </div>
    <UProgress v-if="showProgress && progress" :model-value="Math.min(Math.max(progress, 0), 100)" status />
  </div>
  <LazyBaseFileViewDialog
    v-if="showFileView && fileForView"
    v-model:show="showFileView"
    :item="fileForView"
    :image-list="fileImageItemsForView"
    :select-index="fileImageSelectIndex"
    :title="fileForView.fileName"
    :show-arrow="true"
  />
</template>
