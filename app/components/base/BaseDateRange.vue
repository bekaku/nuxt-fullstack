<script setup lang="ts">
import {
  DateFormatter,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import type { AppColor } from "~/types/common";

const {
  icon = "lucide:calendars",
  numberOfMonths = 2,
  variant = "outline",
} = defineProps<{
  icon?: string;
  numberOfMonths?: number;
  color?: AppColor;
  variant?: "solid" | "outline" | "soft" | "subtle";
}>();

const { t, locale } = useLang();

interface DateRangeString {
  start: string;
  end: string;
}

const df = computed(
  () => new DateFormatter(locale.value, { dateStyle: "medium" }),
);

const dateModel = shallowRef<{ start: any; end: any } | undefined>();
const modelValue = defineModel<DateRangeString | undefined>();
const { isDesktopOrTablet } = useDevice();
const open = ref(false);

const label = computed(() => {
  if (!dateModel.value?.start) {
    return t("base.chooseDate");
  }

  const startDate = df.value.format(
    dateModel.value.start.toDate(getLocalTimeZone()),
  );

  if (!dateModel.value?.end) {
    return startDate;
  }

  const endDate = df.value.format(
    dateModel.value.end.toDate(getLocalTimeZone()),
  );

  // if (startDate === endDate) {
  //   return startDate;
  // }

  return `${startDate} - ${endDate}`;
});

const onChange = () => {
  if (dateModel.value?.start && dateModel.value?.end) {
    modelValue.value = {
      start: dateModel.value.start.toString(),
      end: dateModel.value.end.toString(),
    };
  } else {
    modelValue.value = undefined;
  }
};

watch(
  modelValue,
  (newValue) => {
    if (newValue?.start && newValue?.end) {
      try {
        dateModel.value = {
          start: parseDate(newValue.start),
          end: parseDate(newValue.end),
        };
      } catch (error) {
        console.error("Invalid date range format:", newValue);
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
        range
          :locale="locale"
        v-model="dateModel"
        class="p-2"
        :number-of-months="isDesktopOrTablet ? numberOfMonths : 1"
        @update:modelValue="onChange"
      />
    </template>
  </UPopover>
</template>
