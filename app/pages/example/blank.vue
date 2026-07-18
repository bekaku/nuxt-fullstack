<script setup lang="ts">
definePageMeta({
  layout: "default",
  // requiresPermission: ['role_manage', 'rome_list'],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "Blank page",
});
</script>

<template>
  <BaseDashboardPanel id="example-blank" title="Blank page">
  </BaseDashboardPanel>
</template>
