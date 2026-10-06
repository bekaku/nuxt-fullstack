<script setup lang="ts">
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartPosition, ChartThemePalete, GridPadding, IChartSeries } from '~/types/chart'
import {
  echartSplitColor,
  echartTextColor,
  echartTooltipBg,
  normalizeCssSize,
  resolveDarkMode,
  resolvePalette,
  toLegendConfig
} from './echartTheme'

const {
  chartId = 'chart-radar-id',
  height = '350',
  width = 'auto',
  showLegend = true,
  legendPosition = 'bottom',
  mode = 'light',
  palette = 'palette1',
  series,
  colors,
  showDataLabels = false,
  categories,
  yaxisShow = false,
  yaxisTickamount = 5,
  gridPadding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  yaxisMax,
  yaxisMin,
  markers = 0,
  strokeWidth = 2,
  gridColors,
  opacity = 0.2,
  dark = false
} = defineProps<{
  chartId?: string
  height?: string
  width?: string
  labelunit?: string
  showLegend?: boolean
  legendUseSeriesColors?: boolean
  legendPosition?: ChartPosition
  mode?: ChartMode
  palette?: ChartThemePalete
  series: IChartSeries[]
  colors?: string[]
  showDataLabels?: boolean
  labelRotate?: number
  categories: string[]
  yaxisShow?: boolean
  yaxisTickamount?: number
  xaxisTickamount?: number
  gridPadding?: GridPadding
  yaxisMax?: number
  yaxisMin?: number
  markers?: number
  strokeWidth?: number
  gridColors?: string[]
  opacity?: number
  dark?: boolean
}>()

const { isDark } = useTheme()
const isDarkMode = computed(() => resolveDarkMode(dark, mode, isDark.value))

const option = computed<EChartsCoreOption>(() => {
  const darkMode = isDarkMode.value
  const textColor = echartTextColor(darkMode)
  const splitColor = echartSplitColor(darkMode)
  const paletteColors = resolvePalette(palette, colors)
  const legend = toLegendConfig(legendPosition, showLegend)
  const values = series ?? []
  const flatMax = values.length > 0 ? Math.max(...values.flatMap((s) => s.data)) : 0

  return {
    color: paletteColors,
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      backgroundColor: echartTooltipBg(darkMode),
      borderColor: splitColor,
      textStyle: { color: textColor }
    },
    legend: {
      ...legend,
      textStyle: { color: textColor }
    },
    grid: {
      left: gridPadding?.left ?? 0,
      right: gridPadding?.right ?? 0,
      top: gridPadding?.top ?? 0,
      bottom: gridPadding?.bottom ?? 0
    },
    radar: {
      indicator: categories.map((name) => ({
        name,
        max: yaxisMax ?? (flatMax > 0 ? Math.ceil(flatMax * 1.1) : 100),
        ...(yaxisMin !== undefined ? { min: yaxisMin } : {})
      })),
      axisName: { color: textColor },
      axisLine: { lineStyle: { color: splitColor } },
      splitLine: {
        lineStyle: { color: splitColor }
      },
      splitNumber: yaxisTickamount,
      splitArea: {
        show: !!gridColors?.length,
        areaStyle: gridColors?.length ? { color: gridColors } : undefined
      },
      axisLabel: { show: yaxisShow }
    },
    series: [
      {
        type: 'radar',
        data: values.map((s) => ({
          name: s.name,
          value: s.data
        })),
        symbolSize: markers,
        symbol: markers > 0 ? 'circle' : 'none',
        lineStyle: { width: strokeWidth },
        areaStyle: { opacity },
        label: { show: showDataLabels, color: textColor }
      }
    ]
  }
})

const chartStyle = computed(() => ({
  width: normalizeCssSize(width, '100%'),
  height: normalizeCssSize(height, '350px')
}))
</script>
<template>
  <VChart
    :id="chartId"
    :option="option"
    :style="chartStyle"
    autoresize
  />
</template>
