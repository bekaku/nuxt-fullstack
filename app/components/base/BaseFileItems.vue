<script setup lang="ts">
import type { FileManager } from "~/types/models";

const {
  layout = "grid",
  items = [],
  clickable = true,
  bordered = true,
  showName = true,
  showSize = true,
  formatSize = true,
  limit = 0,
  showViewDialog
} = defineProps<{
  items: FileManager[];
  layout?: "list" | "grid";
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
  iconClass?: string;
  showName?: boolean;
  showSize?: boolean;
  progress?: number;
  limit?: number;
  hoverEffect?: boolean;
}>();

const emit = defineEmits<{
  "on-remove": [index: number];
  "on-click": [index: number];
  "on-soft-delete": [index: number];
}>();

// จัดการ Limit แบบ Reactive
const currentLimit = ref<number>(limit);
watch(() => limit, (newVal) => {
  currentLimit.value = newVal;
});

// View Dialog State
const fileForView = ref<FileManager | null>(null);
const showFileView = ref(false);
const fileImageItemsForView = ref<FileManager[]>([]);
const fileImageSelectIndex = ref<number>(0);

// คำนวณรายการที่จะแสดงผล
const displayItems = computed(() => {
  if (layout === "list" || currentLimit.value <= 0) {
    return items;
  }
  return items.slice(0, currentLimit.value);
});

const remainingCount = computed(() => {
  if (currentLimit.value <= 0) return 0;
  return Math.max(0, items.length - currentLimit.value);
});

const imageItems = computed(() => {
  return items.filter((f) => f.fileMimeType === "IMAGE");
});

const handleItemClick = (event: MouseEvent, index: number) => {
  emit("on-click", index);

  // ถ้าคลิกตัวสุดท้ายที่มีตัวเลข +X ซ้อนอยู่ สามารถเลือกที่จะขยายหรือเปิดดูได้
  if (layout === "grid" && index === currentLimit.value - 1 && remainingCount.value > 0) {
    currentLimit.value = items.length;
    return;
  }

  if (!showViewDialog) return;

  const file = items[index];
  if (!file) return;

  if (file.fileMimeType === "IMAGE") {
    fileImageItemsForView.value = [...imageItems.value];
    const imageIndex = imageItems.value.findIndex((t) => t.id === file.id);
    fileImageSelectIndex.value = imageIndex >= 0 ? imageIndex : 0;
  } else {
    fileImageItemsForView.value = [];
    fileImageSelectIndex.value = 0;
  }

  fileForView.value = file;
  showFileView.value = true;
};
</script>

<template>
  <div v-if="items.length > 0" class="w-full flex flex-col overflow-hidden text-left">
    <!-- Items Wrapper -->
    <div
      :class="[
        'w-full',
        containerClass,
        layout === 'grid' && cssMerge('grid grid-cols-2 md:grid-cols-4 gap-4', gridClass)
      ]"
    >
      <div
        v-for="(item, index) in displayItems"
        :key="item.uniqueId || String(item.id)"
        :class="layout === 'grid' && 'relative w-full'"
      >
        <BaseFileItem
          :index="index"
          :item="item"
          :layout="layout"
          :clickable="clickable"
          :soft-delete="softDelete"
          :show-delete="showDelete"
          :item-class="itemClass"
          :format-size="formatSize"
          :bordered="bordered"
          :image-class="imageClass"
          :icon-class="iconClass"
          :show-name="showName"
          :show-size="showSize"
          :hover-effect="hoverEffect"
          @on-click="handleItemClick($event, index)"
          @on-remove="emit('on-remove', index)"
          @on-soft-delete="emit('on-soft-delete', index)"
        >
          <!-- Badge "+X" แสดงจำนวนไฟล์ที่เหลือในรูปสุดท้ายของ Grid -->
          <template
            v-if="layout === 'grid' && index === currentLimit - 1 && remainingCount > 0"
            #image-inner
          >
            <div
              class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10 cursor-pointer backdrop-blur-[1px] transition-opacity hover:bg-black/60"
            >
              <span class="text-white text-xl font-bold tracking-wide">+{{ remainingCount }}</span>
            </div>
          </template>
        </BaseFileItem>
      </div>
    </div>

    <!-- Upload Progress Bar -->
    <UProgress
      v-if="showProgress && progress !== undefined"
      :model-value="Math.min(Math.max(progress, 0), 100)"
      status
      class="mt-2"
    />
  </div>

  <!-- Preview Dialog -->
  <LazyBaseFileViewDialog
    v-if="showFileView && fileForView"
    v-model:show="showFileView"
    :item="fileForView"
    :image-list="fileImageItemsForView"
    :select-index="fileImageSelectIndex"
    :title="fileForView.fileName"
    show-arrow
  />
</template>
