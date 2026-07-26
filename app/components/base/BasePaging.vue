<script setup lang="ts">
import type { AppColor, IPagination } from "~/types/common";
const { canChangePerpage = true, siblingCount = 2 } = defineProps<{
  siblingCount?: number;
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
    emit("update-current", v);
  },
);
watch(
  () => modelValue.value?.itemsPerPage,
  (v) => {
    emit("update-perpage", v);
  },
);
</script>
<template>
  <div
    v-if="modelValue"
    v-bind="$attrs"
    class="w-full grid grid-cols-1 md:grid-cols-12 gap-4 px-2 py-4 items-center bg-elevated/50 rounded-md"
  >
    <div class="md:col-span-4 text-center md:text-left">
      <slot name="start">
        <span class="text-xs text-muted">
          {{ $t("paging.totalRecord", { total: modelValue.totalElements }) }}
        </span>
      </slot>
    </div>

    <div class="md:col-span-8 flex justify-end gap-4 items-center">
      <UPagination
        v-model:page="modelValue.current"
        :sibling-count="siblingCount"
        :total="modelValue.totalElements"
        :items-per-page="modelValue.itemsPerPage"
        active-color="primary"
        active-variant="subtle"
        size="md"
      />

      <template v-if="canChangePerpage">
        <span class="text-xs text-muted hidden md:inline">{{
          $t("paging.rowsPerPage")
        }}</span>
        <USelect
          v-model="modelValue.itemsPerPage"
          value-key="id"
          :items="[
            { id: 5, label: '5' },
            { id: 10, label: '10' },
            { id: 15, label: '15' },
            { id: 20, label: '20' },
            { id: 50, label: '50' },
          ]"
          class="w-18"
        />
      </template>
    </div>
  </div>
</template>
