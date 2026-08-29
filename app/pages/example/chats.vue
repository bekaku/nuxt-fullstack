<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { LabelValue } from "~/types/common";

definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "Blank page",
});

const { t } = useLang();


const getDropdownItems = (): DropdownMenuItem[][] => [
  [
    {
      label: t("chats.favorite"),
      icon: "lucide:star",
      color: "neutral",
      onSelect() {},
    },
    {
      label: t("drive.changName"),
      icon: "lucide:pencil",
      onSelect() {},
    },
  ],
  [
    {
      label: t("base.delete"),
      icon: "i-lucide-trash",
      color: "error",
      async onSelect() {},
    },
  ],
];
</script>

<template>
  <!-- ให้ DashboardPanel ปิด scroll นอกสุดตามปกติ -->
  <BaseDashboardPanel
    id="example-blank"
    title="Blank page"
    class="overflow-hidden"
    :ui="{ body: 'p-4 overflow-hidden' }"
    body-class="pt-0"
  >
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <BaseItem
            title="Ester Howard"
            description="Software engineer"
            title-class="font-bold text-sm"
            description-class="text-xs"
          >
            <template #start>
              <UAvatar
                src="https://github.com/benjamincanac.png"
                loading="lazy"
                :chip="{
                  inset: true,
                }"
              />
            </template>
          </BaseItem>
        </template>

        <template #right>
          <div class="flex gap-2">
            <UDropdownMenu
              :items="getDropdownItems()"
              :content="{ align: 'start' }"
              :modal="false"
            >
              <UButton variant="ghost" icon="lucide:more-vertical" />
            </UDropdownMenu>
          </div>
        </template>
      </UDashboardNavbar>
    </template>
    <div
      class="w-full h-[calc(100dvh-5rem)] grid grid-cols-1 md:grid-cols-12 gap-4"
    >
      <!-- <div class="md:col-span-8 h-full flex flex-col min-h-0 bg-neutral-50 dark:bg-neutral-950 rounded-xl p-4 gap-3"> -->
      <div class="md:col-span-8 h-[calc(100dvh-5rem)]">
        <ChatContent/>
      </div>
      <!-- คอลัมน์ขวา -->
      <div class="md:col-span-4 h-full overflow-y-auto">Right</div>
    </div>
  </BaseDashboardPanel>
</template>
