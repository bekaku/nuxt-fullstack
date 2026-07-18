<script lang="ts" setup>
import { type ButtonProps } from "@nuxt/ui";
interface ConfirmDialogProps {
  title?: string;
  description?: string;
  confirmButton?: ButtonProps;
  cancelButton?: ButtonProps;
}

defineProps<ConfirmDialogProps>();

const emit = defineEmits<{
  close: [value: boolean];
}>();
</script>

<template>
  <UModal
    :close="false"
    :title="title"
    :description="description"
    :dismissible="false"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        v-bind="{
          label: $t('base.cancel'),
          color: 'neutral',
          variant: 'outline',
          ...cancelButton,
        }"
        @click="emit('close', false)"
      />
      <UButton
        v-bind="{
          label: $t('base.okay'),
          color: 'primary',
          ...confirmButton,
        }"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>
