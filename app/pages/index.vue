<script setup lang="ts">
import {
  DateFormatter,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import type { ISeriresCategories } from "~/types/chart";
import type { LabelValue } from "~/types/common";

const df = new DateFormatter("en-US", { dateStyle: "medium" });
const tz = getLocalTimeZone();
const initialEnd = today(tz);
const dateRange = shallowRef({
  start: initialEnd.subtract({ days: 14 }),
  end: initialEnd,
});

const { isDesktop, isMobileOrTablet } = useDevice();
const { isDark } = useTheme();
const tabsItems = [
  {
    label: "Overview",
    slot: "overview",
  },
  {
    label: "Analytics",
    slot: "analytics",
  },
  {
    label: "Reports",
    slot: "reports",
  },
];
const label = computed(() => {
  const { start, end } = dateRange.value;
  if (!start) return "Pick a date";
  if (!end) return df.format(start.toDate(tz));
  return `${df.format(start.toDate(tz))} - ${df.format(end.toDate(tz))}`;
});
const { data: dashboardHeroItems } = await useFetch<LabelValue<string>[]>(
  "/api/mock/dashboard/dashboardHeroItems",
  {
    default: () => [],
  },
);
const { data: dashBaordStatisticItems } = await useFetch<LabelValue<string>[]>(
  "/api/mock/dashboard/dashBaordStatisticItems",
  {
    default: () => [],
  },
);
const { data: dashboardSparkLineItems } = await useFetch<any[]>(
  "/api/mock/dashboard/dashboardSparkLineItems",
  {
    default: () => [],
  },
);
const { data: dashboardChartData } = await useFetch<ISeriresCategories>(
  "/api/mock/dashboard/dashboardChartData",
);
const { data: dashBaordRecentSalseItems } = await useFetch<
  LabelValue<string>[]
>("/api/mock/dashboard/dashBaordRecentSalseItems");
</script>

<template>
  <BaseDashboardPanel id="home" title="Home">
    <!-- <HomeStats :period="period" :range="range" />
    <HomeChart :period="period" :range="range" />
    <HomeSales :period="period" :range="range" /> -->
    <BaseItem
      title="Dashboard"
      description="Top picks for you. Updated daily."
      :separator="false"
      class="mb-4"
    >
      <template #start>
        <UIcon name="lucide:layout-dashboard" class="w-8 h-8" />
      </template>

      <template #end>
        <UTooltip text="Open on GitHub">
          <UButton
            to="https://github.com/bekaku/nuxt-ui-starter/blob/main/app/pages/index.vue"
            target="_blank"
            variant="ghost"
            icon="lucide:code"
            color="neutral"
            class="rounded-full"
          />
        </UTooltip>
      </template>
    </BaseItem>
    <div
      class="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2 justify-around gap-4"
    >
      <div class="w-full">
        <UTabs
          :items="tabsItems"
          color="neutral"
          variant="pill"
          :content="false"
          class="w-fit"
        />
      </div>
      <div class="w-full flex justify-end gap-2 mb-4">
        <UPopover :content="{ align: 'center' }">
          <UButton color="neutral" variant="soft" icon="i-lucide-calendar">
            {{ label }}
          </UButton>

          <template #content>
            <UCalendar
              v-model="dateRange"
              class="p-2"
              :number-of-months="isDesktop ? 2 : 1"
              range
            />
          </template>
        </UPopover>

        <UButton
          color="neutral"
          variant="solid"
          icon="lucide:download"
          label="Export"
          class="ml-2 rounded-lg"
        />
      </div>
    </div>

    <!-- Hero Item -->
    <div class="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-4">
      <UCard
        v-for="(item, index) in dashboardHeroItems"
        :key="index"
        class="w-full"
        variant="subtle"
      >
        <BaseItem
          :title="item.label"
          :description="item.description"
          :separator="false"
          title-class="text-2xl"
          title-bold
        >
          <template #start>
            <UAvatar v-if="item.icon" :icon="item.icon.name" size="3xl" />
          </template>

          <template #end>
            <BaseLink :to="item.to || ''"> Explore </BaseLink>
          </template>
        </BaseItem>
      </UCard>
    </div>

    <!-- Statistic section -->
    <div class="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-4 mb-4">
      <UCard
        v-for="(item, index) in dashBaordStatisticItems"
        :key="index"
        class="w-full"
      >
        <BaseItem :separator="false" top>
          <div class="flex flex-col gap-1">
            <p class="">{{ item.label }}</p>
            <h1 class="font-bold text-2xl">{{ item.value }}</h1>
            <p class="text-sm text-muted font-light">{{ item.description }}</p>
          </div>
          <template #end>
            <UIcon
              v-if="item.icon"
              v-bind="item.icon"
              class="text-muted"
              size="20px"
            />
          </template>
        </BaseItem>
      </UCard>
    </div>
    <!-- Sparklines charts  -->
    <div class="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-0 mb-4">
      <UCard
        v-for="(item, index) in dashboardSparkLineItems"
        :key="index"
        class="w-full bg-transparent rounded-none"
        :class="{
          'border-r border-muted': index !== dashboardSparkLineItems.length - 1,
        }"
        variant="soft"
      >
        <div class="flex justify-around items-end">
          <div class="w-full">
            <p class="text-sm text-muted">
              {{ item.label }}
            </p>
            <div class="flex gap-1 items-center text-sm">
              {{ item.description }}
              <UBadge
                size="md"
                :style="{ color: item.color, backgroundColor: item.bg }"
                >{{ item.value }}</UBadge
              >
            </div>
          </div>
          <div class="w-full">
            <ChartSparklines
              style="width: 155px"
              height="75"
              :chart-id="`sparkline-area-${index}`"
              :stroke-width="1"
              strokestyle="smooth"
              :colors="[item.color]"
              :series="item.series"
              :categories="item.categories"
              :dark="isDark"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Overview & Resent sales -->
    <div class="grid grid-cols-12 gap-4 mt-8 mb-8">
      <div class="col-span-12 md:col-span-8 p-4">
        <UCard class="w-full">
          <template #header>
            <h1 class="text-2xl font-bold">Overview</h1>
          </template>
          <template v-if="dashboardChartData">
            <ChartArea
              class="q-my-sm"
              chart-id="chart-bar"
              height="350"
              type="bar"
              :colors="['#64748B', '#94A3B8', '#CBD5E1']"
              :series="dashboardChartData.series.slice(3, 6)"
              :categories="dashboardChartData.categories"
              strokestyle="smooth"
              :label-rotate="!isMobileOrTablet ? 0 : -45"
              :xaxis-tickamount="4"
              :dark="isDark"
            />
          </template>
        </UCard>
      </div>

      <div class="col-span-12 md:col-span-4 p-4">
        <UCard class="w-full">
          <template #header>
            <h1 class="text-2xl font-bold">Recent Sales</h1>
            <p class="text-muted text-sm">You made 265 sales this month.</p>
          </template>

          <BaseItem
            v-for="(item, index) in dashBaordRecentSalseItems"
            :key="index"
            :separator="false"
            :title="item.label"
            :description="item.description"
            :title-bold="false"
          >
            <template #start>
              <UAvatar
                :src="item.avatar?.src || '/images/no_picture_thumb.jpg'"
                size="xl"
              />
            </template>
            <template #end>
              <h1 class="font-bold">{{ item.value }}</h1>
            </template>
          </BaseItem>
        </UCard>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
