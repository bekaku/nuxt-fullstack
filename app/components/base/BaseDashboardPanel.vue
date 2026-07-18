<script setup lang="ts">
import type { DropdownMenuItem, DashboardPanelProps } from "@nuxt/ui";

const { resizable = false, ui = { right: "gap-1" } } = defineProps<{
  title?: string;
  id: string;
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  resizable?: boolean;
  ui?: DashboardPanelProps["ui"];
}>();
const { isNotificationsSlideoverOpen } = useDashboard();

const items = [
  [
    {
      label: "New mail",
      icon: "i-lucide-send",
      to: "/example/inbox",
    },
    {
      label: "New customer",
      icon: "i-lucide-user-plus",
      to: "/example/customers",
    },
  ],
] satisfies DropdownMenuItem[][];
</script>
<template>
  <UDashboardPanel
    v-bind="$attrs"
    :id="id"
    :resizable
    :min-size="minSize"
    :max-size="maxSize"
    :default-size="defaultSize"
  >
    <template #header>
      <slot name="header">
        <UDashboardNavbar :title="title" :ui>
          <template #leading>
            <slot name="leading">
              <UDashboardSidebarCollapse />
            </slot>
          </template>
          <template #trailing>
            <slot name="trailing"> </slot>
          </template>

          <template #right>
            <slot name="navbarRight">
              <BaseLangugeSwitcher />
              <BaseThemeSwitcher />
              <UTooltip text="Notifications" :shortcuts="['N']">
                <UButton
                  color="neutral"
                  variant="ghost"
                  @click="
                    () => {
                      isNotificationsSlideoverOpen = true;
                    }
                  "
                >
                  <UChip color="error" inset>
                    <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
                  </UChip>
                </UButton>
              </UTooltip>

              <UDropdownMenu :items="items">
                <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
              </UDropdownMenu>
            </slot>
          </template>
        </UDashboardNavbar>

        <slot name="toolbar">
          <UDashboardToolbar
            v-if="$slots.toolbar || $slots.toolbarLeft || $slots.toolbarRight"
          >
            <template #left>
              <slot name="toolbarLeft" />
            </template>
            <template #right>
              <slot name="toolbarRight" />
            </template>
          </UDashboardToolbar>
        </slot>
      </slot>
    </template>

    <template #body>
      <div class="w-full max-w-[1440px] mx-auto">
        <slot />
      </div>
    </template>
  </UDashboardPanel>
</template>
