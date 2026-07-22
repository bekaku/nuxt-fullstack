<script setup lang="ts">
definePageMeta({
  layout: "default",
  requiresPermission: ['app_user_list'],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "App user",
});
</script>

<template>
  <BaseDashboardPanel id="app-user-index" title="App user page">
  </BaseDashboardPanel>
</template>
