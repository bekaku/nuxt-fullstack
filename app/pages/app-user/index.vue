<script setup lang="ts">
definePageMeta({
  layout: "default",
  // requiresPermission: ['role_manage', 'rome_list'],
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
