<script setup lang="ts">
import {
  DateFormatter,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import type { AppColor } from "~/types/common";

const {
  icon = "lucide:calendar",
  numberOfMonths = 1,
  variant = "outline",
} = defineProps<{
  icon?: string;
  numberOfMonths?: number;
  color?: AppColor;
  variant?: "solid" | "outline" | "soft" | "subtle";
}>();
const { t, locale } = useLang();

const df = computed(
  () => new DateFormatter(locale.value, { dateStyle: "medium" }),
);
const dateModel = shallowRef();
const modelValue = defineModel<string | undefined>();
const { isDesktopOrTablet } = useDevice();
const open = ref(false);
const label = computed(() => {
  return dateModel.value
    ? df.value.format(dateModel.value.toDate(getLocalTimeZone()))
    : t("base.chooseDate");
});

const onChange = () => {
  if (dateModel.value) {
    modelValue.value = dateModel.value.toString();
  } else {
    modelValue.value = undefined;
  }
  open.value = false;
};

watch(
  modelValue,
  (newValue) => {
    if (newValue) {
      try {
        dateModel.value = parseDate(newValue);
      } catch (error) {
        console.error("Invalid date format string:", newValue);
        dateModel.value = undefined;
      }
    } else {
      dateModel.value = undefined;
    }
  },
  { immediate: true },
);
</script>
<template>
  <UPopover v-model:open="open" :content="{ align: 'center' }">
    <UButton
      :color="color"
      :variant="variant"
      :icon="icon"
      @click="open = true"
    >
      {{ label }}
    </UButton>

    <template #content>
      <UCalendar
        v-model="dateModel"
        class="p-2"
        :locale="locale"
        :number-of-months="isDesktopOrTablet ? numberOfMonths : 1"
        @update:modelValue="onChange"
      />
    </template>
  </UPopover>
</template>
