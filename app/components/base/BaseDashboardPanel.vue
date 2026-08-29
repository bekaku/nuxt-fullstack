<script setup lang="ts">
import type { DropdownMenuItem, DashboardPanelProps } from "@nuxt/ui";
const props = withDefaults(
  defineProps<{
    title?: string;
    id: string;
    minSize?: number;
    maxSize?: number;
    defaultSize?: number;
    resizable?: boolean;
    collapseable?: boolean;
    ui?: DashboardPanelProps["ui"];
    bodyClass?: string;
  }>(),
  {
    resizable: false,
    collapseable: false,
    ui: () => ({
      root: "gap-1",
      body: "pt-(--ui-header-height)",
    }),
  },
);

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
    :ui
  >
    <template #header>
      <slot name="header">
        <!-- class="bg-default" -->
        <UDashboardNavbar
          :title="title"
          class="absolute top-0 inset-x-0 z-20 h-(--ui-header-height) bg-default/70 backdrop-blur-xl border-b border-default/60"
        >
          <template #leading>
            <slot name="leading">
              <UDashboardSidebarCollapse v-if="collapseable" />
            </slot>
          </template>
          <template #trailing>
            <slot name="trailing"> </slot>
          </template>

          <template #right>
            <slot name="navbarRight">
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
                    <Icon name="lucide:bell" class="size-5 shrink-0" />
                  </UChip>
                </UButton>
              </UTooltip>
            </slot>
          </template>
        </UDashboardNavbar>

        <div
          v-if="$slots.toolbar || $slots.toolbarLeft || $slots.toolbarRight"
          class="mt-(--ui-header-height)"
        >
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
        </div>
      </slot>
    </template>

    <template #body>
      <div
        :class="
          cssMerge(
            'w-full max-w-[1440px] mx-auto pt-(--ui-header-height)',
            bodyClass,
          )
        "
      >
        <slot />

        <!-- <div class="h-12 sm:h-16 shrink-0 w-full"></div> -->
      </div>
    </template>
  </UDashboardPanel>
</template>
