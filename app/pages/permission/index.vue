<script setup lang="ts">
definePageMeta({
  requiresPermission: ["permission_list"],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "Permission page",
});
</script>

<template>
  <BaseDashboardPanel id="permission-index" title="Permission page">
  </BaseDashboardPanel>
</template>
