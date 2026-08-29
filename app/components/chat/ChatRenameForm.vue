<script setup lang="ts">
import type { AiChat } from "~/types/models";
defineProps<{
  loading?: boolean;
}>();
const modelValue = defineModel<AiChat>();
const open = defineModel<boolean>("open");
const emit = defineEmits<{
  "on-close": [];
  "on-submit": [];
}>();
const onSubmit = () => {
  if (!modelValue.value || !modelValue.value.title) {
    return;
  }

  emit("on-submit");
  open.value = false;
};
</script>
<template>
  <LazyBaseModal
    v-if="open && modelValue"
    v-model="open"
    :title="$t('base.rename')"
  >
    <div class="flex flex-col gap-4">
      <UInput class="w-full" size="xl" v-model="modelValue.title" />
    </div>
    <template #footer="{ close }">
      <div class="w-full justify-end flex gap-4">
        <UButton
          :label="$t('base.cancel')"
          variant="soft"
          color="neutral"
          :loading="loading"
          @click="close"
        />
        <UButton
          :label="$t('base.okay')"
          variant="soft"
          color="primary"
          :disabled="!modelValue.title"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </template>
  </LazyBaseModal>
</template>
