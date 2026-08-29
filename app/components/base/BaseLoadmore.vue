<script setup lang="ts">
defineProps<{
  disabled?: boolean;
  loading?: boolean;
  loadMesage?: string;
  nomoreMessage?: string;
  icon?: string;
}>();
defineEmits<{
  "on-next": [];
}>();
</script>
<template>
  <div v-bind="$attrs" class="flex w-full justify-center gap-4">
    <UButton
      class="w-fit my-4"
      :icon="!disabled ? icon || 'lucide:chevron-down' : ''"
      :disabled="disabled"
      :loading="loading"
      variant="soft"
      @click="$emit('on-next')"
    >
      {{
        !disabled
          ? loadMesage || $t("base.loadMore")
          : nomoreMessage || $t("helper.nomoreData")
      }}
    </UButton>
  </div>
</template>
