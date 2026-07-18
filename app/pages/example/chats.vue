<script setup lang="ts">
definePageMeta({
  layout: "default",
  // requiresPermission: ['role_manage', 'rome_list'],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "Chat page",
});
</script>

<template>
  <BaseDashboardPanel id="example-chats" title="Chat page">
  </BaseDashboardPanel>
</template>
