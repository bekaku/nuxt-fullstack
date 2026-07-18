<script setup lang="ts">
definePageMeta({
  layout: "default",
  // requiresPermission: ['role_manage', 'rome_list'],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "App role",
});
</script>

<template>
  <BaseDashboardPanel id="app-role-index" title="App role page">
  </BaseDashboardPanel>
</template>
