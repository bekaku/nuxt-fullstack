<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { ILanguge } from "~/types/common";
defineProps<{
  closeOnClick?: boolean;
  anchor?: any;
  self?: any;
}>();
const colorMode = useColorMode();
const { locale, onSwitchLocale, availableLocales, currentLangugeName } =
  useLang();
const onChangeLanguge = (iso: string) => {
  onSwitchLocale(iso as ILanguge);
};
const items = ref<DropdownMenuItem[]>([
  {
    label: "English",
    type: "checkbox",
    checked: locale.value === "en",
    onSelect(e: Event) {
      onChangeLanguge("en");
    },
  },
  {
    label: "ไทย",
    type: "checkbox",
    checked: locale.value === "th",
    onSelect(e: Event) {
      onChangeLanguge("th");
    },
  },
]);
</script>
<template>
  <UDropdownMenu
    :items="items"
    :content="{
      align: 'start',
      side: 'bottom',
      sideOffset: 8,
    }"
    :ui="{
      content: 'w-48',
    }"
  >
    <UButton
      icon="lucide:globe"
      trailing-icon="lucide:chevrons-up-down"
      color="neutral"
      :label="currentLangugeName"
      variant="ghost"
      class="rounded-full"
    />
  </UDropdownMenu>
</template>
