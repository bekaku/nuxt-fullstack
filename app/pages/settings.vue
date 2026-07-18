<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const links = [
  [
    {
      label: "General",
      icon: "i-lucide-user",
      to: "/settings",
      exact: true,
    },
    {
      label: "Members",
      icon: "i-lucide-users",
      to: "/settings/members",
    },
    {
      label: "Notifications",
      icon: "i-lucide-bell",
      to: "/settings/notifications",
    },
    {
      label: "Security",
      icon: "i-lucide-shield",
      to: "/settings/security",
    },
  ],
  [
    {
      label: "Documentation",
      icon: "i-lucide-book-open",
      to: "https://ui.nuxt.com/docs/getting-started/installation/nuxt",
      target: "_blank",
    },
  ],
] satisfies NavigationMenuItem[][];
</script>

<template>
  <BaseDashboardPanel id="settings" title="Settings" :ui="{ body: 'lg:py-12' }">
    <template #toolbar>
      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>
    <div
      class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto"
    >
      <NuxtPage />
    </div>
  </BaseDashboardPanel>
</template>
