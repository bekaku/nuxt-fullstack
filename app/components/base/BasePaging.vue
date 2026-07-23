<script setup lang="ts">
import type { AppColor, IPagination } from "~/types/common";
const {
  outline = false,
  canChangePerpage = true,
  siblingCount = 2,
} = defineProps<{
  siblingCount?: number;
  outline?: boolean;
  canChangePerpage?: boolean;
  color?: AppColor;
}>();
const { t } = useLang();
const modelValue = defineModel<IPagination>();
const emit = defineEmits<{
  "update-current": [value: number | undefined];
  "update-perpage": [value: number | undefined];
}>();
watch(
  () => modelValue.value?.current,
  (v) => {
    console.log("watch current", v);
    emit("update-current", v);
  },
);
watch(
  () => modelValue.value?.itemsPerPage,
  (v) => {
     console.log("watch perpage", v);
    emit("update-perpage", v);
  },
);

const page = ref(5);
</script>
<template>
  <div
    v-if="modelValue"
    class="w-full grid grid-cols-1 md:grid-cols-12 gap-4 px-2 py-4"
  >
    <div class="md:col-span-4">
      <span class="text-xs text-muted">
        {{ $t("paging.totalRecord", { total: modelValue.totalElements }) }}
      </span>
    </div>

    <div class="md:col-span-8 flex justify-end gap-4 items-center">
      <UPagination
        v-model:page="modelValue.current"
        :sibling-count="siblingCount"
        :total="modelValue.totalElements"
        :items-per-page="modelValue.itemsPerPage"
      />

      <span class="text-xs text-muted">{{ $t('paging.rowsPerPage') }}</span>
      <USelect
        v-if="canChangePerpage"
        v-model="modelValue.itemsPerPage"
        value-key="id"
        :items="[
          { id: 5, label: '5' },
          { id: 10, label: '10' },
          { id: 15, label: '15' },
          { id: 20, label: '20' },
          { id: 50, label: '50' },
        ]"
        class="w-24"
      />
    </div>
  </div>
</template>
