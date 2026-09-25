<script setup lang="ts">
definePageMeta({
  layout: "default",
  requiresPermission: ['file_manager_list'],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "My drive",
});
</script>

<template>
  <BaseDashboardPanel id="my-drive-folder" title="My drive page">
  </BaseDashboardPanel>
</template>
