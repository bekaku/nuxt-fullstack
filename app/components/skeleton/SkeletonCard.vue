<script setup lang="ts">
  //  <SkeletonCard :items="3" containerclass="md:grid-cols-3" />
const { items = 1 } = defineProps<{
  items?: number;
  containerclass?: string;
}>();
</script>
<template>

  <div :class="['w-full grid grid-cols-1 md:grid-cols-2 gap-4', containerclass]">
    <div v-for="index in items" :key="index" class="flex flex-col gap-2 p-2">
      <BaseItem :separator="false" top>
        <div class="flex flex-col gap-2">
          <USkeleton class="h-4 w-[70%]" />
          <USkeleton class="h-4 w-[50%]" />

          <USkeleton class="h-[130px] w-full" />

          <div class="flex justify-start gap-2">
            <USkeleton class="h-8 w-[33.75%]" />
            <USkeleton class="h-8 w-[33.75%]" />
            <USkeleton class="h-8 w-[33.75%]" />
          </div>
        </div>

      </BaseItem>
    </div>
  </div>
</template>
