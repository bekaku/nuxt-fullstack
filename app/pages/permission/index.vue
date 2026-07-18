<script setup lang="ts">
definePageMeta({
  layout: "default",
  // requiresPermission: ['role_manage', 'rome_list'],
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
