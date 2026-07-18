<script setup lang="ts">
const { items = 1 } = defineProps<{
  items?: number;
}>();
</script>
<template>
  <div v-for="index in items" :key="index" class="flex flex-col gap-2 p-2">
    <BaseItem :separator="false" top>
      <template #start>
        <USkeleton class="size-12 rounded-full" />
      </template>

      <div class="flex flex-col gap-2">
        <USkeleton class="h-4 w-[70%]" />
        <USkeleton class="h-4 w-[50%]" />

        <USkeleton class="h-[130px] w-full" />

        <div class="flex justify-start gap-2">
          <USkeleton class="h-8 w-33.75" />
          <USkeleton class="h-8 w-33.75" />
          <USkeleton class="h-8 w-33.75" />
        </div>
      </div>

      <template #end>
        <USkeleton class="h-4 w-2" />
      </template>
    </BaseItem>
  </div>
</template>
