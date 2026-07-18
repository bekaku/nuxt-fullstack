<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  title?: string;
  description?: string;
  icon?: string;
  iconClass?: string;
}>();
</script>

<template>
  <UModal
    :dismissible="false"
    :close="false"
    :ui="{ content: 'w-auto sm:max-w-fit' }"
  >
    <template #content>
      <div class="flex gap-2 justify-center items-center p-4 w-fit">
        <UIcon v-if="icon" :name="icon" :class="iconClass || 'w-6 h-6'" />
        <span>{{ description || $t("base.pleaseWait") }}</span>
        <BaseSpinner :show="true" />
      </div>
    </template>
  </UModal>
</template>
