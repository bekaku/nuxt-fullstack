<script setup lang="ts">
definePageMeta({
  requiresPermission: ['app_role_list'],
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
