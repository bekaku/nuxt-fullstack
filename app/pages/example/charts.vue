<script setup lang="ts">
import type { ISeriresCategories } from "~/types/chart";

definePageMeta({
  layout: "default",
  // requiresPermission: ['role_manage', 'rome_list'],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "Charts page",
});
const { isDark } = useTheme();
const { data: appleStockPrices } = await useFetch<ISeriresCategories>(
  "/api/mock/chart/appleStockPrices",
);
const { data: chartData } = await useFetch<ISeriresCategories>(
  "/api/mock/chart/chartData",
);
const { data: chartData2 } = await useFetch<ISeriresCategories>(
  "/api/mock/chart/chartDataV2",
);
const { data: simpleCategories } = await useFetch<string[]>(
  "/api/mock/chart/simpleCategories",
);
const { data: simpleSeries } = await useFetch<number[]>(
  "/api/mock/chart/simpleSeries",
);
</script>

<template>
  <BaseDashboardPanel id="example-charts" title="Charts page">
    <!-- Radar  -->
    <UCard title="Radar" class="mb-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div class="p-4 w-full">
          <ChartRadar
            v-if="chartData2"
            chart-id="chart-radar"
            height="350"
            :markers="3"
            :colors="['#8D6E63', '#9E9E9E', '#607D8B']"
            :series="chartData2.series"
            :categories="chartData2.categories"
            :dark="isDark"
          />
        </div>

        <div class="p-4 w-full">
          <ChartRadar
            v-if="chartData2"
            chart-id="chart-radar-2"
            height="350"
            :markers="0"
            show-data-labels
            :colors="['#4E342E']"
            :grid-colors="
              !isDark ? ['#f8f8f8', '#fff'] : ['#383a42', '#717886']
            "
            :series="chartData2.series.slice(0, 1)"
            :categories="chartData2.categories"
            :dark="isDark"
          />
        </div>
      </div>
    </UCard>
    <!-- Area  -->
    <UCard title="Area" class="mb-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div class="p-4 w-full">
          <ChartArea
            v-if="chartData"
            chart-id="chart-area"
            height="350"
            palette="palette1"
            type="area"
            :stroke-width="2"
            :colors="['#8D6E63', '#9E9E9E', '#607D8B']"
            :series="chartData.series.slice(0, 3)"
            :categories="chartData.categories"
            strokestyle="smooth"
            :label-rotate="-45"
            show-toolbar
            zoom
            :dark="isDark"
          />
        </div>

        <div class="p-4 w-full">
          <ChartArea
            v-if="chartData"
            chart-id="chart-area-2"
            height="350"
            type="area"
            :stroke-width="2"
            :colors="['#8D6E63', '#9E9E9E', '#607D8B']"
            :series="chartData.series.slice(0, 3)"
            :categories="chartData.categories"
            strokestyle="straight"
            :xaxis-tickamount="3"
            :dark="isDark"
          />
        </div>
      </div>
    </UCard>
    <!-- Line  -->
    <UCard title="Line" class="mb-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div class="p-4 w-full">
          <ChartArea
            v-if="chartData"
            chart-id="chart-line"
            height="350"
            palette="palette1"
            type="line"
            :series="chartData.series.slice(6, 9)"
            :categories="chartData.categories"
            strokestyle="straight"
            :label-rotate="-45"
            :stroke-width="3"
            :dark="isDark"
          />
        </div>

        <div class="p-4 w-full">
          <ChartArea
            v-if="chartData"
            chart-id="chart-line-2"
            height="350"
            palette="palette8"
            type="line"
            :series="chartData.series.slice(6, 9)"
            :categories="chartData.categories"
            strokestyle="smooth"
            :xaxis-tickamount="3"
            :stroke-width="3"
            :dark="isDark"
          />
        </div>
      </div>
    </UCard>

    <!-- Bar  -->
    <UCard title="Bar" class="mb-5">
      <div class="flex flex-col gap-2">
        <div class="p-4 w-full">
          <ChartArea
            v-if="chartData"
            chart-id="chart-bar"
            height="350"
            palette="palette3"
            type="bar"
            :colors="['#64748B', '#94A3B8', '#CBD5E1']"
            :series="chartData.series.slice(3, 6)"
            :categories="chartData.categories"
            strokestyle="smooth"
            :label-rotate="-45"
            :dark="isDark"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div class="p-4 w-full">
            <ChartArea
              v-if="chartData"
              chart-id="chart-bar-simple"
              height="350"
              palette="palette3"
              type="bar"
              :opacity="0.3"
              :series="chartData.series.slice(0, 1)"
              :categories="chartData.categories"
              strokestyle="smooth"
              :label-rotate="-90"
              :dark="isDark"
            />
          </div>

          <div class="p-4 w-full">
            <ChartArea
              v-if="chartData"
              chart-id="chart-bar-horizontal"
              height="350"
              palette="palette4"
              type="bar"
              horizontal
              :series="chartData.series.slice(0, 1)"
              :categories="chartData.categories"
              strokestyle="smooth"
              :dark="isDark"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- Radial -->
    <UCard title="Radial" class="mb-5">
      <div
        class="relative grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-2"
      >
        <div class="p-4 w-full">
          <ChartRadial
            v-if="simpleSeries && simpleCategories"
            chart-id="radial-1"
            :series="simpleSeries.slice(0, 3)"
            :categories="simpleCategories.slice(0, 3)"
            legend-position="right"
            :dark="isDark"
          />
        </div>

        <div class="p-4 w-full">
          <ChartRadial
            v-if="simpleSeries && simpleCategories"
            chart-id="radial-2"
            height="250"
            val-unit="%"
            :colors="['#8D6E63']"
            :series="simpleSeries.slice(0, 1)"
            :categories="simpleCategories.slice(0, 1)"
            :dark="isDark"
          />
        </div>

        <div class="p-4 w-full">
          <ChartRadial
            v-if="simpleSeries && simpleCategories"
            chart-id="radial-3"
            semi
            stoke-line-cap="square"
            :start-angle="-90"
            :end-angle="90"
            :colors="['#647C64']"
            :series="simpleSeries.slice(1, 2)"
            :categories="simpleCategories.slice(1, 2)"
            :show-legend="false"
            :dark="isDark"
          />
        </div>
        <div class="p-4 w-full">
          <ChartRadial
            v-if="simpleSeries && simpleCategories"
            chart-id="radial-4"
            val-unit="%"
            :colors="['#8E8CD8']"
            :start-angle="-180"
            :end-angle="360"
            :show-legend="false"
            :grid-padding="{
              bottom: -100,
            }"
            :series="simpleSeries.slice(2, 3)"
            :categories="simpleCategories.slice(2, 3)"
            :dark="isDark"
          />
        </div>
      </div>
    </UCard>

    <!-- Sparklines  -->
    <UCard title="Sparklines" class="mb-5">
      <div class="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-2">
        <div class="p-4 w-full">
          <ChartSparklines
            v-if="appleStockPrices"
            height="100"
            chart-id="sparkline-area"
            :stroke-width="1"
            strokestyle="smooth"
            :colors="['#9E9E9E']"
            :series="appleStockPrices.series"
            :categories="appleStockPrices.categories"
            :dark="isDark"
          />
        </div>

        <div class="p-4 w-full">
          <ChartSparklines
            v-if="appleStockPrices"
            height="100"
            chart-id="sparkline-area-2"
            :stroke-width="1"
            strokestyle="straight"
            :colors="['#607D8B']"
            :series="appleStockPrices.series"
            :categories="appleStockPrices.categories"
            :dark="isDark"
          />
        </div>

        <div class="p-4 w-full">
          <ChartSparklines
            v-if="appleStockPrices"
            height="100"
            chart-id="sparkline-line"
            type="line"
            :stroke-width="3"
            :colors="['#607D8B']"
            :series="appleStockPrices.series"
            :categories="appleStockPrices.categories"
            :dark="isDark"
          />
        </div>
        <div class="p-4 w-full">
          <ChartSparklines
            v-if="appleStockPrices"
            height="100"
            chart-id="sparkline-bar"
            type="bar"
            :stroke-width="1"
            :colors="['#8D6E63']"
            :series="appleStockPrices.series"
            :categories="appleStockPrices.categories"
            :dark="isDark"
          />
        </div>
      </div>
    </UCard>

    <!-- Pie/Donuts  -->
    <UCard title="Pie/Donuts" class="mb-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div class="p-4 w-full">
          <ChartPie
            v-if="simpleSeries && simpleCategories"
            class="q-my-sm"
            chart-id="chart-pine"
            height="350"
            palette="palette1"
            type="pie"
            :series="simpleSeries"
            :categories="simpleCategories"
            :dark="isDark"
          />
        </div>

        <div class="p-4 w-full">
          <ChartPie
            v-if="simpleSeries && simpleCategories"
            class="q-my-sm"
            chart-id="chart-donut"
            height="350"
            palette="palette5"
            type="donut"
            :colors="[
              '#78350f',
              '#92400e',
              '#b45309',
              '#d97706',
              '#f59e0b',
              '#fbbf24',
              '#fcd34d',
            ]"
            :series="simpleSeries"
            :categories="simpleCategories"
            :dark="isDark"
          />
        </div>
      </div>
    </UCard>
  </BaseDashboardPanel>
</template>
