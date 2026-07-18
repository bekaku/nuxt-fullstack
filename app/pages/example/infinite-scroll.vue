<script setup lang="ts">
definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "Inifinite",
});
</script>

<template>
  <BaseDashboardPanel id="example-infinite-scroll" title="Inifinite loading">

    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4">
        <ExampleInfiniteScrollBottom />
      </div>
      <div class="p-4">
        <ExampleInfiniteScrollTop />
      </div>
    </div>
  </BaseDashboardPanel>
</template>
